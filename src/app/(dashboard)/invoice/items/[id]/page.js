'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { HiPencil, HiTrash, HiX, HiArrowLeft, HiPhotograph } from 'react-icons/hi';
import apiClient from '../../../../../lib/api';
import { useToast } from '../../contexts/InvoiceToastContext';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';

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

const unitLabels = Object.fromEntries(
  unitOptions.filter((o) => o.value).map((o) => [o.value, o.label])
);

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '0.00';
  return Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function ItemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const itemId = params.id;

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState(null);

  useEffect(() => {
    async function fetchItem() {
      setLoading(true);
      try {
        const data = await apiClient.getInvoiceItem(itemId);
        const it = data;
        setItem(it);
        initForm(it);
      } catch {
        showToast('Failed to load item', 'error');
        router.push('/invoice/items');
      } finally {
        setLoading(false);
      }
    }
    fetchItem();
  }, [itemId]);

  function initForm(it) {
    setForm({
      name: it.name || '',
      type: it.type || 'goods',
      unit: it.unit || '',
      sellingPrice: it.sellingPrice?.toString() || '',
      description: it.description || '',
      taxRate: it.taxRate?.toString() || '',
      hsnCode: it.hsnCode || '',
    });
  }

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

  async function handleSave(e) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        ...form,
        sellingPrice: Number(form.sellingPrice),
        taxRate: form.taxRate ? Number(form.taxRate) : undefined,
      };
      const data = await apiClient.updateInvoiceItem(itemId, payload);
      const updated = data;
      setItem(updated);
      initForm(updated);
      setEditing(false);
      showToast('Item updated successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update item', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await apiClient.deleteInvoiceItem(itemId);
      showToast('Item deleted successfully', 'success');
      router.push('/invoice/items');
    } catch (err) {
      showToast(err.message || 'Failed to delete item', 'error');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  function handleCancelEdit() {
    initForm(item);
    setEditing(false);
    setErrors({});
  }

  if (loading) {
    return (
      <div>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-48 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!item) return null;

  // View mode
  if (!editing) {
    return (
      <div>
        <PageHeader
          title={item.name}
          subtitle={item.type === 'goods' ? 'Goods' : 'Service'}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="ghost" icon={HiArrowLeft} onClick={() => router.push('/invoice/items')}>
                Back
              </Button>
              <Button variant="outline" icon={HiPencil} onClick={() => setEditing(true)}>
                Edit
              </Button>
              <Button variant="danger" icon={HiTrash} onClick={() => setShowDeleteModal(true)}>
                Delete
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Item Details
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.type === 'goods' ? 'info' : 'warning'}>
                      {item.type === 'goods' ? 'Goods' : 'Service'}
                    </Badge>
                    <Badge variant={item.status === 'active' ? 'success' : 'default'}>
                      {item.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  </div>
                  {item.unit && (
                    <div>
                      <p className="text-xs text-gray-500">Unit</p>
                      <p className="text-sm text-gray-900">{unitLabels[item.unit] || item.unit}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500">Selling Price</p>
                    <p className="text-sm font-medium text-gray-900">
                      {'\u20B9'}{formatCurrency(item.sellingPrice)}
                    </p>
                  </div>
                  {item.taxRate !== undefined && item.taxRate !== null && item.taxRate !== '' && (
                    <div>
                      <p className="text-xs text-gray-500">Tax Rate</p>
                      <p className="text-sm text-gray-900">{item.taxRate}%</p>
                    </div>
                  )}
                  {item.hsnCode && (
                    <div>
                      <p className="text-xs text-gray-500">{item.type === 'goods' ? 'HSN Code' : 'SAC Code'}</p>
                      <p className="text-sm text-gray-900">{item.hsnCode}</p>
                    </div>
                  )}
                </div>

                {item.description && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Description</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.description}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar - Price card */}
          <div>
            <Card>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Selling Price
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {'\u20B9'}{formatCurrency(item.sellingPrice)}
              </p>
              {item.taxRate !== undefined && item.taxRate !== null && item.taxRate !== '' && (
                <p className="text-xs text-gray-500 mt-1">+ {item.taxRate}% tax</p>
              )}
            </Card>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Item"
        >
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete <strong>{item.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </Modal>
      </div>
    );
  }

  // Edit mode
  return (
    <div>
      <PageHeader
        title="Edit Item"
        actions={
          <Button variant="ghost" icon={HiX} onClick={handleCancelEdit}>
            Cancel
          </Button>
        }
      />

      <form onSubmit={handleSave}>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate</label>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
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
            <Button type="submit" loading={saving}>Save</Button>
            <Button type="button" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
