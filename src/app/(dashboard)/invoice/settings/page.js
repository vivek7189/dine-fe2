'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import apiClient from '../../../../lib/api';
import { useToast } from '../contexts/InvoiceToastContext';
import PageHeader from '../components/layout/PageHeader';
import Tabs from '../components/ui/Tabs';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { HiCheck, HiEye } from 'react-icons/hi';
import useInvoiceAI from '../hooks/useInvoiceAI';
import SparkleIcon from '../components/ai/SparkleIcon';
import { InvoicePDF } from '../components/pdf/InvoicePDF';
import { sampleInvoiceData, sampleOrg } from '../components/pdf/sampleData';

const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFViewer),
  { ssr: false, loading: () => <div className="w-full h-[500px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center"><span className="text-gray-400 text-sm">Loading preview...</span></div> }
);

const settingsTabs = [
  { key: 'general', label: 'General' },
  { key: 'invoice', label: 'Invoice' },
  { key: 'tax', label: 'Tax' },
  { key: 'templates', label: 'Templates' },
];

const paymentTermsOptions = [
  { value: '', label: 'Select payment terms' },
  { value: 'due_on_receipt', label: 'Due on Receipt' },
  { value: 'net_7', label: 'Net 7' },
  { value: 'net_15', label: 'Net 15' },
  { value: 'net_30', label: 'Net 30' },
  { value: 'net_45', label: 'Net 45' },
  { value: 'net_60', label: 'Net 60' },
  { value: 'custom', label: 'Custom' },
];

const taxTypeOptions = [
  { value: '', label: 'Select tax type' },
  { value: 'gst', label: 'GST' },
  { value: 'igst', label: 'IGST' },
];

const templateOptions = [
  { key: 'standard', name: 'Standard', description: 'Clean professional layout' },
  { key: 'modern', name: 'Modern', description: 'Minimal, no borders' },
  { key: 'bold', name: 'Bold', description: 'Typewriter ledger style' },
  { key: 'elegant', name: 'Elegant', description: 'Accent bar, centered header' },
  { key: 'spreadsheet', name: 'Spreadsheet', description: 'Dense data-focused table' },
  { key: 'compact', name: 'Compact', description: 'Receipt-style minimal' },
  { key: 'classic', name: 'Classic', description: 'Traditional warm style' },
  { key: 'creative', name: 'Creative', description: 'Asymmetric modern design' },
];

