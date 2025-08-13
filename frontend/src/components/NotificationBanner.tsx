import React, { useEffect } from 'react';
import { NotificationState } from '../types';

interface NotificationBannerProps {
  notification: NotificationState;
  onClose: (id: string) => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ 
  notification, 
  onClose, 
  autoClose = true, 
  autoCloseDelay = 5000 
}) => {
  // Auto-close notification after delay
  useEffect(() => {
    if (autoClose && notification.type !== 'error') {
      const timer = setTimeout(() => {
        onClose(notification.id);
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [notification.id, autoClose, autoCloseDelay, onClose, notification.type]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  const getBannerClass = () => {
    return `notification-banner ${notification.type}`;
  };

  const formatTimestamp = () => {
    return notification.timestamp.toLocaleTimeString();
  };

  return (
    <div className={getBannerClass()}>
      <div className="notification-content">
        <div className="notification-icon">
          {getIcon()}
        </div>
        <div className="notification-text">
          <div className="notification-title">
            {notification.title}
          </div>
          <div className="notification-message">
            {notification.message}
          </div>
          <div className="notification-timestamp">
            {formatTimestamp()}
          </div>
        </div>
      </div>

      <div className="notification-actions">
        {notification.actions?.map((action, index) => (
          <button
            key={index}
            className={`btn ${action.primary ? '' : 'btn-secondary'}`}
            onClick={action.action}
            style={{ 
              fontSize: '0.8rem', 
              padding: '0.5rem 1rem',
              minWidth: 'auto'
            }}
          >
            {action.label}
          </button>
        ))}
        
        <button
          className="notification-close"
          onClick={() => onClose(notification.id)}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default NotificationBanner;