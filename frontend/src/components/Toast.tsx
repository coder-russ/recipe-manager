import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  action?: { label: string; onClick: () => void };
  duration?: number;
  onDismiss: () => void;
}

export default function Toast({ message, action, duration = 5000, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-text-primary text-cream px-5 py-3 rounded-xl shadow-lg flex items-center gap-4 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <span className="text-sm font-medium">{message}</span>
      {action && (
        <button
          onClick={() => {
            action.onClick();
            onDismiss();
          }}
          className="text-terracotta hover:text-terracotta-dark font-bold text-sm cursor-pointer underline underline-offset-2 shrink-0 min-h-[44px] flex items-center"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
