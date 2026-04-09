'use client';

import dynamic from 'next/dynamic';

// Reuse the exact same customers page from the dashboard
// The mobile layout strips sidebar/header, so it renders full-width
const CustomersPage = dynamic(
  () => import('../../(dashboard)/customers/page'),
  { ssr: false }
);

export default function MobileCustomersPage() {
  return <CustomersPage />;
}
