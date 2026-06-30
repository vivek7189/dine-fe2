'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../../../../../lib/api';
import { useToast } from '../../contexts/InvoiceToastContext';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import { HiPlus, HiTrash, HiSearch } from 'react-icons/hi';
import { useCurrency } from '../../../../../contexts/CurrencyContext';

const challanTypeOptions = [
  { value: '', label: 'Select Challan Type' },
  { value: 'supply_on_approval', label: 'Supply on Approval' },
  { value: 'job_work', label: 'Job Work' },
  { value: 'supply_return', label: 'Supply Return' },
];

function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '0.00';
  return Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

const emptyItem = { name: '', description: '', quantity: 1, rate: 0 };

export default function NewChallanPage() {
  const { getCurrencySymbol } = useCurrency();
  const cs = getCurrencySymbol();
  const router = useRouter();
  const { showToast } = useToast();

  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [nextNumber, setNextNumber] = useState('');
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    customerId: '',
    customerName: '',
    challanNumber: '',
    referenceNumber: '',
    challanDate: todayISO(),
    challanType: '',
    items: [{ ...emptyItem }],
    discount: 0,
    adjustment: 0,
  });

  useEffect(() => {
    async function fetchNextNumber() {
      try {
        const data = await apiClient.getNextChallanNumber();
        const num = data.nextNumber || data.challanNumber || 'DC-0001';
        setNextNumber(num);
        setForm((prev) => ({ ...prev, challanNumber: num }));
      } catch {
        setNextNumber('DC-0001');
        setForm((prev) => ({ ...prev, challanNumber: 'DC-0001' }));
      }
    }
    fetchNextNumber();
  }, []);

  const searchCustomers = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setCustomers([]);
      return;
    }
    try {
      const data = await apiClient.getInvoiceCustomers(`?search=${encodeURIComponent(query)}`);
      setCustomers(data.customers || data || []);
    } catch {
      setCustomers([]);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchCustomers(customerSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [customerSearch, searchCustomers]);

  function selectCustomer(customer) {
    setForm((prev) => ({
      ...prev,
      customerId: customer._id || customer.id,
      customerName: customer.displayName || customer.name || '',
    }));
    setCustomerSearch(customer.displayName || customer.name || '');
    setShowCustomerDropdown(false);
    setErrors((prev) => ({ ...prev, customerName: '' }));
  }

  function updateItem(index, field, value) {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  }

  function addItem() {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { ...emptyItem }],
    }));
  }

  function removeItem(index) {
    if (form.items.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }

  const subTotal = form.items.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0);
  }, 0);

  const discountAmount = (subTotal * (Number(form.discount) || 0)) / 100;
  const total = subTotal - discountAmount + (Number(form.adjustment) || 0);

  function validate() {
    const errs = {};
    if (!form.customerName) errs.customerName = 'Customer is required';
    if (!form.challanType) errs.challanType = 'Challan type is required';
    if (form.items.length === 0 || form.items.every((it) => !it.name)) {
      errs.items = 'At least one item is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        customerId: form.customerId,
        customerName: form.customerName,
        challanNumber: form.challanNumber,
        referenceNumber: form.referenceNumber,
        challanDate: form.challanDate,
        challanType: form.challanType,
        items: form.items.filter((it) => it.name).map((it) => ({
          name: it.name,
          description: it.description,
          quantity: Number(it.quantity) || 0,
          rate: Number(it.rate) || 0,
          amount: (Number(it.quantity) || 0) * (Number(it.rate) || 0),
        })),
        subtotal: subTotal,
        discount: Number(form.discount) || 0,
        discountAmount,
        adjustments: Number(form.adjustment) || 0,
        total,
        status: 'draft',
      };
      await apiClient.createInvoiceChallan(payload);
      showToast('Delivery challan saved as draft', 'success');
      router.push('/invoice/challans');
    } catch (err) {
      showToast(err.message || 'Failed to save challan', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="New Delivery Challan"
        subtitle="Create a new delivery challan"
      />

      <div className="space-y-6">
        {/* Customer & Basic Info */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Search */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name<span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setShowCustomerDropdown(true);
                    if (!e.target.value) {
                      setForm((prev) => ({ ...prev, customerId: '', customerName: '' }));
                    }
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  placeholder="Search customers..."
                  className={`w-full pl-9 pr-4 py-2 text-sm border rounded-lg transition-colors ${
                    errors.customerName
                      ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  } placeholder:text-gray-400`}
                />
                {showCustomerDropdown && customers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {customers.map((c) => (
                      <button
                        key={c._id || c.id}
                        type="button"
                        onClick={() => selectCustomer(c)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <span className="font-medium text-gray-900">
                          {c.displayName || c.name}
                        </span>
                        {c.companyName && (
                          <span className="text-gray-500 ml-2">{c.companyName}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.customerName && (
                <p className="mt-1 text-xs text-red-500">{errors.customerName}</p>
              )}
            </div>

            {/* Challan Number */}
            <Input
              label="Delivery Challan#"
              value={form.challanNumber}
              readOnly
              className="bg-gray-50"
            />

            {/* Reference */}
            <Input
              label="Reference#"
              value={form.referenceNumber}
              onChange={(e) => setForm((prev) => ({ ...prev, referenceNumber: e.target.value }))}
              placeholder="Enter reference number"
            />

            {/* Date */}
            <Input
              label="Delivery Challan Date"
              type="date"
              value={form.challanDate}
              onChange={(e) => setForm((prev) => ({ ...prev, challanDate: e.target.value }))}
            />

            {/* Challan Type */}
            <Select
              label="Challan Type"
              required
              options={challanTypeOptions}
              value={form.challanType}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, challanType: e.target.value }));
                setErrors((prev) => ({ ...prev, challanType: '' }));
              }}
              error={errors.challanType}
            />
          </div>
        </Card>

        {/* Item Details */}
        <Card title="Item Details">
          {errors.items && (
            <p className="text-xs text-red-500 mb-3">{errors.items}</p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase w-8">#</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Item Details</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase w-24">Quantity</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase w-32">Rate</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase w-32">Amount</th>
                  <th className="px-3 py-2.5 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((item, idx) => {
                  const amount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
                  return (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(idx, 'name', e.target.value)}
                          placeholder="Type or click to select an item"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
                        />
                        <input
                          type="text"
                          value={item.description || ''}
                          onChange={(e) => updateItem(idx, 'description', e.target.value)}
                          placeholder="Description"
                          className="w-full px-2 py-1 text-xs border border-gray-200 rounded mt-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => updateItem(idx, 'rate', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-gray-900">
                        {formatCurrency(amount)}
                      </td>
                      <td className="px-3 py-2">
                        {form.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <HiTrash className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
          >
            <HiPlus className="h-4 w-4" />
            Add another item
          </button>

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sub Total</span>
                <span className="font-medium text-gray-900">{cs}{formatCurrency(subTotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm gap-2">
                <span className="text-gray-600">Discount</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={form.discount}
                    onChange={(e) => setForm((prev) => ({ ...prev, discount: e.target.value }))}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-gray-500">%</span>
                  <span className="font-medium text-gray-900 ml-2">-{cs}{formatCurrency(discountAmount)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm gap-2">
                <span className="text-gray-600">Adjustment</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.adjustment}
                  onChange={(e) => setForm((prev) => ({ ...prev, adjustment: e.target.value }))}
                  className="w-24 px-2 py-1 text-sm border border-gray-300 rounded text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-gray-900 text-base">{cs}{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer Actions */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            PDF will use the Standard template. You can change this in Settings.
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/invoice/challans')}
            >
              Cancel
            </Button>
            <Button
              loading={saving}
              onClick={handleSave}
            >
              Save as Draft
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
