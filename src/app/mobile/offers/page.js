'use client';

import dynamic from 'next/dynamic';

const OffersPage = dynamic(
  () => import('../../(dashboard)/offers/page'),
  { ssr: false }
);

export default function MobileOffersPage() {
  return <OffersPage />;
}
