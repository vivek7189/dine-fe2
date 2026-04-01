'use client';

import { useState, useEffect } from 'react';
import apiClient from '../../../../lib/api';
import { useToast } from '../contexts/InvoiceToastContext';
import PageHeader from '../components/layout/PageHeader';
import Tabs from '../components/ui/Tabs';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { HiCheck } from 'react-icons/hi';
import useInvoiceAI from '../hooks/useInvoiceAI';
import SparkleIcon from '../components/ai/SparkleIcon';

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
  { key: 'standard', name: 'Standard', description: 'Clean, professional layout' },
  { key: 'spreadsheet', name: 'Spreadsheet', description: 'Table-heavy, data-focused' },
  { key: 'continental', name: 'Continental', description: 'Elegant European style' },
  { key: 'compact', name: 'Compact', description: 'Space-efficient minimal design' },
];

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

            <Card title="PDF Template">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    className={`relative p-4 rounded-lg border-2 transition-all text-left cursor-pointer ${
                      templateSettings.selectedTemplate === tmpl.key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {/* Template Preview */}
                    <div className="aspect-[3/4] bg-white border border-gray-200 rounded mb-3 p-2 flex flex-col gap-1">
                      <div className="h-2 bg-gray-300 rounded w-2/3" />
                      <div className="h-1.5 bg-gray-200 rounded w-full" />
                      <div className="h-1.5 bg-gray-200 rounded w-full" />
                      <div className="h-1.5 bg-gray-200 rounded w-3/4" />
                      <div className="flex-1" />
                      <div className="h-1.5 bg-gray-200 rounded w-1/2 self-end" />
                    </div>
                    <h4 className="text-sm font-medium text-gray-900">{tmpl.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{tmpl.description}</p>
                    {templateSettings.selectedTemplate === tmpl.key && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <HiCheck className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </Card>

            <Card title="PDF Colors">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={templateSettings.pdfBackgroundColor}
                      onChange={(e) =>
                        setTemplateSettings((prev) => ({
                          ...prev,
                          pdfBackgroundColor: e.target.value,
                        }))
                      }
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={templateSettings.pdfBackgroundColor}
                      onChange={(e) =>
                        setTemplateSettings((prev) => ({
                          ...prev,
                          pdfBackgroundColor: e.target.value,
                        }))
                      }
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase"
                      maxLength={7}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={templateSettings.pdfLabelColor}
                      onChange={(e) =>
                        setTemplateSettings((prev) => ({
                          ...prev,
                          pdfLabelColor: e.target.value,
                        }))
                      }
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={templateSettings.pdfLabelColor}
                      onChange={(e) =>
                        setTemplateSettings((prev) => ({
                          ...prev,
                          pdfLabelColor: e.target.value,
                        }))
                      }
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase"
                      maxLength={7}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Font Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={templateSettings.pdfFontColor}
                      onChange={(e) =>
                        setTemplateSettings((prev) => ({
                          ...prev,
                          pdfFontColor: e.target.value,
                        }))
                      }
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={templateSettings.pdfFontColor}
                      onChange={(e) =>
                        setTemplateSettings((prev) => ({
                          ...prev,
                          pdfFontColor: e.target.value,
                        }))
                      }
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase"
                      maxLength={7}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button loading={templateSaving} onClick={saveTemplateSettings}>
                  Save
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
