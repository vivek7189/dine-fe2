'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaPrint, FaSpinner } from 'react-icons/fa';

/**
 * Base /dineopenprintupload – redirects to /dineopenprintupload/upload
 * so the upload page is at https://www.dineopen.com/dineopenprintupload/upload
 */
export default function DineOpenPrintUploadRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dineopenprintupload/upload');
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', flexDirection: 'column', gap: '16px' }}>
      <FaSpinner className="spin" size={32} style={{ color: '#ec4899' }} />
      <p style={{ color: '#6b7280', fontSize: '14px' }}>Redirecting to upload...</p>
      <Link href="/dineopenprintupload/upload" style={{ color: '#ec4899', fontWeight: '600', fontSize: '14px' }}>
        Go to Upload page
      </Link>
    </div>
  );
}
