import { AnimatePresence } from 'framer-motion';
import { useToast } from './useToast';
import { ToastItem } from './ToastItem';

export function ToastContainer() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-4 right-4 z-[9999] pointer-events-none"
    >
      <ul className="flex flex-col items-end gap-0 m-0 p-0 list-none max-h-[calc(100vh-2rem)] overflow-hidden">
        <AnimatePresence initial={false}>
          {toasts.map((toast, index) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              index={toasts.length - 1 - index}
              onDismiss={dismiss}
            />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
