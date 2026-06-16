import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { ToastContext } from './types';
import type { Toast, ToastType, ToastContextValue } from './types';

const DEFAULT_DURATION = 3000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timerRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
    const timer = timerRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timerRef.current.delete(id);
    }
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
    timerRef.current.forEach(timer => clearTimeout(timer));
    timerRef.current.clear();
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration: number = DEFAULT_DURATION) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const newToast: Toast = { id, type, message, duration };

      setToasts(prev => [...prev, newToast]);

      const timer = setTimeout(() => {
        dismiss(id);
      }, duration);
      timerRef.current.set(id, timer);

      return id;
    },
    [dismiss]
  );

  const success = useCallback(
    (message: string, duration?: number) => addToast('success', message, duration),
    [addToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => addToast('error', message, duration),
    [addToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => addToast('warning', message, duration),
    [addToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => addToast('info', message, duration),
    [addToast]
  );

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, success, error, warning, info, dismiss, clearAll }),
    [toasts, success, error, warning, info, dismiss, clearAll]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
