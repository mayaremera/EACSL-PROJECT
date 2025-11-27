import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Toast from '../components/ui/Toast';
import { setToastInstance } from '../utils/toastHelper';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, options = {}) => {
    const {
      type = 'info',
      title = null,
      duration = 5000,
    } = options;

    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type,
      title,
      duration,
    };

    setToasts((prev) => [...prev, toast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message, options = {}) => {
    return showToast(message, { ...options, type: 'success' });
  }, [showToast]);

  const error = useCallback((message, options = {}) => {
    return showToast(message, { ...options, type: 'error', duration: 7000 });
  }, [showToast]);

  const warning = useCallback((message, options = {}) => {
    return showToast(message, { ...options, type: 'warning', duration: 6000 });
  }, [showToast]);

  const info = useCallback((message, options = {}) => {
    return showToast(message, { ...options, type: 'info' });
  }, [showToast]);

  const toastMethods = { showToast, removeToast, success, error, warning, info };

  useEffect(() => {
    setToastInstance(toastMethods);
  }, [toastMethods]);

  return (
    <ToastContext.Provider value={toastMethods}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

