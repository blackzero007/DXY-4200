import { forwardRef } from 'react';
import type { ChainWord } from '@/types';

export interface ShareCardData {
  chainLength: number;
  score: number;
  startWord: string;
  highlightWords: string[];
  playerName: string;
  mode: 'solo' | 'room' | 'daily';
  date: string;
}

interface ShareCardProps {
  data: ShareCardData;
  className?: string;
}

function getHighlightWords(chain: ChainWord[], count: number = 3): string[] {
  const userWords = chain.filter(c => c.authorId !== 'system').map(c => c.word);
  const sorted = [...userWords].sort((a, b) => b.length - a.length);
  return sorted.slice(0, count);
}

export function prepareShareCardData(
  chain: ChainWord[],
  startWord: string,
  score: number,
  playerName: string,
  mode: 'solo' | 'room' | 'daily'
): ShareCardData {
  const highlightWords = getHighlightWords(chain, 3);
  const now = new Date();
  const date = `${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}`;
  
  return {
    chainLength: chain.length,
    score,
    startWord,
    highlightWords,
    playerName,
    mode,
    date,
  };
}

const DECORATION_EMOJIS = ['✨', '🌟', '💫', '⭐', '🎯', '🏆', '💎', '🌸', '🎪', '🎨'];

function getRandomEmojis(count: number): string[] {
  const shuffled = [...DECORATION_EMOJIS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(({ data, className = '' }, ref) => {
  const emojis = getRandomEmojis(6);
  const modeLabels = {
    solo: '单人模式',
    room: '对战模式',
    daily: '每日挑战',
  };

  return (
    <div
      ref={ref}
      className={`relative w-[480px] h-[640px] rounded-[2rem] overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, #1a1333 0%, #2d1b4e 50%, #1a1333 100%)',
      }}
    >
      <div
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[80px]"
        style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[-15%] right-[-10%] w-[65%] h-[65%] rounded-full blur-[80px]"
        style={{ background: 'radial-gradient(circle, rgba(236, 72, 153, 0.45) 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-[40%] right-[20%] w-[40%] h-[40%] rounded-full blur-[60px]"
        style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-[10%] left-[5%] text-3xl opacity-60 animate-bounce"
        style={{ animationDelay: '0s', animationDuration: '3s' }}
      >
        {emojis[0]}
      </div>
      <div
        className="absolute top-[15%] right-[8%] text-2xl opacity-50 animate-bounce"
        style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}
      >
        {emojis[1]}
      </div>
      <div
        className="absolute top-[35%] left-[3%] text-2xl opacity-40 animate-bounce"
        style={{ animationDelay: '1s', animationDuration: '3.5s' }}
      >
        {emojis[2]}
      </div>
      <div
        className="absolute bottom-[25%] right-[5%] text-3xl opacity-50 animate-bounce"
        style={{ animationDelay: '0.3s', animationDuration: '2.8s' }}
      >
        {emojis[3]}
      </div>
      <div
        className="absolute bottom-[15%] left-[8%] text-2xl opacity-40 animate-bounce"
        style={{ animationDelay: '0.8s', animationDuration: '3.2s' }}
      >
        {emojis[4]}
      </div>
      <div
        className="absolute top-[55%] right-[3%] text-xl opacity-30 animate-bounce"
        style={{ animationDelay: '1.2s', animationDuration: '2.6s' }}
      >
        {emojis[5]}
      </div>

      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 h-full flex flex-col p-8">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎮</div>
          <h1
            className="font-display text-3xl mb-1"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            脑洞大开 · 花式接词
          </h1>
          <p className="text-white/50 text-sm">{modeLabels[data.mode]} · {data.date}</p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
          <span className="text-amber-300 text-lg">🏆 战绩卡</span>
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
        </div>

        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(236, 72, 153, 0.3) 100%)',
              border: '2px solid rgba(139, 92, 246, 0.5)',
              boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)',
            }}
          >
            {data.score >= 20 ? '👑' : data.score >= 10 ? '🌟' : '✨'}
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-white/60 text-sm mb-1">玩家</p>
          <p className="font-display text-2xl text-white">{data.playerName}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div
            className="rounded-2xl p-4 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div className="text-purple-300 text-xs mb-1">🔗 词链长度</div>
            <div className="font-display text-3xl text-white">{data.chainLength}</div>
            <div className="text-white/40 text-xs">个词</div>
          </div>
          <div
            className="rounded-2xl p-4 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div className="text-pink-300 text-xs mb-1">⭐ 总得分</div>
            <div
              className="font-display text-3xl"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {data.score}
            </div>
            <div className="text-white/40 text-xs">分</div>
          </div>
        </div>

        <div
          className="rounded-2xl p-4 mb-6"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">💡</span>
            <span className="text-white/70 text-sm font-medium">亮点词汇</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.highlightWords.length > 0 ? (
              data.highlightWords.map((word, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(236, 72, 153, 0.25) 100%)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    color: '#e9d5ff',
                  }}
                >
                  {word}
                </span>
              ))
            ) : (
              <span className="text-white/40 text-sm">暂无亮点词汇</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-white/30 text-xs">
          <span>起始词:</span>
          <span
            className="px-2 py-0.5 rounded"
            style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd' }}
          >
            {data.startWord}
          </span>
        </div>

        <div className="mt-auto pt-4 text-center">
          <div className="flex items-center justify-center gap-2 text-white/30 text-xs">
            <span>🎯</span>
            <span>扫码或搜索「脑洞大开花式接词」来挑战我吧！</span>
          </div>
        </div>
      </div>
    </div>
  );
});

ShareCard.displayName = 'ShareCard';

export default ShareCard;
