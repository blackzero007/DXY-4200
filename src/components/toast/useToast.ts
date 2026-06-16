import { useContext } from 'react';
import { ToastContext } from './types';
import type { ToastContextValue } from './types';

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
