'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '../../lib/api';
import { FaPrint, FaUpload, FaWindows, FaApple, FaSpinner, FaArrowLeft, FaCheck, FaExclamationCircle } from 'react-icons/fa';

export default function DineOpenPrintUploadPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [windowsFile, setWindowsFile] = useState(null);
  const [macFile, setMacFile] = useState(null);
  const [uploadingWindows, setUploadingWindows] = useState(false);
  const [uploadingMac, setUploadingMac] = useState(false);
  const [message, setMessage] = useState({ type: null, text: null });

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('user');
        const authToken = localStorage.getItem('authToken');
        if (!userData || !authToken) {
          router.push('/login');
          return;
        }
        const user = JSON.parse(userData);
        if (user.role !== 'owner') {
          router.push('/admin');
          return;
        }
        setAuthorized(true);
      } catch (e) {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: null, text: null }), 5000);
  };

  const handleUploadWindows = async () => {
    if (!windowsFile) {
      showMessage('error', 'Please select a Windows (.exe) file.');
      return;
    }
    setUploadingWindows(true);
    setMessage({ type: null, text: null });
    try {
      const res = await apiClient.uploadPrintInstaller(windowsFile);
      if (res.success) {
        showMessage('success', 'Windows installer uploaded successfully.');
        setWindowsFile(null);
      } else {
        showMessage('error', res.error || 'Upload failed.');
      }
    } catch (err) {
      showMessage('error', err.message || 'Failed to upload Windows installer.');
    } finally {
      setUploadingWindows(false);
    }
  };

  const handleUploadMac = async () => {
    if (!macFile) {
      showMessage('error', 'Please select a Mac (.dmg) file.');
      return;
    }
    setUploadingMac(true);
    setMessage({ type: null, text: null });
    try {
      const res = await apiClient.uploadPrintInstaller(macFile);
      if (res.success) {
        showMessage('success', 'Mac installer uploaded successfully.');
        setMacFile(null);
      } else {
        showMessage('error', res.error || 'Upload failed.');
      }
    } catch (err) {
      showMessage('error', err.message || 'Failed to upload Mac installer.');
    } finally {
      setUploadingMac(false);
    }
  };

  if (!authorized) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <FaSpinner className="spin" size={32} style={{ color: '#ec4899' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #fdf2f8 0%, #f8fafc 100%)', padding: '24px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <Link
          href="/admin"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#6b7280',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '24px'
          }}
        >
          <FaArrowLeft size={14} />
          Back to Admin
        </Link>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          padding: '32px',
          border: '1px solid #fce7f3'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #ec4899, #db2777)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaPrint size={24} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                Upload KOT Printer installers
              </h1>
              <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '14px' }}>
                Upload .exe (Windows) and .dmg (Mac). Users will see download links in Admin → Print settings.
              </p>
            </div>
          </div>

          {message.text && (
            <div style={{
              marginTop: '20px',
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
              color: message.type === 'success' ? '#065f46' : '#991b1b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}>
              {message.type === 'success' ? <FaCheck size={16} /> : <FaExclamationCircle size={16} />}
              {message.text}
            </div>
          )}

          <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Windows */}
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '14px',
              padding: '20px',
              backgroundColor: '#fafafa'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <FaWindows size={22} style={{ color: '#0078d4' }} />
                <span style={{ fontWeight: '600', color: '#1f2937' }}>Windows (.exe)</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="file"
                  accept=".exe"
                  onChange={(e) => setWindowsFile(e.target.files?.[0] || null)}
                  style={{ fontSize: '14px' }}
                />
                <button
                  onClick={handleUploadWindows}
                  disabled={uploadingWindows || !windowsFile}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    background: (uploadingWindows || !windowsFile) ? '#e5e7eb' : 'linear-gradient(135deg, #ec4899, #db2777)',
                    color: (uploadingWindows || !windowsFile) ? '#9ca3af' : 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: (uploadingWindows || !windowsFile) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {uploadingWindows ? <FaSpinner className="spin" size={14} /> : <FaUpload size={14} />}
                  {uploadingWindows ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              {windowsFile && <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#6b7280' }}>{windowsFile.name}</p>}
            </div>

            {/* Mac */}
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '14px',
              padding: '20px',
              backgroundColor: '#fafafa'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <FaApple size={22} style={{ color: '#555' }} />
                <span style={{ fontWeight: '600', color: '#1f2937' }}>Mac (.dmg)</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="file"
                  accept=".dmg"
                  onChange={(e) => setMacFile(e.target.files?.[0] || null)}
                  style={{ fontSize: '14px' }}
                />
                <button
                  onClick={handleUploadMac}
                  disabled={uploadingMac || !macFile}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    background: (uploadingMac || !macFile) ? '#e5e7eb' : 'linear-gradient(135deg, #ec4899, #db2777)',
                    color: (uploadingMac || !macFile) ? '#9ca3af' : 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: (uploadingMac || !macFile) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {uploadingMac ? <FaSpinner className="spin" size={14} /> : <FaUpload size={14} />}
                  {uploadingMac ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              {macFile && <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#6b7280' }}>{macFile.name}</p>}
            </div>
          </div>

          <p style={{ marginTop: '24px', fontSize: '13px', color: '#6b7280' }}>
            After uploading, users can download the correct installer from <strong>Admin → Print Settings</strong>. The page will highlight the download for their platform (Windows or Mac).
          </p>
        </div>
      </div>
    </div>
  );
}
