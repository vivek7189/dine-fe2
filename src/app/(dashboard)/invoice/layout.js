'use client';

import { InvoiceToastProvider } from './contexts/InvoiceToastContext';
import InvoiceTopNav from './components/layout/InvoiceSidebar';

export default function InvoiceLayout({ children }) {
  return (
    <InvoiceToastProvider>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 'calc(100vh - 60px)' }}>
        <InvoiceTopNav />
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {children}
        </div>
      </div>
    </InvoiceToastProvider>
  );
}
