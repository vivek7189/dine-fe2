'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { InventoryPDFDocument } from './InventoryPDFDocument';
import { FaDownload } from 'react-icons/fa';
import apiClient from '../../../../../lib/api';

export default function InventoryDownloadPDFButton({ reportType, data, org, logoUrl: logoUrlProp, filename, style }) {
  const [generating, setGenerating] = useState(false);

  async function handleDownload() {
    setGenerating(true);
    try {
      // Fetch fresh print settings to get latest logo
      let logoUrl = logoUrlProp || null;
      if (!logoUrl) {
        try {
          const rid = localStorage.getItem('selectedRestaurantId') || org?.id;
          if (rid) {
            const psRes = await apiClient.getPrintSettings(rid);
            if (psRes?.printSettings?.receiptLogo?.url) {
              logoUrl = psRes.printSettings.receiptLogo.url;
            }
          }
        } catch {}
      }
      // Also get restaurant name if org is empty
      const safeOrg = (org && org.name) ? org : (() => {
        try {
          const r = JSON.parse(localStorage.getItem('selectedRestaurant'));
          return r ? { name: r.name } : org;
        } catch { return org; }
      })();

      const blob = await pdf(
        <InventoryPDFDocument reportType={reportType} data={data} org={safeOrg} logoUrl={logoUrl} />
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
