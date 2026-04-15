'use client';

import { InvoiceToastProvider } from './contexts/InvoiceToastContext';
import InvoiceTopNav from './components/layout/InvoiceSidebar';

export default function InvoiceLayout({ children }) {
  const isMobileEmbed = typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__;

  return (
    <InvoiceToastProvider>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: isMobileEmbed ? 'auto' : 'calc(100vh - 60px)' }}>
        {!isMobileEmbed && <InvoiceTopNav />}
        <div style={{ flex: 1, overflow: 'auto', padding: isMobileEmbed ? '0' : '24px' }}>
          {children}
        </div>
      </div>
    </InvoiceToastProvider>
  );
}
