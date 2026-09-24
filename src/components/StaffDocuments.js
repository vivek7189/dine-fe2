'use client';

import { useState, useRef } from 'react';
import { FaFileAlt, FaFilePdf, FaFileImage, FaTrash, FaUpload, FaExternalLinkAlt } from 'react-icons/fa';
import apiClient from '../lib/api';

/**
 * StaffDocuments — upload & manage a staff member's documents (ID, contract, etc).
 * Self-contained; files go to GCS via /api/staff/:staffId/documents.
 */
export default function StaffDocuments({ staffId, initialDocuments = [], canEdit = true, isMobile = false }) {
  const [docs, setDocs] = useState(Array.isArray(initialDocuments) ? initialDocuments : []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const onPick = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setError(''); setUploading(true);
    try {
      const fd = new FormData();
      fd.append('document', file);
      fd.append('name', file.name);
      const res = await apiClient.uploadStaffDocument(staffId, fd);
      setDocs(res.documents || []);
    } catch (err) {
      setError(err?.message || 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const remove = async (d) => {
    if (typeof window !== 'undefined' && !window.confirm(`Remove "${d.name}"?`)) return;
    setError('');
    try {
      const res = await apiClient.deleteStaffDocument(staffId, d.url);
      setDocs(res.documents || []);
    } catch (err) {
      setError(err?.message || 'Could not remove.');
    }
  };

  const iconFor = (t) => (t === 'application/pdf' ? <FaFilePdf color="#dc2626" /> : (t && t.startsWith('image/') ? <FaFileImage color="#2563eb" /> : <FaFileAlt color="#6b7280" />));

  return (
    <div style={{ backgroundColor: '#f8fafc', padding: isMobile ? '12px' : '16px', borderRadius: '12px', border: '1px solid #f1f5f9', marginTop: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h3 style={{ fontWeight: '600', color: '#1f2937', margin: 0, fontSize: isMobile ? '14px' : '16px' }}>Documents</h3>
        {canEdit && (
          <>
            <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={onPick} style={{ display: 'none' }} />
            <button onClick={() => fileRef.current && fileRef.current.click()} disabled={uploading} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, border: 'none', background: uploading ? '#93c5fd' : '#2563eb', color: '#fff', fontWeight: 700, fontSize: 12, cursor: uploading ? 'not-allowed' : 'pointer' }}>
              <FaUpload size={11} /> {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </>
        )}
      </div>

      {error && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '6px 10px', borderRadius: 6, fontSize: 12, marginBottom: 8 }}>{error}</div>}

      {docs.length === 0 ? (
        <div style={{ fontSize: 13, color: '#9ca3af' }}>No documents uploaded. (ID proof, contract, certificates…)</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {docs.map((d, i) => (
            <div key={d.url || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                {iconFor(d.type)}
                <span style={{ fontSize: 13, color: '#111827', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <a href={d.url} target="_blank" rel="noopener noreferrer" title="Open" style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', color: '#2563eb', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><FaExternalLinkAlt size={11} /></a>
                {canEdit && <button onClick={() => remove(d)} title="Remove" style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', color: '#b91c1c', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><FaTrash size={10} /></button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
