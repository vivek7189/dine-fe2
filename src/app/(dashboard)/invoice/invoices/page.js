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
import { HiPlus, HiDocumentText } from 'react-icons/hi';

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

  useEffect(() => {
    fetchInvoices();
  }, [activeTab]);

  async function fetchInvoices() {
    setLoading(true);
    try {
      const query = activeTab === 'all' ? '' : `?status=${activeTab}`;
      const data = await apiClient.getInvoices(query);
      setInvoices(data.invoices || data || []);
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
            onRowClick={(row) => router.push(`/invoice/invoices/${row._id || row.id}`)}
          />
        )}
      </div>
    </div>
  );
}