function TemplateThumbnail({ templateKey, bg, label, font }) {
  const b = bg || '#ffffff';
  const l = label || '#6b7280';
  const f = font || '#111827';
  const withAlpha = (color, alpha) => color + Math.round(alpha * 255).toString(16).padStart(2, '0');
  const fMuted = withAlpha(f, 0.15);
  const fLight = withAlpha(f, 0.08);
  const lMuted = withAlpha(l, 0.2);
  const lLight = withAlpha(l, 0.1);

  const base = {
    aspectRatio: '3/4', backgroundColor: b, borderRadius: '6px', border: '1px solid #e5e7eb',
    padding: '10px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
    fontSize: '3.5px', fontFamily: 'system-ui, sans-serif', color: f, lineHeight: 1.3,
  };

  const txt = (size, color, weight) => ({ fontSize: size || '3.5px', color: color || f, fontWeight: weight || 400, whiteSpace: 'nowrap', overflow: 'hidden' });
  const lbl = (size) => ({ fontSize: size || '2.8px', color: l, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' });

  const items3 = [['Butter Chicken', '2', '350', '700'], ['Naan', '4', '60', '240'], ['Dal Makhani', '1', '280', '280']];

  // Standard
  if (templateKey === 'standard') {
    return (
      <div style={base}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div>
            <div style={txt('4.5px', f, 700)}>Acme Corp</div>
            <div style={txt('2.5px', fMuted)}>123 Main Street</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={txt('6px', l, 800)}>INVOICE</div>
            <div style={txt('2.5px', fMuted)}>#INV-001</div>
          </div>
        </div>
        <div style={{ marginBottom: '6px' }}>
          <div style={lbl()}>Bill To</div>
          <div style={txt('3.5px', f, 600)}>John Doe</div>
        </div>
        <div style={{ marginBottom: '6px', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', gap: '2px', padding: '3px 2px', backgroundColor: lLight, borderRadius: '2px', marginBottom: '2px' }}>
            <div style={lbl('2.5px')}>Item</div>
            <div style={{ ...lbl('2.5px'), textAlign: 'right' }}>Qty</div>
            <div style={{ ...lbl('2.5px'), textAlign: 'right' }}>Rate</div>
            <div style={{ ...lbl('2.5px'), textAlign: 'right' }}>Amt</div>
          </div>
          {items3.map(([item, qty, rate, amt], i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', gap: '2px', padding: '2.5px 2px', borderBottom: `0.5px solid ${fLight}` }}>
              <div style={txt('3px', f, 500)}>{item}</div>
              <div style={{ ...txt('3px', fMuted), textAlign: 'right' }}>{qty}</div>
              <div style={{ ...txt('3px', fMuted), textAlign: 'right' }}>{rate}</div>
              <div style={{ ...txt('3px', f, 600), textAlign: 'right' }}>{amt}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '55%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5px 0' }}>
              <span style={txt('2.8px', fMuted)}>Subtotal</span><span style={txt('2.8px', f)}>1,220</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2.5px 0', borderTop: `1px solid ${l}`, marginTop: '2px' }}>
              <span style={txt('3.5px', l, 700)}>Total</span><span style={txt('3.5px', f, 800)}>₹1,281</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modern — No borders, pill badge
  if (templateKey === 'modern') {
    return (
      <div style={base}>
        <div style={{ marginBottom: '8px' }}>
          <div style={txt('5px', f, 800)}>Acme Corp</div>
          <div style={{ display: 'inline-block', padding: '1.5px 4px', backgroundColor: withAlpha(l, 0.15), borderRadius: '3px', marginTop: '3px' }}>
            <span style={txt('2.8px', l, 700)}>INV-001</span>
          </div>
        </div>
        <div style={{ marginBottom: '6px' }}>
          <div style={lbl()}>Bill To</div>
          <div style={txt('3.2px', f, 600)}>John Doe</div>
        </div>
        <div style={{ flex: 1, marginBottom: '4px' }}>
          {items3.map(([item, qty, , amt], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 2px', backgroundColor: i % 2 === 0 ? 'transparent' : withAlpha(f, 0.03), borderRadius: '2px' }}>
              <span style={txt('3px', f, 500)}>{item} x{qty}</span>
              <span style={txt('3px', f, 600)}>{amt}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '50%', padding: '3px 4px', backgroundColor: withAlpha(l, 0.08), borderRadius: '3px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={txt('3.5px', l, 700)}>Total</span><span style={txt('3.5px', f, 800)}>₹1,281</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Bold — Courier, full grid
  if (templateKey === 'bold') {
    return (
      <div style={{ ...base, fontFamily: 'monospace', padding: '8px' }}>
        <div style={{ textAlign: 'center', marginBottom: '6px', paddingBottom: '4px', borderBottom: `2px solid ${f}` }}>
          <div style={txt('6px', f, 900)}>INVOICE</div>
          <div style={txt('2.5px', fMuted)}>#INV-001 | 01 Apr 2026</div>
        </div>
        <div style={{ marginBottom: '5px' }}>
          <div style={txt('3px', f, 700)}>Acme Corp</div>
          <div style={{ ...lbl('2.2px'), marginTop: '3px' }}>Bill To:</div>
          <div style={txt('3px', f, 600)}>John Doe</div>
        </div>
        <div style={{ flex: 1, marginBottom: '4px', border: `1px solid ${f}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr', padding: '2px', backgroundColor: l }}>
            <div style={txt('2.5px', b, 700)}>Item</div>
            <div style={{ ...txt('2.5px', b, 700), textAlign: 'right' }}>Qty</div>
            <div style={{ ...txt('2.5px', b, 700), textAlign: 'right' }}>Amt</div>
          </div>
          {items3.map(([item, qty, , amt], i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr', padding: '2px', borderBottom: `0.5px solid ${fMuted}` }}>
              <div style={txt('2.5px', f, 500)}>{item}</div>
              <div style={{ ...txt('2.5px', fMuted), textAlign: 'right' }}>{qty}</div>
              <div style={{ ...txt('2.5px', f, 600), textAlign: 'right' }}>{amt}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ border: `1px solid ${f}`, padding: '2px 3px', display: 'flex', gap: '6px' }}>
            <span style={txt('3px', f, 700)}>TOTAL</span><span style={txt('3px', f, 900)}>₹1,281</span>
          </div>
        </div>
      </div>
    );
  }

  // Elegant — Accent sidebar
  if (templateKey === 'elegant') {
    return (
      <div style={{ ...base, flexDirection: 'row', padding: 0, gap: 0 }}>
        <div style={{ width: '5px', backgroundColor: l, borderRadius: '6px 0 0 6px', flexShrink: 0 }} />
        <div style={{ flex: 1, padding: '10px 10px 10px 8px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ textAlign: 'center', marginBottom: '6px', paddingBottom: '4px', borderBottom: `0.5px solid ${lMuted}` }}>
            <div style={txt('5px', f, 800)}>Acme Corp</div>
            <div style={txt('2px', fMuted)}>Fine Dining & Catering</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div><div style={lbl('2.5px')}>Invoice To</div><div style={txt('3px', f, 600)}>John Doe</div></div>
            <div style={{ textAlign: 'right' }}><div style={lbl('2.5px')}>Invoice #</div><div style={txt('3px', f, 600)}>INV-001</div></div>
          </div>
          <div style={{ flex: 1, marginBottom: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1.2fr', padding: '2.5px 3px', borderTop: `1px solid ${l}`, borderBottom: `1px solid ${l}` }}>
              <div style={lbl('2.5px')}>Description</div>
              <div style={{ ...lbl('2.5px'), textAlign: 'center' }}>Qty</div>
              <div style={{ ...lbl('2.5px'), textAlign: 'right' }}>Amount</div>
            </div>
            {items3.map(([item, qty, , amt], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1.2fr', padding: '2.5px 3px', borderBottom: `0.5px solid ${fLight}` }}>
                <div style={txt('3px', f, 500)}>{item}</div>
                <div style={{ ...txt('3px', fMuted), textAlign: 'center' }}>{qty}</div>
                <div style={{ ...txt('3px', f, 600), textAlign: 'right' }}>{amt}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '50%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px', borderTop: `1.5px solid ${l}` }}>
                <span style={txt('3.5px', l, 700)}>Total</span><span style={txt('3.5px', f, 800)}>₹1,281</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Spreadsheet — Dense 6-col
  if (templateKey === 'spreadsheet') {
    return (
      <div style={base}>
        <div style={{ backgroundColor: l, borderRadius: '2px', padding: '4px 5px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={txt('5px', b, 800)}>INVOICE</div>
          <div style={txt('2.5px', withAlpha(b, 0.7))}>#INV-001</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
          <div><div style={lbl('2.5px')}>From</div><div style={txt('3px', f, 600)}>Acme Corp</div></div>
          <div><div style={lbl('2.5px')}>Bill To</div><div style={txt('3px', f, 600)}>John Doe</div></div>
        </div>
        <div style={{ flex: 1, marginBottom: '4px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '0.5fr 2.5fr 0.8fr 1fr 1fr 1.2fr', gap: '1px', padding: '2.5px 2px', backgroundColor: l, borderRadius: '2px 2px 0 0' }}>
            {['#', 'Item', 'Qty', 'Rate', 'Tax', 'Amt'].map(h => (
              <div key={h} style={{ fontSize: '2.3px', color: b, fontWeight: 700, textAlign: h === 'Item' ? 'left' : 'right' }}>{h}</div>
            ))}
          </div>
          {[['1', 'Butter Chicken', '2', '350', '35', '735'], ['2', 'Naan', '4', '60', '12', '252'], ['3', 'Dal Makhani', '1', '280', '14', '294']].map(([sno, item, qty, rate, tax, amt], i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '0.5fr 2.5fr 0.8fr 1fr 1fr 1.2fr', gap: '1px', padding: '2px', borderBottom: `0.5px solid ${fLight}`, backgroundColor: i % 2 === 0 ? 'transparent' : lLight }}>
              <div style={{ ...txt('2.5px', fMuted), textAlign: 'right' }}>{sno}</div>
              <div style={txt('2.5px', f, 500)}>{item}</div>
              <div style={{ ...txt('2.5px', fMuted), textAlign: 'right' }}>{qty}</div>
              <div style={{ ...txt('2.5px', fMuted), textAlign: 'right' }}>{rate}</div>
              <div style={{ ...txt('2.5px', fMuted), textAlign: 'right' }}>{tax}</div>
              <div style={{ ...txt('2.5px', f, 600), textAlign: 'right' }}>{amt}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '50%', padding: '2px', backgroundColor: lLight, borderRadius: '1px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={txt('3px', l, 700)}>Total</span><span style={txt('3px', f, 800)}>₹1,281</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Compact — Receipt style
  if (templateKey === 'compact') {
    return (
      <div style={{ ...base, padding: '8px' }}>
        <div style={{ backgroundColor: lLight, borderRadius: '3px', padding: '5px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={txt('4px', f, 700)}>Acme Corp</div>
          <div style={{ ...txt('3px', l, 700), backgroundColor: withAlpha(l, 0.15), padding: '1.5px 3px', borderRadius: '1.5px' }}>INV-001</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', paddingBottom: '4px', borderBottom: `0.5px solid ${fLight}` }}>
          <div><div style={lbl('2.2px')}>Bill To</div><div style={txt('3px', f, 600)}>John Doe</div></div>
          <div style={{ textAlign: 'right' }}><div style={lbl('2.2px')}>Date</div><div style={txt('3px', f)}>01 Apr 2026</div></div>
        </div>
        <div style={{ flex: 1, marginBottom: '4px' }}>
          {[['Butter Chicken x2', '700'], ['Naan x4', '240'], ['Dal Makhani x1', '280']].map(([item, amt], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: i < 2 ? `0.3px solid ${fLight}` : 'none' }}>
              <span style={txt('2.8px', f, 500)}>{item}</span><span style={txt('2.8px', f, 600)}>{amt}</span>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${l}`, paddingTop: '3px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2.5px 4px', backgroundColor: lLight, borderRadius: '2px' }}>
            <span style={txt('3.5px', l, 700)}>Total</span><span style={txt('3.5px', f, 800)}>₹1,220</span>
          </div>
        </div>
      </div>
    );
  }

  // Classic — Bordered boxes, warm
  if (templateKey === 'classic') {
    return (
      <div style={base}>
        <div style={{ padding: '4px 5px', backgroundColor: withAlpha(l, 0.12), borderRadius: '3px', marginBottom: '6px', textAlign: 'center' }}>
          <div style={txt('5px', f, 800)}>Acme Corp</div>
          <div style={txt('2px', fMuted)}>123 Main Street | +91 98765</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '6px' }}>
          <div style={{ border: `0.5px solid ${lMuted}`, borderRadius: '2px', padding: '3px' }}>
            <div style={lbl('2.2px')}>Bill To</div>
            <div style={txt('3px', f, 600)}>John Doe</div>
          </div>
          <div style={{ border: `0.5px solid ${lMuted}`, borderRadius: '2px', padding: '3px' }}>
            <div style={lbl('2.2px')}>Invoice #</div>
            <div style={txt('3px', f, 600)}>INV-001</div>
            <div style={txt('2px', fMuted)}>01 Apr 2026</div>
          </div>
        </div>
        <div style={{ flex: 1, marginBottom: '4px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1.2fr', padding: '2.5px 2px', backgroundColor: l, borderRadius: '2px 2px 0 0' }}>
            <div style={txt('2.5px', b, 700)}>Item</div>
            <div style={{ ...txt('2.5px', b, 700), textAlign: 'right' }}>Qty</div>
            <div style={{ ...txt('2.5px', b, 700), textAlign: 'right' }}>Amount</div>
          </div>
          {items3.map(([item, qty, , amt], i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1.2fr', padding: '2px', borderBottom: `0.5px solid ${fLight}` }}>
              <div style={txt('2.5px', f, 500)}>{item}</div>
              <div style={{ ...txt('2.5px', fMuted), textAlign: 'right' }}>{qty}</div>
              <div style={{ ...txt('2.5px', f, 600), textAlign: 'right' }}>{amt}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '50%', border: `0.5px solid ${lMuted}`, borderRadius: '2px', padding: '2px 3px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={txt('3px', l, 700)}>Total</span><span style={txt('3px', f, 800)}>₹1,281</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Creative — Decorative circle, asymmetric
  return (
    <div style={{ ...base, position: 'relative' }}>
      <div style={{ position: 'absolute', top: '-8px', right: '-8px', width: '30px', height: '30px', borderRadius: '50%', backgroundColor: withAlpha(l, 0.15) }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div>
          <div style={txt('4px', f, 700)}>Acme Corp</div>
          <div style={txt('2px', fMuted)}>hello@acme.co</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={txt('7px', f, 800)}>INVOICE</div>
          <div style={txt('2.5px', l)}>INV-001</div>
        </div>
      </div>
      <div style={{ height: '2.5px', backgroundColor: l, marginBottom: '6px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div>
          <div style={{ ...lbl('2.2px'), borderBottom: `1px solid ${l}`, paddingBottom: '2px', marginBottom: '3px' }}>From</div>
          <div style={txt('3px', f, 600)}>Acme Corp</div>
        </div>
        <div>
          <div style={{ ...lbl('2.2px'), borderBottom: `1px solid ${l}`, paddingBottom: '2px', marginBottom: '3px' }}>Bill To</div>
          <div style={txt('3px', f, 600)}>John Doe</div>
        </div>
      </div>
      <div style={{ flex: 1, marginBottom: '4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1.2fr', padding: '2.5px 2px', borderBottom: `0.5px solid ${withAlpha(l, 0.4)}` }}>
          <div style={lbl('2.5px')}>Description</div>
          <div style={{ ...lbl('2.5px'), textAlign: 'right' }}>Qty</div>
          <div style={{ ...lbl('2.5px'), textAlign: 'right' }}>Amount</div>
        </div>
        {items3.map(([item, qty, , amt], i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1.2fr', padding: '2.5px 2px', borderBottom: `0.5px solid ${withAlpha(l, 0.15)}` }}>
            <div style={txt('3px', f, 500)}>{item}</div>
            <div style={{ ...txt('3px', fMuted), textAlign: 'right' }}>{qty}</div>
            <div style={{ ...txt('3px', f, 600), textAlign: 'right' }}>{amt}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ padding: '3px 5px', backgroundColor: l, borderRadius: '2px', display: 'flex', gap: '8px' }}>
          <span style={txt('3.5px', b, 700)}>Total</span><span style={txt('3.5px', b, 800)}>₹1,281</span>
        </div>
      </div>
    </div>
  );
}

const presetColors = [
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Teal', hex: '#14b8a6' },
];

export default function SettingsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('general');

  // General
  const [generalLoading, setGeneralLoading] = useState(true);
  const [generalSaving, setGeneralSaving] = useState(false);
  const [general, setGeneral] = useState({
    organizationName: '',
    email: '',
    phone: '',
    address: '',
    gstin: '',
    pan: '',
  });

  // Invoice
  const [invoiceLoading, setInvoiceLoading] = useState(true);
  const [invoiceSaving, setInvoiceSaving] = useState(false);
  const [invoiceSettings, setInvoiceSettings] = useState({
    invoicePrefix: 'INV-',
    invoiceStartingNumber: 1,
    quotePrefix: 'QT-',
    challanPrefix: 'DC-',
    defaultPaymentTerms: 'due_on_receipt',
    defaultCustomerNotes: '',
    defaultTermsAndConditions: '',
  });

  // Tax
  const [taxSaving, setTaxSaving] = useState(false);
  const [taxSettings, setTaxSettings] = useState({
    enableTax: false,
    defaultTaxRate: '',
    taxType: '',
  });

  // Templates
  const [templateSaving, setTemplateSaving] = useState(false);
  const [templateSettings, setTemplateSettings] = useState({
    selectedTemplate: 'standard',
    pdfBackgroundColor: '#ffffff',
    pdfLabelColor: '#6b7280',
    pdfFontColor: '#111827',
  });

  // AI Auto-Style
  const { generate: aiGenerate, isGenerating: aiStyleLoading } = useInvoiceAI();
  const [brandUrl, setBrandUrl] = useState('');
  const [brandDescription, setBrandDescription] = useState('');
  const [styleSuggestion, setStyleSuggestion] = useState(null);

  async function handleAutoStyle() {
    const result = await aiGenerate('suggest-style', {
      websiteUrl: brandUrl,
      brandDescription: brandDescription,
    });
    if (result) setStyleSuggestion(result);
  }

  function applyAISuggestion() {
    if (!styleSuggestion) return;
    setTemplateSettings({
      selectedTemplate: styleSuggestion.template || 'standard',
      pdfBackgroundColor: styleSuggestion.backgroundColor || '#ffffff',
      pdfLabelColor: styleSuggestion.labelColor || '#6b7280',
      pdfFontColor: styleSuggestion.fontColor || '#111827',
    });
    setStyleSuggestion(null);
    setBrandUrl('');
    setBrandDescription('');
    showToast('AI style applied! Click Save to keep these settings.', 'success');
  }

  // Fetch General Settings
  useEffect(() => {
    async function fetchOrg() {
      try {
        const org = await apiClient.getInvoiceOrg();
        setGeneral({
          organizationName: org.name || '',
          email: org.email || '',
          phone: org.phone || '',
          address: org.address || '',
          gstin: org.gstin || '',
          pan: org.pan || '',
        });
      } catch {
        // Use defaults
      } finally {
        setGeneralLoading(false);
      }
    }
    fetchOrg();
  }, []);

  // Fetch Invoice/Tax/Template Settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        const s = await apiClient.getInvoiceSettings();
        setInvoiceSettings({
          invoicePrefix: s.invoiceNumberPrefix || 'INV-',
          invoiceStartingNumber: s.invoiceStartNumber || 1,
          quotePrefix: s.quoteNumberPrefix || 'QT-',
          challanPrefix: s.challanNumberPrefix || 'DC-',
          defaultPaymentTerms: s.defaultPaymentTerms || 'due_on_receipt',
          defaultCustomerNotes: s.defaultCustomerNotes || '',
          defaultTermsAndConditions: s.defaultTermsAndConditions || '',
        });
        setTaxSettings({
          enableTax: s.taxSettings?.enabled || false,
          defaultTaxRate: s.taxSettings?.defaultRate || '',
          taxType: s.taxSettings?.type || '',
        });
        setTemplateSettings({
          selectedTemplate: s.pdfTemplate || 'standard',
          pdfBackgroundColor: s.pdfColors?.background || '#ffffff',
          pdfLabelColor: s.pdfColors?.label || '#6b7280',
          pdfFontColor: s.pdfColors?.font || '#111827',
        });
      } catch {
        // Use defaults
      } finally {
        setInvoiceLoading(false);
      }
    }
    fetchSettings();
  }, []);

  async function saveGeneral() {
    setGeneralSaving(true);
    try {
      await apiClient.updateInvoiceOrg({
        name: general.organizationName,
        email: general.email,
        phone: general.phone,
        address: general.address,
        gstin: general.gstin,
        pan: general.pan,
      });
      showToast('Organization settings saved', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setGeneralSaving(false);
    }
  }

  async function saveInvoiceSettings() {
    setInvoiceSaving(true);
    try {
      await apiClient.updateInvoiceSettings({
        invoiceNumberPrefix: invoiceSettings.invoicePrefix,
        invoiceStartNumber: parseInt(invoiceSettings.invoiceStartingNumber) || 1,
        quoteNumberPrefix: invoiceSettings.quotePrefix,
        challanNumberPrefix: invoiceSettings.challanPrefix,
        defaultPaymentTerms: invoiceSettings.defaultPaymentTerms,
        defaultCustomerNotes: invoiceSettings.defaultCustomerNotes,
        defaultTermsAndConditions: invoiceSettings.defaultTermsAndConditions,
      });
      showToast('Invoice settings saved', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setInvoiceSaving(false);
    }
  }

  async function saveTaxSettings() {
    setTaxSaving(true);
    try {
      await apiClient.updateInvoiceSettings({
        taxSettings: {
          enabled: taxSettings.enableTax,
          defaultRate: parseFloat(taxSettings.defaultTaxRate) || 0,
          type: taxSettings.taxType,
        },
      });
      showToast('Tax settings saved', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setTaxSaving(false);
    }
  }

  async function saveTemplateSettings() {
    setTemplateSaving(true);
    try {
      await apiClient.updateInvoiceSettings({
        pdfTemplate: templateSettings.selectedTemplate,
        pdfColors: {
          background: templateSettings.pdfBackgroundColor,
          label: templateSettings.pdfLabelColor,
          font: templateSettings.pdfFontColor,
        },
      });
      showToast('Template settings saved', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setTemplateSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />

      <Tabs tabs={settingsTabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {/* General Tab */}
        {activeTab === 'general' && (
          <Card title="Organization Details">
            {generalLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Organization Name"
                    value={general.organizationName}
                    onChange={(e) =>
                      setGeneral((prev) => ({ ...prev, organizationName: e.target.value }))
                    }
                    placeholder="Your business name"
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={general.email}
                    onChange={(e) =>
                      setGeneral((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="business@example.com"
                  />
                  <Input
                    label="Phone"
                    value={general.phone}
                    onChange={(e) =>
                      setGeneral((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="+91 XXXXX XXXXX"
                  />
                  <Input
                    label="GSTIN"
                    value={general.gstin}
                    onChange={(e) =>
                      setGeneral((prev) => ({ ...prev, gstin: e.target.value }))
                    }
                    placeholder="22AAAAA0000A1Z5"
                  />
                  <Input
                    label="PAN"
                    value={general.pan}
                    onChange={(e) =>
                      setGeneral((prev) => ({ ...prev, pan: e.target.value }))
                    }
                    placeholder="AAAAA0000A"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={general.address}
                    onChange={(e) =>
                      setGeneral((prev) => ({ ...prev, address: e.target.value }))
                    }
                    placeholder="Business address"
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400 resize-none"
                  />
                </div>
                <div className="mt-6 flex justify-end">
                  <Button loading={generalSaving} onClick={saveGeneral}>
                    Save
                  </Button>
                </div>
              </>
            )}
          </Card>
        )}

        {/* Invoice Tab */}
        {activeTab === 'invoice' && (
          <Card title="Invoice Preferences">
            {invoiceLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Invoice Number Prefix"
                    value={invoiceSettings.invoicePrefix}
                    onChange={(e) =>
                      setInvoiceSettings((prev) => ({ ...prev, invoicePrefix: e.target.value }))
                    }
                    placeholder="INV-"
                  />
                  <Input
                    label="Starting Number"
                    type="number"
                    min="1"
                    value={invoiceSettings.invoiceStartingNumber}
                    onChange={(e) =>
                      setInvoiceSettings((prev) => ({
                        ...prev,
                        invoiceStartingNumber: e.target.value,
                      }))
                    }
                  />
                  <Input
                    label="Quote Prefix"
                    value={invoiceSettings.quotePrefix}
                    onChange={(e) =>
                      setInvoiceSettings((prev) => ({ ...prev, quotePrefix: e.target.value }))
                    }
                    placeholder="QT-"
                  />
                  <Input
                    label="Challan Prefix"
                    value={invoiceSettings.challanPrefix}
                    onChange={(e) =>
                      setInvoiceSettings((prev) => ({ ...prev, challanPrefix: e.target.value }))
                    }
                    placeholder="DC-"
                  />
                  <Select
                    label="Default Payment Terms"
                    options={paymentTermsOptions}
                    value={invoiceSettings.defaultPaymentTerms}
                    onChange={(e) =>
                      setInvoiceSettings((prev) => ({
                        ...prev,
                        defaultPaymentTerms: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default Customer Notes
                    </label>
                    <textarea
                      value={invoiceSettings.defaultCustomerNotes}
                      onChange={(e) =>
                        setInvoiceSettings((prev) => ({
                          ...prev,
                          defaultCustomerNotes: e.target.value,
                        }))
                      }
                      placeholder="Notes to display on invoices (visible to customer)"
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default Terms & Conditions
                    </label>
                    <textarea
                      value={invoiceSettings.defaultTermsAndConditions}
                      onChange={(e) =>
                        setInvoiceSettings((prev) => ({
                          ...prev,
                          defaultTermsAndConditions: e.target.value,
                        }))
                      }
                      placeholder="Terms and conditions displayed on invoices"
                      rows={4}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400 resize-none"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button loading={invoiceSaving} onClick={saveInvoiceSettings}>
                    Save
                  </Button>
                </div>
              </>
            )}
          </Card>
        )}

        {/* Tax Tab */}
        {activeTab === 'tax' && (
          <Card title="Tax Configuration">
            <div className="space-y-4">
              {/* Enable Tax Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Enable Tax</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Apply tax calculations to your invoices
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setTaxSettings((prev) => ({ ...prev, enableTax: !prev.enableTax }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    taxSettings.enableTax ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                      taxSettings.enableTax ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {taxSettings.enableTax && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Default Tax Rate (%)"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={taxSettings.defaultTaxRate}
                    onChange={(e) =>
                      setTaxSettings((prev) => ({ ...prev, defaultTaxRate: e.target.value }))
                    }
                    placeholder="18"
                  />
                  <Select
                    label="Tax Type"
                    options={taxTypeOptions}
                    value={taxSettings.taxType}
                    onChange={(e) =>
                      setTaxSettings((prev) => ({ ...prev, taxType: e.target.value }))
                    }
                  />
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <Button loading={taxSaving} onClick={saveTaxSettings}>
                Save
              </Button>
            </div>
          </Card>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            {/* AI Auto-Style */}
            <Card title={
              <div className="flex items-center gap-2">
                <SparkleIcon className="h-4 w-4 text-purple-500" />
                <span>Auto-Style from Brand</span>
              </div>
            }>
              <p className="text-sm text-gray-500 mb-4">
                Let AI suggest the perfect template and colors based on your brand identity.
              </p>
              <div className="space-y-3">
                <Input
                  label="Website URL"
                  placeholder="https://yourbusiness.com"
                  value={brandUrl}
                  onChange={(e) => setBrandUrl(e.target.value)}
                />
                <div className="text-xs text-gray-400 text-center">&mdash; or &mdash;</div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Description
                  </label>
                  <textarea
                    placeholder="Describe your brand — e.g., 'Modern tech startup with blue and white branding' or 'Traditional Indian restaurant with warm earthy tones'"
                    value={brandDescription}
                    onChange={(e) => setBrandDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400 resize-none"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleAutoStyle}
                  loading={aiStyleLoading}
                  disabled={!brandUrl.trim() && !brandDescription.trim()}
                >
                  <span className="flex items-center gap-2">
                    <SparkleIcon className="h-4 w-4" />
                    Suggest Style
                  </span>
                </Button>
              </div>

              {styleSuggestion && (
                <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-700 mb-3 italic">&ldquo;{styleSuggestion.reasoning}&rdquo;</p>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded border border-gray-300"
                        style={{ backgroundColor: styleSuggestion.backgroundColor }}
                        title="Background"
                      />
                      <div
                        className="w-8 h-8 rounded border border-gray-300"
                        style={{ backgroundColor: styleSuggestion.labelColor }}
                        title="Labels"
                      />
                      <div
                        className="w-8 h-8 rounded border border-gray-300"
                        style={{ backgroundColor: styleSuggestion.fontColor }}
                        title="Font"
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      Template: <span className="font-medium capitalize">{styleSuggestion.template}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={applyAISuggestion}>
                      Apply Style
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setStyleSuggestion(null)}>
                      Dismiss
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Template Selection */}
            <Card title="Choose Template">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {templateOptions.map((tmpl) => (
                  <button
                    key={tmpl.key}
                    type="button"
                    onClick={() =>
                      setTemplateSettings((prev) => ({
                        ...prev,
                        selectedTemplate: tmpl.key,
                      }))
                    }
                    className={`relative p-3 rounded-lg border-2 transition-all text-left cursor-pointer ${
                      templateSettings.selectedTemplate === tmpl.key
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="mb-2">
                      <TemplateThumbnail
                        templateKey={tmpl.key}
                        bg={templateSettings.pdfBackgroundColor}
                        label={templateSettings.pdfLabelColor}
                        font={templateSettings.pdfFontColor}
                      />
                    </div>
                    <h4 className="text-xs font-semibold text-gray-900">{tmpl.name}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{tmpl.description}</p>
                    {templateSettings.selectedTemplate === tmpl.key && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <HiCheck className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </Card>

            {/* Colors + Preview side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Colors */}
              <Card title="PDF Colors">
                <div className="space-y-4">
                  {[
                    { key: 'pdfBackgroundColor', label: 'Background Color' },
                    { key: 'pdfLabelColor', label: 'Label / Accent Color' },
                    { key: 'pdfFontColor', label: 'Font Color' },
                  ].map(({ key, label: colorLabel }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{colorLabel}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={templateSettings[key]}
                          onChange={(e) => setTemplateSettings((prev) => ({ ...prev, [key]: e.target.value }))}
                          className="w-10 h-10 rounded border border-gray-300 cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={templateSettings[key]}
                          onChange={(e) => setTemplateSettings((prev) => ({ ...prev, [key]: e.target.value }))}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase"
                          maxLength={7}
                        />
                      </div>
                    </div>
                  ))}

                  {/* Quick color presets */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Quick Accent Presets</label>
                    <div className="flex flex-wrap gap-2">
                      {presetColors.map((color) => (
                        <button
                          key={color.hex}
                          type="button"
                          onClick={() => setTemplateSettings((prev) => ({ ...prev, pdfLabelColor: color.hex }))}
                          className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-transform hover:scale-110 ${
                            templateSettings.pdfLabelColor === color.hex ? 'border-gray-900 scale-110' : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button loading={templateSaving} onClick={saveTemplateSettings}>
                    Save Template Settings
                  </Button>
                </div>
              </Card>

              {/* Live Preview */}
              <Card title={
                <div className="flex items-center gap-2">
                  <HiEye className="h-4 w-4 text-gray-400" />
                  <span>Live Preview</span>
                </div>
              }>
                <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                  <PDFViewer
                    width="100%"
                    height={500}
                    showToolbar={false}
                    style={{ border: 'none' }}
                  >
                    <InvoicePDF
                      data={sampleInvoiceData}
                      type="invoice"
                      org={sampleOrg}
                      colors={{
                        background: templateSettings.pdfBackgroundColor,
                        label: templateSettings.pdfLabelColor,
                        font: templateSettings.pdfFontColor,
                      }}
                      template={templateSettings.selectedTemplate}
                    />
                  </PDFViewer>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Preview uses sample data. Your actual invoices will use your business details.
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
