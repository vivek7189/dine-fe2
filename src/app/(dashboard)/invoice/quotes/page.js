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
import { HiPlus, HiDocumentDuplicate } from 'react-icons/hi';

const statusTabs = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'sent', label: 'Sent' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'declined', label: 'Declined' },
  { key: 'invoiced', label: 'Invoiced' },
];

const statusBadgeMap = {
  draft: { variant: 'default', label: 'Draft' },
  sent: { variant: 'info', label: 'Sent' },
  accepted: { variant: 'success', label: 'Accepted' },
  declined: { variant: 'danger', label: 'Declined' },
  invoiced: { variant: 'warning', label: 'Invoiced' },
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

export default function QuotesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotes();
  }, [activeTab]);

  async function fetchQuotes() {
    setLoading(true);
    try {
      const query = activeTab === 'all' ? '' : `?status=${activeTab}`;
      const data = await apiClient.getInvoiceQuotes(query);
      setQuotes(data.quotes || data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load quotes', 'error');
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    {
      key: 'quoteNumber',
      label: 'Quote#',
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
      key: 'quoteDate',
      label: 'Date',
      render: (val) => formatDate(val),
    },
    {
      key: 'expiryDate',
      label: 'Expiry Date',
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
        title="Quotes"
        subtitle="Manage your quotes and estimates"
        actions={
          <Button
            icon={HiPlus}
            onClick={() => router.push('/invoice/quotes/new')}
          >
            New Quote
          </Button>
        }
      />

      <Tabs tabs={statusTabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-4">
        {!loading && quotes.length === 0 ? (
          <EmptyState
            icon={HiDocumentDuplicate}
            title="No quotes found"
            description={
              activeTab === 'all'
                ? 'Create your first quote to get started.'
                : `No ${activeTab} quotes found.`
            }
            action={
              <Button icon={HiPlus} onClick={() => router.push('/invoice/quotes/new')}>
                New Quote
              </Button>
            }
          />
        ) : (
          <Table
            columns={columns}
            data={quotes}
            loading={loading}
            emptyMessage="No quotes found"
            onRowClick={(row) => router.push(`/invoice/quotes/${row._id || row.id}`)}
          />
        )}
      </div>
    </div>
  );
}
