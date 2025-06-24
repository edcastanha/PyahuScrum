import React, { useEffect } from 'react';
import { XCircle, CheckCircle, AlertCircle, Info } from 'lucide-react';
import styles from './Toast.module.css';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ 
  type, 
  message, 
  onClose, 
  duration = 5000 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className={styles.icon} />;
      case 'error':
        return <XCircle className={styles.icon} />;
      case 'warning':
        return <AlertCircle className={styles.icon} />;
      case 'info':
        return <Info className={styles.icon} />;
      default:
        return null;
    }
  };

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.content}>
        {renderIcon()}
        <p>{message}</p>
      </div>
      <button onClick={onClose} className={styles.closeButton}>
        <XCircle size={16} />
      </button>
    </div>
  );
};

export default Toast;
