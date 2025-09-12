import React from 'react';

interface NotificationBannerProps {
  message: string;
  type: 'info' | 'warning' | 'success';
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ message, type }) => {
  const baseStyle = "p-4 rounded-md text-center font-semibold";
  const typeStyles = {
    info: 'bg-secondary text-white',
    warning: 'bg-warning text-black',
    success: 'bg-primary text-black',
  };

  return (
    <div className={`${baseStyle} ${typeStyles[type]}`}>
      {message}
    </div>
  );
};

export default NotificationBanner;
