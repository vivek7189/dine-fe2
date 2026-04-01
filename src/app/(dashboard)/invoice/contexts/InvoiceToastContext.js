'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import Toast from '../components/ui/Toast';

const InvoiceToastContext = createContext(null);

export function InvoiceToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = ++counterRef.current;
      const toast = { id, message, type, duration };
      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  return (
    <InvoiceToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </div>
    </InvoiceToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(InvoiceToastContext);
  if (!context) {
    throw new Error('useToast must be used within InvoiceToastProvider');
  }
  return context;
}
