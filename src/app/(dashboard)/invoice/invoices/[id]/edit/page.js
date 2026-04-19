'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '../../../../../../lib/api';
import { useToast } from '../../../contexts/InvoiceToastContext';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { HiPlus, HiX, HiChevronDown } from 'react-icons/hi';

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

function SearchableSelect({ label, required, placeholder, options, value, onChange, displayValue, error }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
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
            error ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
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

function ItemSearchSelect({ items, value, onSelect, onCustomItem }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        if (open && search.trim() && !items.some(i => i.name.toLowerCase() === search.trim().toLowerCase())) {
          onCustomItem(search.trim());
        }
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, search, items, onCustomItem]);

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );
  const hasExactMatch = search.trim() && items.some(i => i.name.toLowerCase() === search.trim().toLowerCase());
  const showCustomOption = search.trim().length > 0 && !hasExactMatch;

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered.length === 1) {
        onSelect(filtered[0]);
        setOpen(false);
        setSearch('');
      } else if (showCustomOption) {
        onCustomItem(search.trim());
        setOpen(false);
        setSearch('');
      }
    }
    if (e.key === 'Escape') setOpen(false);
  }

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
          setSearch(value || '');
        }}
        onKeyDown={handleKeyDown}
      />
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {filtered.map((item) => (
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
          ))}
          {showCustomOption && (
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-green-50 cursor-pointer transition-colors border-t border-gray-100"
              onClick={() => {
                onCustomItem(search.trim());
                setOpen(false);
                setSearch('');
              }}
            >
              <div className="flex items-center gap-2">
                <HiPlus className="h-3.5 w-3.5 text-green-600" />
                <span className="text-green-700 font-medium">Add &quot;{search.trim()}&quot; as custom item</span>
              </div>
            </button>
          )}
          {filtered.length === 0 && !showCustomOption && (
            <div className="px-3 py-2 text-sm text-gray-400">No items found</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id;
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingInvoice, setExistingInvoice] = useState(null);

  // Master data
  const [customers, setCustomers] = useState([]);
  const [itemsList, setItemsList] = useState([]);

  // Form state
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(formatDateForInput(new Date()));
  const [terms, setTerms] = useState('due_on_receipt');
  const [dueDate, setDueDate] = useState(formatDateForInput(new Date()));
  const [salesperson, setSalesperson] = useState('');

  // Line items
  const [lineItems, setLineItems] = useState([
    { id: 1, itemId: '', name: '', quantity: 1, rate: 0, tax: 0 },
  ]);
  const lineIdCounter = useRef(2);

  // Totals
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [adjustment, setAdjustment] = useState('');

  // Notes
  const [customerNotes, setCustomerNotes] = useState('');
  const [showTermsConditions, setShowTermsConditions] = useState(false);
  const [termsConditions, setTermsConditions] = useState('');

  // Errors
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function loadAll() {
      // Load master data
      let allCustomers = [];
      try {
        const custData = await apiClient.getInvoiceCustomers();
        allCustomers = custData.customers || custData || [];
      } catch (err) {
        console.error('Failed to load invoice customers:', err);
      }

      try {
        const itemsData = await apiClient.getInvoiceItems();
        setItemsList(itemsData.items || itemsData || []);
      } catch (err) {
        console.error('Failed to load invoice items:', err);
      }

      const restaurantId = typeof window !== 'undefined' ? localStorage.getItem('inv_restaurantId') : null;
      if (restaurantId) {
        try {
          const dineData = await apiClient.getInvoiceDineopenCustomers(restaurantId);
          const dineCustomers = (dineData.customers || dineData || []).map(c => ({ ...c, _source: 'dineopen' }));
          const existingPhones = new Set(allCustomers.map(c => c.phone || c.mobile).filter(Boolean));
          const newDineCustomers = dineCustomers.filter(c => !existingPhones.has(c.phone));
          allCustomers = [...allCustomers, ...newDineCustomers];
        } catch {}
      }
      setCustomers(allCustomers);

      // Load existing invoice
      try {
        const invData = await apiClient.getInvoice(invoiceId);
        const inv = invData.invoice || invData;
        setExistingInvoice(inv);

        setCustomerId(inv.customerId || '');
        setCustomerName(inv.customer?.name || inv.customer?.displayName || inv.customerName || '');
        setInvoiceNumber(inv.invoiceNumber || '');
        setInvoiceDate(inv.invoiceDate || formatDateForInput(new Date()));
        setTerms(inv.paymentTerms || 'due_on_receipt');
        setDueDate(inv.dueDate || formatDateForInput(new Date()));
        setSalesperson(inv.salesperson || '');

        const loadedItems = (inv.items || []).map((item, i) => ({
          id: i + 1,
          itemId: item.itemId || '',
          name: item.name || '',
          quantity: item.quantity || 1,
          rate: item.rate || 0,
          tax: item.taxRate || 0,
        }));
        if (loadedItems.length > 0) {
          setLineItems(loadedItems);
          lineIdCounter.current = loadedItems.length + 1;
        }

        setDiscountType(inv.discountType || 'percentage');
        setDiscountValue(inv.discountValue ? String(inv.discountValue) : '');
        setAdjustment(inv.adjustments ? String(inv.adjustments) : '');
        setCustomerNotes(inv.customerNotes || '');
        setTermsConditions(inv.termsAndConditions || '');
        if (inv.termsAndConditions) setShowTermsConditions(true);
      } catch (err) {
        showToast('Failed to load invoice', 'error');
        router.push('/invoice/invoices');
        return;
      }

      setLoading(false);
    }
    loadAll();
  }, [invoiceId]);

  // Recalculate due date when terms change
  useEffect(() => {
    if (!loading) {
      const days = termsDaysMap[terms] || 0;
      setDueDate(addDays(invoiceDate, days));
    }
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

  function addLineItem() {
    setLineItems([...lineItems, { id: lineIdCounter.current++, itemId: '', name: '', quantity: 1, rate: 0, tax: 0 }]);
  }

  function removeLineItem(id) {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((item) => item.id !== id));
  }

  function updateLineItem(id, field, value) {
    setLineItems(lineItems.map((item) => item.id === id ? { ...item, [field]: value } : item));
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

  async function handleCustomItem(lineId, customName) {
    setLineItems(prev => prev.map((item) =>
      item.id === lineId ? { ...item, itemId: '', name: customName, rate: item.rate || 0, tax: item.tax || 0 } : item
    ));
    try {
      const newItem = await apiClient.createInvoiceItem({ name: customName, type: 'goods' });
      const createdItem = newItem.item || newItem;
      const createdId = createdItem._id || createdItem.id;
      if (createdId) {
        setItemsList(prev => [...prev, createdItem]);
        setLineItems(prev => prev.map((item) =>
          item.id === lineId && item.name === customName ? { ...item, itemId: createdId } : item
        ));
      }
    } catch (err) {
      console.error('Failed to auto-create item:', err);
    }
  }

  function validate() {
    const newErrors = {};
    if (!customerId) newErrors.customer = 'Customer is required';
    if (lineItems.every((item) => !item.itemId && !item.name)) newErrors.items = 'At least one item is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        customerId,
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
      };

      await apiClient.updateInvoice(invoiceId, payload);
      showToast('Invoice updated successfully!', 'success');
      router.push(`/invoice/invoices/${invoiceId}`);
    } catch (err) {
      showToast(err.message || 'Failed to update invoice', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-gray-500">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (existingInvoice?.status === 'void' || existingInvoice?.status === 'paid') {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 font-medium mb-2">
            This invoice is {existingInvoice.status} and cannot be edited.
          </p>
          <Button variant="secondary" onClick={() => router.push(`/invoice/invoices/${invoiceId}`)}>
            Back to Invoice
          </Button>
        </div>
      </div>
    );
  }

  const customerOptions = customers.map((c) => ({
    value: c._id || c.id,
    label: `${c.name || c.displayName || c.companyName || ''}${c._source === 'dineopen' ? ' (DineOpen)' : ''}`,
  }));

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Edit Invoice {invoiceNumber && `#${invoiceNumber}`}</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 space-y-6">
          {/* Top Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice#</label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                value={invoiceNumber}
                readOnly
              />
            </div>

            <Input label="Invoice Date" type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
            <Select label="Terms" options={termsOptions} value={terms} onChange={(e) => setTerms(e.target.value)} />
            <Input label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            <Input label="Salesperson" placeholder="Enter salesperson name" value={salesperson} onChange={(e) => setSalesperson(e.target.value)} />
          </div>

          {/* Item Table */}
          <div className="mt-8">
            <div className="border border-gray-200 rounded-lg overflow-visible">
              <div className="grid grid-cols-12 gap-0 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                <div className="col-span-5 px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item Details</div>
                <div className="col-span-2 px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</div>
                <div className="col-span-2 px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rate</div>
                <div className="col-span-2 px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</div>
                <div className="col-span-1 px-2 py-2.5" />
              </div>

              {lineItems.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-0 border-b border-gray-100 items-center hover:bg-gray-50/50">
                  <div className="col-span-5 px-3 py-2">
                    <ItemSearchSelect
                      items={itemsList}
                      value={item.name}
                      onSelect={(selected) => handleItemSelect(item.id, selected)}
                      onCustomItem={(name) => handleCustomItem(item.id, name)}
                    />
                  </div>
                  <div className="col-span-2 px-3 py-2">
                    <input type="number" min="1" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 text-center"
                      value={item.quantity} onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)} />
                  </div>
                  <div className="col-span-2 px-3 py-2">
                    <input type="number" min="0" step="0.01" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500"
                      value={item.rate} onChange={(e) => updateLineItem(item.id, 'rate', e.target.value)} />
                  </div>
                  <div className="col-span-2 px-3 py-2 text-right">
                    <span className="text-sm font-medium text-gray-700">{formatCurrency(item.quantity * item.rate)}</span>
                  </div>
                  <div className="col-span-1 px-2 py-2 text-center">
                    <button type="button" onClick={() => removeLineItem(item.id)}
                      className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer disabled:opacity-30"
                      disabled={lineItems.length === 1}>
                      <HiX className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {errors.items && <p className="mt-1 text-xs text-red-500">{errors.items}</p>}

            <div className="flex gap-3 mt-3">
              <button type="button" onClick={addLineItem} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                <HiPlus className="h-4 w-4" /> Add New Row
              </button>
            </div>
          </div>

          {/* Totals Section */}
          <div className="flex flex-col md:flex-row gap-8 mt-6">
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Notes</label>
                <textarea className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                  rows={3} placeholder="Will be displayed on the invoice" value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} />
              </div>

              {!showTermsConditions ? (
                <button type="button" className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                  onClick={() => setShowTermsConditions(true)}>
                  + Add Terms and Conditions
                </button>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                  <textarea className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                    rows={3} placeholder="Enter your terms and conditions" value={termsConditions} onChange={(e) => setTermsConditions(e.target.value)} />
                </div>
              )}
            </div>

            <div className="w-full md:w-80">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sub Total</span>
                  <span className="font-medium text-gray-900">{formatCurrency(subTotal)}</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-gray-600 whitespace-nowrap">Discount</span>
                  <div className="flex items-center gap-1">
                    <input type="number" min="0" step="0.01"
                      className="w-20 px-2 py-1 text-sm border border-gray-200 rounded-md text-right focus:outline-none focus:border-blue-500"
                      value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} placeholder="0" />
                    <select className="px-2 py-1 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:border-blue-500"
                      value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                      <option value="percentage">%</option>
                      <option value="fixed">Rs.</option>
                    </select>
                  </div>
                  <span className="text-sm text-gray-900 font-medium w-24 text-right">-{formatCurrency(discountAmount)}</span>
                </div>

                {taxTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium text-gray-900">{formatCurrency(taxTotal)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-gray-600">Adjustment</span>
                  <input type="number" step="0.01"
                    className="w-28 px-2 py-1 text-sm border border-gray-200 rounded-md text-right focus:outline-none focus:border-blue-500"
                    value={adjustment} onChange={(e) => setAdjustment(e.target.value)} placeholder="0.00" />
                </div>

                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-sm font-semibold text-gray-900">Total (Rs.)</span>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <Button variant="ghost" onClick={() => router.push(`/invoice/invoices/${invoiceId}`)}>
            Cancel
          </Button>
          <Button variant="primary" loading={saving} onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
