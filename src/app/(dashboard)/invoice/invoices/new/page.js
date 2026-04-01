'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../../../../../lib/api';
import { useToast } from '../../contexts/InvoiceToastContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { HiPlus, HiX, HiCog, HiChevronDown } from 'react-icons/hi';

const termsOptions = [
  { value: 'due_on_receipt', label: 'Due on Receipt' },
  { value: 'net_15', label: 'Net 15' },
  { value: 'net_30', label: 'Net 30' },
  { value: 'net_45', label: 'Net 45' },
  { value: 'net_60', label: 'Net 60' },
];

const termsDaysMap = {
  due_on_receipt: 0,
  net_15: 15,
  net_30: 30,
  net_45: 45,
  net_60: 60,
};

function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Rs.0.00';
  return `Rs.${Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDateForInput(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return formatDateForInput(d);
}

// Searchable dropdown component
function SearchableSelect({ label, required, placeholder, options, value, onChange, displayValue, error }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full" ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`w-full px-3 py-2 text-sm border rounded-lg text-left flex items-center justify-between transition-colors cursor-pointer ${
            error
              ? 'border-red-300 focus:border-red-500'
              : 'border-gray-300 focus:border-blue-500'
          } bg-white`}
        >
          <span className={displayValue ? 'text-gray-900' : 'text-gray-400'}>
            {displayValue || placeholder || 'Select...'}
          </span>
          <HiChevronDown className="h-4 w-4 text-gray-400" />
        </button>
        {open && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
            <div className="p-2 border-b border-gray-100">
              <input
                type="text"
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-400">No results found</div>
              ) : (
                filtered.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer transition-colors ${
                      value === opt.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                    }`}
                    onClick={() => {
                      onChange(opt.value, opt);
                      setOpen(false);
                      setSearch('');
                    }}
                  >
                    {opt.label}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// Item row search dropdown
