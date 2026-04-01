'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InvoicePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/invoice/dashboard');
  }, [router]);
  return null;
}
