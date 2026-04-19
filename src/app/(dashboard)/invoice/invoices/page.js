'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../../../../lib/api';
import { useToast } from '../contexts/InvoiceToastContext';
import PageHeader from '../components/layout/PageHeader';
import Table from '../components/ui/Table';
import Tabs from '../components/ui/Tabs';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { HiPlus, HiDocumentText, HiSearch, HiX } from 'react-icons/hi';

const statusTabs = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'sent', label: 'Sent' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'paid', label: 'Paid' },
  { key: 'void', label: 'Void' },
];

const statusBadgeMap = {
  draft: { variant: 'default', label: 'Draft' },
  sent: { variant: 'info', label: 'Sent' },
  overdue: { variant: 'danger', label: 'Overdue' },
  paid: { variant: 'success', label: 'Paid' },
  void: { variant: 'warning', label: 'Void' },
};

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

export default function InvoicesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => fetchInvoices(), search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [activeTab, search, startDate, endDate]);

  async function fetchInvoices() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.set('status', activeTab);
      if (search) params.set('search', search);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      const query = params.toString();
      const data = await apiClient.getInvoices(query);
      setInvoices(data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load invoices', 'error');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice#',
      render: (val) => (
        <span className="font-medium text-blue-600">{val}</span>
      ),
    },
    {
      key: 'customerName',
      label: 'Customer',
      render: (val, row) => row.customer?.name || row.customerName || '-',
    },
    {
      key: 'invoiceDate',
      label: 'Date',
      render: (val) => formatDate(val),
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (val) => formatDate(val),
    },
    {
      key: 'total',
      label: 'Amount',
      render: (val) => (
        <span className="font-medium">{formatCurrency(val)}</span>
      ),
    },
    {
      key: 'balanceDue',
      label: 'Balance Due',
      render: (val) => (
        <span className="font-medium">{formatCurrency(val)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        const badge = statusBadgeMap[val] || statusBadgeMap.draft;
        return <Badge variant={badge.variant}>{badge.label}</Badge>;
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle="Manage your invoices"
        actions={
          <Button
            icon={HiPlus}
            onClick={() => router.push('/invoice/invoices/new')}
          >
            New Invoice
          </Button>
        }
      />

      <div className="flex flex-wrap gap-3 mt-4 mb-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by invoice# or customer..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" />
        {(search || startDate || endDate) && (
          <button onClick={() => { setSearch(''); setStartDate(''); setEndDate(''); }}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
            <HiX className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      <Tabs tabs={statusTabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-4">
        {!loading && invoices.length === 0 ? (
          <EmptyState
            icon={HiDocumentText}
            title="No invoices found"
            description={
              activeTab === 'all'
                ? 'Create your first invoice to get started.'
                : `No ${activeTab} invoices found.`
            }
            action={
              <Button icon={HiPlus} onClick={() => router.push('/invoice/invoices/new')}>
                New Invoice
              </Button>
            }
          />
        ) : (
          <Table
            columns={columns}
            data={invoices}
            loading={loading}
            emptyMessage="No invoices found"
            onRowClick={(row) => router.push(`/invoice/invoices/${row.id}`)}
          />
        )}
      </div>
    </div>
  );
}
