
import { useState, useCallback } from "react";

const toastStore = {
  toasts: [] as Toast[],
  listeners: new Set<() => void>(),
  notify(toast: Toast) {
    this.toasts = [...this.toasts, toast];
    this.listeners.forEach((listener) => listener());
    if (toast.duration !== Infinity) {
      setTimeout(() => {
        this.dismiss(toast.id);
      }, toast.duration || 5000);
    }
  },
  dismiss(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  },
};

export type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
  duration?: number;
};

export type Toast = ToastProps & {
  id: string;
};

export function toast(props: ToastProps) {
  const id = Math.random().toString(36).slice(2);
  toastStore.notify({ id, ...props });
  return {
    id,
    dismiss: () => toastStore.dismiss(id),
  };
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(toastStore.toasts);

  const subscribe = useCallback(() => {
    return toastStore.subscribe(() => {
      setToasts([...toastStore.toasts]);
    });
  }, []);

  useState(() => {
    const unsubscribe = subscribe();
    return unsubscribe;
  });

  return {
    toasts,
    toast,
    dismiss: (id: string) => toastStore.dismiss(id),
  };
}
