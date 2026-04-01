'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../../../../lib/api';
import { useToast } from '../contexts/InvoiceToastContext';
import PageHeader from '../components/layout/PageHeader';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import { HiPlus, HiCash } from 'react-icons/hi';

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'advertising', label: 'Advertising' },
  { value: 'bank_fees', label: 'Bank Fees' },
  { value: 'contract_work', label: 'Contract Work' },
  { value: 'fuel', label: 'Fuel' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'meals', label: 'Meals' },
  { value: 'office_supplies', label: 'Office Supplies' },
  { value: 'postage', label: 'Postage' },
  { value: 'printing', label: 'Printing' },
  { value: 'rent', label: 'Rent' },
  { value: 'repairs', label: 'Repairs' },
  { value: 'salaries', label: 'Salaries' },
  { value: 'software', label: 'Software' },
  { value: 'telephone', label: 'Telephone' },
  { value: 'travel', label: 'Travel' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'other', label: 'Other' },
];

const categoryLabels = Object.fromEntries(
  categoryOptions.filter((o) => o.value).map((o) => [o.value, o.label])
);

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return 'Rs.0.00';
  return `Rs.${Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ExpensesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter, dateFrom, dateTo]);

  async function fetchExpenses() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter) params.set('category', categoryFilter);
      if (dateFrom) params.set('startDate', dateFrom);
      if (dateTo) params.set('endDate', dateTo);
      const query = params.toString() ? params.toString() : '';
      const data = await apiClient.getInvoiceExpenses(query);
      setExpenses(data.expenses || data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load expenses', 'error');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    {
      key: 'date',
      label: 'Date',
      render: (val) => formatDate(val),
    },
    {
      key: 'category',
      label: 'Category',
      render: (val) => (
        <span className="font-medium text-gray-900">
          {categoryLabels[val] || val || '-'}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (val) => (
        <span className="font-semibold text-gray-900">{formatCurrency(val)}</span>
      ),
    },
    {
      key: 'invoiceNumber',
      label: 'Invoice#',
      render: (val) => val || '-',
    },
    {
      key: 'customerName',
      label: 'Customer',
      render: (val, row) => row.customer?.name || row.customerName || '-',
    },
    {
      key: 'notes',
      label: 'Notes',
      render: (val) => (
        <span className="text-gray-500 truncate block max-w-[200px]" title={val}>
          {val || '-'}
        </span>
      ),
    },
  ];

  const hasExpenses = !loading && expenses.length > 0;
  const isEmpty = !loading && expenses.length === 0 && !categoryFilter && !dateFrom && !dateTo;
  const noResults = !loading && expenses.length === 0 && (categoryFilter || dateFrom || dateTo);

  return (
    <div>
      <PageHeader
        title="Expenses"
        subtitle="Track your business expenses"
        actions={
          <Button
            icon={HiPlus}
            onClick={() => router.push('/invoice/expenses/new')}
          >
            New Expense
          </Button>
        }
      />

      {/* Filters */}
      {!isEmpty && (
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div className="w-48">
            <Select
              options={categoryOptions}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              placeholder="All Categories"
            />
          </div>
          <div className="w-40">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="From"
            />
          </div>
          <div className="w-40">
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="To"
            />
          </div>
          {(categoryFilter || dateFrom || dateTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCategoryFilter('');
                setDateFrom('');
                setDateTo('');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Empty State */}
      {isEmpty && (
        <EmptyState
          icon={HiCash}
          title="No expenses recorded"
          description="Start tracking your business expenses to get a clear picture of your spending."
          action={
            <Button icon={HiPlus} onClick={() => router.push('/invoice/expenses/new')}>
              Record Expense
            </Button>
          }
        />
      )}

      {/* No Results */}
      {noResults && (
        <EmptyState
          icon={HiCash}
          title="No expenses found"
          description="No expenses match your current filters. Try adjusting the filters."
        />
      )}

      {/* Table */}
      {(hasExpenses || loading) && (
        <Table
          columns={columns}
          data={expenses}
          loading={loading}
          emptyMessage="No expenses found"
          onRowClick={(row) => router.push(`/invoice/expenses/${row._id || row.id}`)}
        />
      )}
    </div>
  );
}
