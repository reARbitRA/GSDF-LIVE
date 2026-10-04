import React, { useEffect } from 'react';

export type NotificationType = 'info' | 'warning' | 'success' | 'error';

export interface Notification {
  message: string;
  type: NotificationType;
}

interface NotificationBannerProps extends Notification {
  /** Called when the banner is dismissed (button or auto-dismiss). */
  onDismiss?: () => void;
  /** Auto-dismiss delay in ms; 0 disables. Errors never auto-dismiss. */
  autoDismissMs?: number;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ message, type, onDismiss, autoDismissMs = 4000 }) => {
  useEffect(() => {
    if (!onDismiss || autoDismissMs <= 0 || type === 'error') return;
    const t = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(t);
  }, [onDismiss, autoDismissMs, type, message]);

  const typeStyles: Record<NotificationType, string> = {
    info: 'bg-blue-900/60 border-blue-500/50 text-blue-100',
    warning: 'bg-amber-900/40 border-amber-500/50 text-amber-200',
    success: 'bg-emerald-900/40 border-emerald-500/50 text-emerald-200',
    error: 'bg-red-900/40 border-red-500/50 text-red-200',
  };

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={`flex items-center justify-between gap-4 p-3 rounded-md border text-sm font-mono ${typeStyles[type]}`}
    >
      <span>{message}</span>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss notification" className="px-2 hover:opacity-75">
          &times;
        </button>
      )}
    </div>
  );
};

export default NotificationBanner;
