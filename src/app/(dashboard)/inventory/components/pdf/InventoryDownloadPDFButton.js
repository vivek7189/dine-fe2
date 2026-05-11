'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { InventoryPDFDocument } from './InventoryPDFDocument';
import { FaDownload } from 'react-icons/fa';

export default function InventoryDownloadPDFButton({ reportType, data, org, logoUrl, filename, style }) {
  const [generating, setGenerating] = useState(false);

  async function handleDownload() {
    setGenerating(true);
    try {
      const blob = await pdf(
        <InventoryPDFDocument reportType={reportType} data={data} org={org} logoUrl={logoUrl} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `${reportType}-report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={generating}
      style={{
        padding: '8px 14px',
        background: generating ? '#d1d5db' : 'linear-gradient(135deg, #059669, #10b981)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: 600,
        cursor: generating ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.15s',
        boxShadow: '0 1px 4px rgba(5,150,105,0.2)',
        ...style,
      }}
    >
      <FaDownload size={11} />
      {generating ? 'Generating...' : 'Export PDF'}
    </button>
  );
}
