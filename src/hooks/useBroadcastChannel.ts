import { useEffect, useRef, useCallback } from 'react';
import type { ChannelMessage, ChannelMessageType } from '@/types';
import { useRoomStore } from '@/store/useRoomStore';

export function useBroadcastChannel(roomId: string | null, enabled: boolean = true) {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const {
    localPlayerId,
    room,
    applyChannelMessage,
    updatePlayerActive,
  } = useRoomStore();

  const sendMessage = useCallback(
    (type: ChannelMessageType, payload: any) => {
      if (!channelRef.current || !enabled || !roomId) return;
      const msg: ChannelMessage = {
        type,
        payload,
        senderId: localPlayerId,
        timestamp: Date.now(),
      };
      try {
        channelRef.current.postMessage(msg);
      } catch (e) {
        console.warn('BroadcastChannel send failed:', e);
      }
    },
    [enabled, roomId, localPlayerId]
  );

  useEffect(() => {
    if (!enabled || !roomId) {
      return;
    }

    const channelName = `wordchain_room_${roomId}`;
    let channel: BroadcastChannel;

    try {
      channel = new BroadcastChannel(channelName);
    } catch (e) {
      console.warn('BroadcastChannel not supported:', e);
      return;
    }

    channelRef.current = channel;

    const handleMessage = (event: MessageEvent<ChannelMessage>) => {
      const msg = event.data;
      if (!msg || !msg.type) return;
      applyChannelMessage(msg);
    };

    channel.addEventListener('message', handleMessage);

    setTimeout(() => {
      sendMessage('request-sync', { roomId });
    }, 150);

    heartbeatRef.current = window.setInterval(() => {
      updatePlayerActive(localPlayerId);
      sendMessage('player-active', {
        room: useRoomStore.getState().room,
      });
    }, 5000);

    const handleBeforeUnload = () => {
      sendMessage('leave-room', { playerId: localPlayerId, room: useRoomStore.getState().room });
      try {
        const r = useRoomStore.getState().room;
        if (r) {
          const now = Date.now();
          const newPlayers = r.players.map(p =>
            p.id === localPlayerId ? { ...p, isOnline: false, lastActive: now } : p
          );
          try {
            localStorage.setItem(
              `wordchain_room_${r.id}`,
              JSON.stringify({ ...r, players: newPlayers })
            );
          } catch {}
        }
      } catch {}
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      handleBeforeUnload();
      channel.removeEventListener('message', handleMessage);
      channel.close();
      channelRef.current = null;
    };
  }, [enabled, roomId, localPlayerId, applyChannelMessage, sendMessage, updatePlayerActive]);

  useEffect(() => {
    if (!room || !enabled) return;
  }, [room, enabled]);

  const broadcast = useCallback(
    (type: ChannelMessageType, extraPayload?: any) => {
      const latestRoom = useRoomStore.getState().room;
      if (!latestRoom) return;
      const payload: any = {
        room: latestRoom,
        ...(extraPayload || {}),
      };
      const latestLastReaction = useRoomStore.getState().lastReaction;
      if (type === 'reaction' && latestLastReaction) {
        payload.lastReaction = latestLastReaction;
      }
      sendMessage(type, payload);
    },
    [sendMessage]
  );

  return { sendMessage, broadcast };
}