function ItemSearchSelect({ items, value, onSelect }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative flex-1" ref={ref}>
      <input
        type="text"
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 bg-white"
        placeholder="Type or click to select an item"
        value={open ? search : value || ''}
        onChange={(e) => {
          setSearch(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
          setSearch('');
        }}
      />
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">No items found</div>
          ) : (
            filtered.map((item) => (
              <button
                key={item._id || item.id}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer transition-colors text-gray-700"
                onClick={() => {
                  onSelect(item);
                  setOpen(false);
                  setSearch('');
                }}
              >
                <div className="flex justify-between">
                  <span>{item.name}</span>
                  <span className="text-gray-400">{formatCurrency(item.sellingPrice || item.rate || item.price || 0)}</span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function NewInvoicePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  // Master data
  const [customers, setCustomers] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form state
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(formatDateForInput(new Date()));
  const [terms, setTerms] = useState('due_on_receipt');
  const [dueDate, setDueDate] = useState(formatDateForInput(new Date()));
  const [salesperson, setSalesperson] = useState('');
  const [simplifiedView, setSimplifiedView] = useState(false);

  // Line items
  const [lineItems, setLineItems] = useState([
    { id: 1, itemId: '', name: '', quantity: 1, rate: 0, tax: 0 },
  ]);
  const lineIdCounter = useRef(2);

  // Totals
  const [discountType, setDiscountType] = useState('percentage'); // percentage | fixed
  const [discountValue, setDiscountValue] = useState('');
  const [adjustment, setAdjustment] = useState('');
  const [showTotalSummary, setShowTotalSummary] = useState(true);

  // Notes
  const [customerNotes, setCustomerNotes] = useState('Thanks for your business.');
  const [showTermsConditions, setShowTermsConditions] = useState(false);
  const [termsConditions, setTermsConditions] = useState('');

  // Errors
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function loadData() {
      try {
        const [custData, itemsData] = await Promise.all([
          apiClient.getInvoiceCustomers(),
          apiClient.getInvoiceItems(),
        ]);
        let allCustomers = custData.customers || custData || [];
        setItemsList(itemsData.items || itemsData || []);

        // Also fetch DineOpen restaurant customers if restaurantId is available
        const restaurantId = typeof window !== 'undefined' ? localStorage.getItem('inv_restaurantId') : null;
        if (restaurantId) {
          try {
            const res = await apiClient.get(`/api/invoice/customers/dineopen?restaurantId=${restaurantId}`);
            const dineData = res?.data ?? res;
            const dineCustomers = (dineData.customers || dineData || []).map(c => ({
              ...c,
              _source: 'dineopen',
            }));
            // Merge, avoiding duplicates by phone
            const existingPhones = new Set(allCustomers.map(c => c.phone || c.mobile).filter(Boolean));
            const newDineCustomers = dineCustomers.filter(c => !existingPhones.has(c.phone));
            allCustomers = [...allCustomers, ...newDineCustomers];
          } catch {
            // DineOpen customers unavailable, continue with invoice customers only
          }
        }
        setCustomers(allCustomers);
      } catch (err) {
        showToast('Failed to load data', 'error');
      }
      setLoadingData(false);
    }

    async function loadNextNumber() {
      try {
        const data = await apiClient.getNextInvoiceNumber();
        setInvoiceNumber(data.nextNumber || data.invoiceNumber || 'INV-001');
      } catch {
        setInvoiceNumber('INV-001');
      }
    }

    loadData();
    loadNextNumber();
  }, []);

  // Recalculate due date when terms or invoice date change
  useEffect(() => {
    const days = termsDaysMap[terms] || 0;
    setDueDate(addDays(invoiceDate, days));
  }, [terms, invoiceDate]);

  // Calculations
  const subTotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);

  const discountAmount = discountType === 'percentage'
    ? (subTotal * (parseFloat(discountValue) || 0)) / 100
    : (parseFloat(discountValue) || 0);

  const taxTotal = lineItems.reduce((sum, item) => {
    const lineAmount = item.quantity * item.rate;
    return sum + (lineAmount * (item.tax || 0)) / 100;
  }, 0);

  const adjustmentAmount = parseFloat(adjustment) || 0;
  const total = subTotal - discountAmount + taxTotal + adjustmentAmount;

  // Handlers
  function addLineItem() {
    setLineItems([
      ...lineItems,
      { id: lineIdCounter.current++, itemId: '', name: '', quantity: 1, rate: 0, tax: 0 },
    ]);
  }

  function removeLineItem(id) {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((item) => item.id !== id));
  }

  function updateLineItem(id, field, value) {
    setLineItems(lineItems.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  }

  function handleItemSelect(lineId, selectedItem) {
    setLineItems(lineItems.map((item) =>
      item.id === lineId
        ? {
            ...item,
            itemId: selectedItem._id || selectedItem.id,
            name: selectedItem.name,
            rate: selectedItem.sellingPrice || selectedItem.rate || selectedItem.price || 0,
            tax: selectedItem.taxRate || selectedItem.tax || 0,
          }
        : item
    ));
  }

  function validate() {
    const newErrors = {};
    if (!customerId) newErrors.customer = 'Customer is required';
    if (lineItems.every((item) => !item.itemId && !item.name)) {
      newErrors.items = 'At least one item is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave(sendAfterSave = false) {
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        customerId,
        invoiceNumber,
        invoiceDate,
        dueDate,
        paymentTerms: terms,
        salesperson,
        items: lineItems
          .filter((item) => item.itemId || item.name)
          .map((item) => ({
            itemId: item.itemId,
            name: item.name,
            quantity: Number(item.quantity) || 1,
            rate: Number(item.rate) || 0,
            taxRate: Number(item.tax) || 0,
            amount: (Number(item.quantity) || 1) * (Number(item.rate) || 0),
          })),
        subtotal: subTotal,
        discountType,
        discountValue: parseFloat(discountValue) || 0,
        discountAmount,
        taxAmount: taxTotal,
        adjustments: adjustmentAmount,
        total,
        customerNotes,
        termsAndConditions: termsConditions,
        status: sendAfterSave ? 'sent' : 'draft',
      };

      const data = await apiClient.createInvoice(payload);
      const invoiceId = data._id || data.id;

      if (sendAfterSave && invoiceId) {
        try {
          await apiClient.sendInvoice(invoiceId);
        } catch {
          showToast('Invoice saved but failed to send', 'warning');
        }
      }

      showToast(
        sendAfterSave ? 'Invoice created and sent!' : 'Invoice saved as draft!',
        'success'
      );
      router.push(invoiceId ? `/invoice/invoices/${invoiceId}` : '/invoice/invoices');
    } catch (err) {
      showToast(err.message || 'Failed to save invoice', 'error');
    } finally {
      setSaving(false);
    }
  }

  const customerOptions = customers.map((c) => ({
    value: c._id || c.id,
    label: `${c.name || c.displayName || c.companyName || ''}${c._source === 'dineopen' ? ' (DineOpen)' : ''}`,
  }));

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">New Invoice</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <span>Use Simplified View</span>
            <button
              type="button"
              onClick={() => setSimplifiedView(!simplifiedView)}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                simplifiedView ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  simplifiedView ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </label>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 space-y-6">
          {/* Top Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            {/* Customer Name */}
            <SearchableSelect
              label="Customer Name"
              required
              placeholder="Select or search a customer"
              options={customerOptions}
              value={customerId}
              displayValue={customerName}
              error={errors.customer}
              onChange={(val, opt) => {
                setCustomerId(val);
                setCustomerName(opt.label);
                setErrors((prev) => ({ ...prev, customer: undefined }));
              }}
            />

            {/* Invoice# */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice#</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  value={invoiceNumber}
                  readOnly
                />
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  title="Configure numbering"
                >
                  <HiCog className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Invoice Date */}
            <Input
              label="Invoice Date"
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />

            {/* Terms */}
            <Select
              label="Terms"
              options={termsOptions}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
            />

            {/* Due Date */}
            <Input
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />

            {/* Salesperson */}
            <Input
              label="Salesperson"
              placeholder="Enter salesperson name"
              value={salesperson}
              onChange={(e) => setSalesperson(e.target.value)}
            />
          </div>

          {/* Item Table */}
          <div className="mt-8">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-0 bg-gray-50 border-b border-gray-200">
                <div className="col-span-5 px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Item Details
                </div>
                <div className="col-span-2 px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Quantity
                </div>
                <div className="col-span-2 px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Rate
                </div>
                <div className="col-span-2 px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Amount
                </div>
                <div className="col-span-1 px-2 py-2.5" />
              </div>

              {/* Table Body */}
              {lineItems.map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-0 border-b border-gray-100 items-center hover:bg-gray-50/50"
                >
                  <div className="col-span-5 px-3 py-2">
                    <ItemSearchSelect
                      items={itemsList}
                      value={item.name}
                      onSelect={(selected) => handleItemSelect(item.id, selected)}
                    />
                  </div>
                  <div className="col-span-2 px-3 py-2">
                    <input
                      type="number"
                      min="1"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 text-center"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500"
                      value={item.rate}
                      onChange={(e) => updateLineItem(item.id, 'rate', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 px-3 py-2 text-right">
                    <span className="text-sm font-medium text-gray-700">
                      {formatCurrency(item.quantity * item.rate)}
                    </span>
                  </div>
                  <div className="col-span-1 px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeLineItem(item.id)}
                      className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer disabled:opacity-30"
                      disabled={lineItems.length === 1}
                    >
                      <HiX className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {errors.items && (
              <p className="mt-1 text-xs text-red-500">{errors.items}</p>
            )}

            {/* Add Row Buttons */}
            <div className="flex gap-3 mt-3">
              <button
                type="button"
                onClick={addLineItem}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              >
                <HiPlus className="h-4 w-4" />
                Add New Row
              </button>
              <button
                type="button"
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                onClick={addLineItem}
              >
                <HiPlus className="h-4 w-4" />
                Add Items in Bulk
              </button>
            </div>
          </div>

          {/* Totals Section */}
          <div className="flex flex-col md:flex-row gap-8 mt-6">
            {/* Left: Notes */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Notes
                </label>
                <textarea
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Will be displayed on the invoice"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                />
              </div>

              {!showTermsConditions ? (
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                  onClick={() => setShowTermsConditions(true)}
                >
                  + Add Terms and Conditions
                </button>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Terms & Conditions
                  </label>
                  <textarea
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                    rows={3}
                    placeholder="Enter your terms and conditions"
                    value={termsConditions}
                    onChange={(e) => setTermsConditions(e.target.value)}
                  />
                </div>
              )}

              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              >
                + Add Payment Gateway
              </button>
            </div>

            {/* Right: Total Summary */}
            <div className="w-full md:w-80">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-3 cursor-pointer"
                onClick={() => setShowTotalSummary(!showTotalSummary)}
              >
                {showTotalSummary ? 'Hide' : 'Show'} Total Summary
              </button>

              {showTotalSummary && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sub Total</span>
                    <span className="font-medium text-gray-900">{formatCurrency(subTotal)}</span>
                  </div>

                  {/* Discount */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-gray-600 whitespace-nowrap">Discount</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-20 px-2 py-1 text-sm border border-gray-200 rounded-md text-right focus:outline-none focus:border-blue-500"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        placeholder="0"
                      />
                      <select
                        className="px-2 py-1 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:border-blue-500"
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value)}
                      >
                        <option value="percentage">%</option>
                        <option value="fixed">Rs.</option>
                      </select>
                    </div>
                    <span className="text-sm text-gray-900 font-medium w-24 text-right">
                      -{formatCurrency(discountAmount)}
                    </span>
                  </div>

                  {/* Tax */}
                  {taxTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium text-gray-900">{formatCurrency(taxTotal)}</span>
                    </div>
                  )}

                  {/* Adjustment */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-gray-600">Adjustment</span>
                    <input
                      type="number"
                      step="0.01"
                      className="w-28 px-2 py-1 text-sm border border-gray-200 rounded-md text-right focus:outline-none focus:border-blue-500"
                      value={adjustment}
                      onChange={(e) => setAdjustment(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="border-t border-gray-200 pt-3 flex justify-between">
                    <span className="text-sm font-semibold text-gray-900">Total (Rs.)</span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(total)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <Button
            variant="ghost"
            onClick={() => router.push('/invoice/invoices')}
          >
            Cancel
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              loading={saving}
              onClick={() => handleSave(false)}
            >
              Save as Draft
            </Button>
            <Button
              variant="primary"
              loading={saving}
              onClick={() => handleSave(true)}
            >
              Save and Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
