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
import { HiSearch } from 'react-icons/hi';
import { useCurrency } from '../../../../../contexts/CurrencyContext';

const paymentModeOptions = [
  { value: '', label: 'Select Payment Mode' },
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'upi', label: 'UPI' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'other', label: 'Other' },
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

export default function NewPaymentPage() {
  const { getCurrencySymbol } = useCurrency();
  const cs = getCurrencySymbol();
  const router = useRouter();
  const { showToast } = useToast();

  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    customerId: '',
    customerName: '',
    invoiceId: '',
    invoiceNumber: '',
    amount: '',
    paymentDate: todayISO(),
    paymentMode: '',
    referenceNumber: '',
    notes: '',
  });

  const searchCustomers = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setCustomers([]);
      return;
    }
    try {
      const data = await apiClient.getInvoiceCustomers(`search=${encodeURIComponent(query)}`);
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

  // Fetch unpaid invoices when customer is selected
  useEffect(() => {
    if (!form.customerId) {
      setInvoices([]);
      return;
    }
    async function fetchInvoices() {
      setLoadingInvoices(true);
      try {
        const data = await apiClient.getInvoices(`customerId=${form.customerId}&status=sent`);
        setInvoices(data.invoices || data || []);
      } catch {
        setInvoices([]);
      } finally {
        setLoadingInvoices(false);
      }
    }
    fetchInvoices();
  }, [form.customerId]);

  function selectCustomer(customer) {
    setForm((prev) => ({
      ...prev,
      customerId: customer._id || customer.id,
      customerName: customer.displayName || customer.name || '',
      invoiceId: '',
      invoiceNumber: '',
      amount: '',
    }));
    setCustomerSearch(customer.displayName || customer.name || '');
    setShowCustomerDropdown(false);
    setErrors((prev) => ({ ...prev, customerName: '' }));
  }

  function selectInvoice(invoiceId) {
    const inv = invoices.find((i) => (i._id || i.id) === invoiceId);
    if (inv) {
      setForm((prev) => ({
        ...prev,
        invoiceId: inv._id || inv.id,
        invoiceNumber: inv.invoiceNumber,
        amount: inv.balanceDue || inv.total || '',
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        invoiceId: '',
        invoiceNumber: '',
        amount: '',
      }));
    }
  }

  function validate() {
    const errs = {};
    if (!form.customerName) errs.customerName = 'Customer is required';
    if (!form.amount || Number(form.amount) <= 0) errs.amount = 'Valid amount is required';
    if (!form.paymentMode) errs.paymentMode = 'Payment mode is required';
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
        invoiceId: form.invoiceId || undefined,
        invoiceNumber: form.invoiceNumber || undefined,
        amount: Number(form.amount),
        paymentDate: form.paymentDate,
        paymentMode: form.paymentMode,
        referenceNumber: form.referenceNumber || undefined,
        notes: form.notes || undefined,
      };
      await apiClient.createInvoicePayment(payload);
      showToast('Payment recorded successfully', 'success');
      router.push('/invoice/payments');
    } catch (err) {
      showToast(err.message || 'Failed to record payment', 'error');
    } finally {
      setSaving(false);
    }
  }

  const invoiceOptions = [
    { value: '', label: loadingInvoices ? 'Loading invoices...' : 'Select an invoice (optional)' },
    ...invoices.map((inv) => ({
      value: inv._id || inv.id,
      label: `${inv.invoiceNumber} - Balance: ${cs}${formatCurrency(inv.balanceDue || inv.total)}`,
    })),
  ];

  return (
    <div>
      <PageHeader
        title="Record Payment"
        subtitle="Record a payment received from a customer"
      />

      <div className="space-y-6">
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
                      setForm((prev) => ({
                        ...prev,
                        customerId: '',
                        customerName: '',
                        invoiceId: '',
                        invoiceNumber: '',
                        amount: '',
                      }));
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

            {/* Invoice Selector */}
            <Select
              label="Invoice"
              options={invoiceOptions}
              value={form.invoiceId}
              onChange={(e) => selectInvoice(e.target.value)}
              disabled={!form.customerId}
            />

            {/* Amount */}
            <Input
              label="Amount Received"
              required
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, amount: e.target.value }));
                setErrors((prev) => ({ ...prev, amount: '' }));
              }}
              placeholder="0.00"
              error={errors.amount}
            />

            {/* Payment Date */}
            <Input
              label="Payment Date"
              type="date"
              value={form.paymentDate}
              onChange={(e) => setForm((prev) => ({ ...prev, paymentDate: e.target.value }))}
            />

            {/* Payment Mode */}
            <Select
              label="Payment Mode"
              required
              options={paymentModeOptions}
              value={form.paymentMode}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, paymentMode: e.target.value }));
                setErrors((prev) => ({ ...prev, paymentMode: '' }));
              }}
              error={errors.paymentMode}
            />

            {/* Reference Number */}
            <Input
              label="Reference Number"
              value={form.referenceNumber}
              onChange={(e) => setForm((prev) => ({ ...prev, referenceNumber: e.target.value }))}
              placeholder="Transaction ID or cheque number"
            />
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Add notes about this payment..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400 resize-none"
            />
          </div>

          {/* Selected Invoice Summary */}
          {form.invoiceId && form.invoiceNumber && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-sm text-blue-800">
                Recording payment for invoice{' '}
                <span className="font-semibold">{form.invoiceNumber}</span>
                {form.amount && (
                  <> of <span className="font-semibold">{cs}{formatCurrency(form.amount)}</span></>
                )}
              </p>
            </div>
          )}
        </Card>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={() => router.push('/invoice/payments')}>
            Cancel
          </Button>
          <Button loading={saving} onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
