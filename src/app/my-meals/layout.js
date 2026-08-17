'use client';
// Employee self-service shell — a lean, mobile-first container (NOT the operator console).
// Employees reach this after phone-OTP login; the page resolves them by their phone.
import { ToastProvider } from '../../components/corporate/ui';
import { C } from '../../corporate/theme';

export default function MyMealsLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: C.surface2 }}>
      <ToastProvider>{children}</ToastProvider>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
