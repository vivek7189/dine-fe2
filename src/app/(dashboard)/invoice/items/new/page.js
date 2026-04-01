'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiX, HiPhotograph } from 'react-icons/hi';
import apiClient from '../../../../../lib/api';
import { useToast } from '../../contexts/InvoiceToastContext';
import useInvoiceAI from '../../hooks/useInvoiceAI';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import SparkleIcon from '../../components/ai/SparkleIcon';

const unitOptions = [
  { value: '', label: 'Select a unit' },
  { value: 'BOX', label: 'BOX - box' },
  { value: 'CMS', label: 'CMS - cm' },
  { value: 'DOZ', label: 'DOZ - dz' },
  { value: 'FTS', label: 'FTS - ft' },
  { value: 'GMS', label: 'GMS - g' },
  { value: 'INC', label: 'INC - in' },
  { value: 'KGS', label: 'KGS - kg' },
  { value: 'LTR', label: 'LTR - ltr' },
  { value: 'MTR', label: 'MTR - m' },
  { value: 'NOS', label: 'NOS - nos' },
  { value: 'PCS', label: 'PCS - pcs' },
  { value: 'SET', label: 'SET - set' },
  { value: 'SQF', label: 'SQF - sqf' },
];

export default function NewItemPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const { generate: aiGenerate, isGenerating: aiLoading } = useInvoiceAI();

  const [form, setForm] = useState({
    name: '',
    type: 'goods',
    unit: '',
    sellingPrice: '',
    description: '',
    taxRate: '',
    hsnCode: '',
  });

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Item name is required';
    if (!form.sellingPrice || Number(form.sellingPrice) < 0) {
      newErrors.sellingPrice = 'Valid selling price is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        ...form,
        sellingPrice: Number(form.sellingPrice),
        taxRate: form.taxRate ? Number(form.taxRate) : undefined,
      };
      await apiClient.createInvoiceItem(payload);
      showToast('Item created successfully', 'success');
      router.push('/invoice/items');
    } catch (err) {
      showToast(err.message || 'Failed to create item', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="New Item"
        actions={
          <Button variant="ghost" icon={HiX} onClick={() => router.push('/invoice/items')}>
            Close
          </Button>
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="flex gap-8">
              {/* Left - Form Fields */}
              <div className="flex-1 space-y-6">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="goods"
                        checked={form.type === 'goods'}
                        onChange={(e) => updateForm('type', e.target.value)}
                        className="text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Goods</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="service"
                        checked={form.type === 'service'}
                        onChange={(e) => updateForm('type', e.target.value)}
                        className="text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Service</span>
                    </label>
                  </div>
                </div>

                {/* Name */}
                <Input
                  label="Name"
                  required
                  placeholder="Enter item name"
                  value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  error={errors.name}
                />

                {/* Unit */}
                <Select
                  label="Unit"
                  options={unitOptions}
                  value={form.unit}
                  onChange={(e) => updateForm('unit', e.target.value)}
                />

                {/* HSN/SAC Code */}
                <Input
                  label={form.type === 'goods' ? 'HSN Code' : 'SAC Code'}
                  placeholder={form.type === 'goods' ? 'Enter HSN code' : 'Enter SAC code'}
                  value={form.hsnCode}
                  onChange={(e) => updateForm('hsnCode', e.target.value)}
                />

                {/* Tax Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Rate
                  </label>
                  <div className="relative max-w-xs">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={form.taxRate}
                      onChange={(e) => updateForm('taxRate', e.target.value)}
                      className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
                  </div>
                </div>
              </div>

              {/* Right - Image Upload Placeholder */}
              <div className="w-56 flex-shrink-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 transition-colors cursor-pointer">
                  <HiPhotograph className="h-10 w-10 mb-2" />
                  <p className="text-xs text-center px-4">
                    Drag & drop an image or click to upload
                  </p>
                </div>
              </div>
            </div>

            {/* Sales Information Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Sales Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Selling Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selling Price
                    <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{'\u20B9'}</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={form.sellingPrice}
                      onChange={(e) => updateForm('sellingPrice', e.target.value)}
                      className={`w-full pl-7 pr-3 py-2 text-sm border rounded-lg focus:ring-1 placeholder:text-gray-400 ${
                        errors.sellingPrice
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                  {errors.sellingPrice && (
                    <p className="mt-1 text-xs text-red-500">{errors.sellingPrice}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <button
                      type="button"
                      onClick={async () => {
                        const result = await aiGenerate('generate-description', {
                          name: form.name,
                          type: form.type,
                          unit: form.unit,
                          sellingPrice: form.sellingPrice,
                        });
                        if (result?.description) updateForm('description', result.description);
                      }}
                      disabled={!form.name.trim() || aiLoading}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {aiLoading ? (
                        <div className="h-3 w-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <SparkleIcon className="h-3 w-3" />
                      )}
                      AI Generate
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Enter a description for this item..."
                    value={form.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center gap-3">
            <Button type="submit" loading={saving}>
              Save
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/invoice/items')}>
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
