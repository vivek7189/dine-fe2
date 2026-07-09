'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../../../../../lib/api';
import { useToast } from '../../contexts/InvoiceToastContext';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import Tabs from '../../components/ui/Tabs';
import { HiSearch, HiUpload, HiCloudUpload } from 'react-icons/hi';
import useInvoiceAI from '../../hooks/useInvoiceAI';
import SparkleIcon from '../../components/ai/SparkleIcon';
import ComboBox from '../../components/ui/ComboBox';
import { useCurrency } from '../../../../../contexts/CurrencyContext';
import { getAllCountriesWithCurrency } from '../../../../../lib/currencyData';

const expenseTabs = [
  { key: 'expense', label: 'Record Expense' },
  { key: 'mileage', label: 'Record Mileage' },
  { key: 'bulk', label: 'Bulk Add' },
];

// Build currency options from all supported countries, deduplicating by currency code
const allCountries = getAllCountriesWithCurrency();
const currencyMap = new Map();
allCountries.forEach(c => {
  if (!currencyMap.has(c.currencyCode)) {
    currencyMap.set(c.currencyCode, { value: c.currencyCode, label: `${c.currencyCode} - ${c.currencyName}` });
  }
});
const currencyOptions = Array.from(currencyMap.values()).sort((a, b) => a.value.localeCompare(b.value));

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export default function NewExpensePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { currencySettings } = useCurrency();

  const [activeTab, setActiveTab] = useState('expense');
  const [saving, setSaving] = useState(false);
  const [savingNew, setSavingNew] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [errors, setErrors] = useState({});

  // AI Categorization
  const { generate: aiGenerate, isGenerating: aiCatLoading } = useInvoiceAI();
  const [categories, setCategories] = useState([]);
  const [aiCategory, setAiCategory] = useState(null);
  const debounceRef = useRef(null);

  const defaultCurrency = currencySettings?.currencyCode || 'INR';

  const [form, setForm] = useState({
    date: todayISO(),
    category: '',
    amount: '',
    currency: defaultCurrency,
    invoiceNumber: '',
    notes: '',
    customerId: '',
    customerName: '',
    isBillable: false,
  });

  // Update default currency when currencySettings loads asynchronously
  useEffect(() => {
    if (currencySettings?.currencyCode) {
      setForm(prev => {
        // Only update if user hasn't manually changed from the initial default
        if (prev.currency === 'INR' || !prev.currency) {
          return { ...prev, currency: currencySettings.currencyCode };
        }
        return prev;
      });
    }
  }, [currencySettings?.currencyCode]);

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

  function updateForm(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === 'category') setErrors((prev) => ({ ...prev, category: '' }));
  }

  // Fetch org categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await apiClient.getInvoiceExpenseCategories();
        const cats = Array.isArray(data) ? data : [];
        setCategories(cats);
      } catch {
        // Use defaults
        setCategories(['advertising','bank_fees','contract_work','fuel','insurance','meals','office_supplies','postage','printing','rent','repairs','salaries','software','telephone','travel','utilities','other']);
      }
    }
    fetchCategories();
  }, []);

  // Auto-suggest category when notes change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const notes = form.notes;
    if (!notes || notes.trim().length < 5) {
      setAiCategory(null);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const result = await aiGenerate('categorize-expense', {
        notes: notes,
        amount: form.amount,
        categories: categories,
      });
      if (result?.category) setAiCategory(result);
    }, 800);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [form.notes]);

  function selectCustomer(customer) {
    setForm((prev) => ({
      ...prev,
      customerId: customer._id || customer.id,
      customerName: customer.displayName || customer.name || '',
    }));
    setCustomerSearch(customer.displayName || customer.name || '');
    setShowCustomerDropdown(false);
  }

  function validate() {
    const errs = {};
    if (!form.category) errs.category = 'Category is required';
    if (!form.amount || Number(form.amount) <= 0) errs.amount = 'Valid amount is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave(saveAndNew = false) {
    if (!validate()) return;
    saveAndNew ? setSavingNew(true) : setSaving(true);
    try {
      const payload = {
        date: form.date,
        category: form.category,
        amount: Number(form.amount),
        currency: form.currency,
        invoiceNumber: form.invoiceNumber || undefined,
        notes: form.notes || undefined,
        customerId: form.customerId || undefined,
        customerName: form.customerName || undefined,
        isBillable: form.isBillable,
      };
      await apiClient.createInvoiceExpense(payload);
      showToast('Expense recorded successfully', 'success');

      if (saveAndNew) {
        setForm({
          date: todayISO(),
          category: '',
          amount: '',
          currency: defaultCurrency,
          invoiceNumber: '',
          notes: '',
          customerId: '',
          customerName: '',
          isBillable: false,
        });
        setCustomerSearch('');
        setErrors({});
      } else {
        router.push('/invoice/expenses');
      }
    } catch (err) {
      showToast(err.message || 'Failed to record expense', 'error');
    } finally {
      setSaving(false);
      setSavingNew(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="New Expense"
        subtitle="Record a business expense"
      />

      <Tabs tabs={expenseTabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'expense' ? (
          <div className="space-y-6">
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date */}
                <Input
                  label="Date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                />

                {/* Category */}
                <div>
                  {aiCategory && aiCategory.category !== form.category && (
                    <button
                      type="button"
                      onClick={() => updateForm('category', aiCategory.category)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-2 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-full hover:bg-purple-100 transition-colors cursor-pointer"
                    >
                      {aiCatLoading ? (
                        <div className="h-3 w-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <SparkleIcon className="h-3 w-3" />
                      )}
                      AI suggests: {aiCategory.category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </button>
                  )}
                  <ComboBox
                    label="Category"
                    options={categories}
                    value={form.category}
                    onChange={(val) => updateForm('category', val)}
                    placeholder="Search or create category..."
                    error={errors.category}
                  />
                </div>

                {/* Amount with Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={form.currency}
                      onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))}
                      className="w-28 px-2 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      {currencyOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.value}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.amount}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, amount: e.target.value }));
                        setErrors((prev) => ({ ...prev, amount: '' }));
                      }}
                      placeholder="0.00"
                      className={`flex-1 px-3 py-2 text-sm border rounded-lg transition-colors ${
                        errors.amount
                          ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                      } placeholder:text-gray-400`}
                    />
                  </div>
                  {errors.amount && (
                    <p className="mt-1 text-xs text-red-500">{errors.amount}</p>
                  )}
                </div>

                {/* Invoice# */}
                <Input
                  label="Invoice#"
                  value={form.invoiceNumber}
                  onChange={(e) => setForm((prev) => ({ ...prev, invoiceNumber: e.target.value }))}
                  placeholder="Enter invoice number"
                />
              </div>

              {/* Notes */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setForm((prev) => ({ ...prev, notes: e.target.value }));
                    }
                  }}
                  placeholder="Add notes about this expense..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400 resize-none"
                />
                <p className="mt-1 text-xs text-gray-400 text-right">
                  {form.notes.length}/500 characters
                </p>
              </div>

              {/* Receipt Upload Area */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Receipt</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <HiCloudUpload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Drag and Drop your Receipts
                  </p>
                  <p className="text-xs text-gray-400 mb-3">
                    Supports JPG, PNG, PDF (max 5MB)
                  </p>
                  <Button variant="outline" size="sm" icon={HiUpload}>
                    Upload your Files
                  </Button>
                </div>
              </div>
            </Card>

            {/* Customer & Billable */}
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Search */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
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
                      placeholder="Search customers (optional)..."
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
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
                </div>

                {/* Billable */}
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isBillable}
                      onChange={(e) => setForm((prev) => ({ ...prev, isBillable: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Is Billable
                    </span>
                  </label>
                </div>
              </div>
            </Card>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => router.push('/invoice/expenses')}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                loading={savingNew}
                onClick={() => handleSave(true)}
              >
                Save and New (Opt+N)
              </Button>
              <Button
                loading={saving}
                onClick={() => handleSave(false)}
              >
                Save (Opt+S)
              </Button>
            </div>
          </div>
        ) : activeTab === 'mileage' ? (
          <Card>
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Mileage Tracking</h3>
              <p className="text-sm text-gray-500 text-center max-w-sm">
                Mileage expense tracking is coming soon. You will be able to log trips and automatically calculate reimbursable amounts.
              </p>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Bulk Add Expenses</h3>
              <p className="text-sm text-gray-500 text-center max-w-sm">
                Bulk expense import is coming soon. You will be able to upload a CSV or Excel file to add multiple expenses at once.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
