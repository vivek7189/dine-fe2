'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { InvoicePDF } from './InvoicePDF';
import Button from '../ui/Button';
import { HiDownload } from 'react-icons/hi';

export default function DownloadPDFButton({ data, type = 'invoice', org = {}, colors = {}, template = 'standard', className }) {
  const [generating, setGenerating] = useState(false);

  async function handleDownload() {
    setGenerating(true);
    try {
      const blob = await pdf(
        <InvoicePDF data={data} type={type} org={org} colors={colors} template={template} />
      ).toBlob();
      const numberField = type === 'quote' ? data.quoteNumber : type === 'challan' ? data.challanNumber : data.invoiceNumber;
      const filename = `${numberField || type}.pdf`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
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
    <Button variant="outline" icon={HiDownload} loading={generating} onClick={handleDownload} className={className}>
      Download PDF
    </Button>
  );
}
