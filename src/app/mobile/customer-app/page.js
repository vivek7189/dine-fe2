'use client';

import dynamic from 'next/dynamic';

const CustomerAppPage = dynamic(
  () => import('../../(dashboard)/customer-app/page'),
  { ssr: false }
);

export default function MobileCustomerAppPage() {
  return <CustomerAppPage />;
}
