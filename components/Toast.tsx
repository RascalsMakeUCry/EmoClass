'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, X, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <Check className="w-5 h-5" />,
    error: <X className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const styles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-amber-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  return createPortal(
    <div className="fixed top-4 right-4 z-[100] animate-slideInRight">
      <div
        className={`${styles[type]} px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md animate-fadeInScale`}
      >
        <div className="flex-shrink-0">{icons[type]}</div>
        <p className="flex-1 font-medium">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-80 transition-opacity"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>,
    document.body
  );
}
