import { createContext, useContext, useState, useCallback } from 'react';
import * as RadixToast from '@radix-ui/react-toast';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 size={16} className="text-[hsl(var(--color-success))]" />,
    error: <AlertCircle size={16} className="text-[hsl(var(--color-error))]" />,
    info: <AlertCircle size={16} className="text-[hsl(var(--color-brand))]" />,
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      <RadixToast.Provider swipeDirection="right">
        {children}
        {toasts.map((t) => (
          <RadixToast.Root
            key={t.id}
            open
            onOpenChange={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className={clsx(
              'card flex items-start gap-3 p-4 w-80 data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full',
              'data-[state=open]:slide-in-from-right-full data-[state=open]:fade-in-80'
            )}
          >
            <span className="mt-0.5 shrink-0">{icons[t.type]}</span>
            <RadixToast.Description className="text-sm text-[hsl(var(--color-text))] flex-1">
              {t.message}
            </RadixToast.Description>
            <RadixToast.Close asChild>
              <button className="ml-auto p-0.5 rounded hover:bg-[hsl(var(--color-surface-alt2))] transition-colors">
                <X size={14} className="text-[hsl(var(--color-text-muted))]" />
              </button>
            </RadixToast.Close>
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport className="fixed bottom-4 right-4 flex flex-col gap-2 z-50 w-80" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}
