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
import { useCurrency } from '../../../../contexts/CurrencyContext';

const statusTabs = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'sent', label: 'Sent' },
  { key: 'returned', label: 'Returned' },
];

const statusBadgeMap = {
  draft: { variant: 'default', label: 'Draft' },
  sent: { variant: 'info', label: 'Sent' },
  returned: { variant: 'success', label: 'Returned' },
};

const challanTypeBadgeMap = {
  supply_on_approval: { variant: 'info', label: 'Supply on Approval' },
  job_work: { variant: 'warning', label: 'Job Work' },
  supply_return: { variant: 'danger', label: 'Supply Return' },
};

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ChallansPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { getCurrencySymbol } = useCurrency();
  const cs = getCurrencySymbol();

  function formatCurrency(amount) {
    if (amount === null || amount === undefined) return `${cs}0.00`;
    return `${cs}${Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  const [activeTab, setActiveTab] = useState('all');
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallans();
  }, [activeTab]);

  async function fetchChallans() {
    setLoading(true);
    try {
      const query = activeTab === 'all' ? '' : `?status=${activeTab}`;
      const data = await apiClient.getInvoiceChallans(query);
      setChallans(data.challans || data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load challans', 'error');
      setChallans([]);
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    {
      key: 'challanNumber',
      label: 'Challan#',
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
      key: 'challanDate',
      label: 'Date',
      render: (val) => formatDate(val),
    },
    {
      key: 'challanType',
      label: 'Type',
      render: (val) => {
        const badge = challanTypeBadgeMap[val] || { variant: 'default', label: val || '-' };
        return <Badge variant={badge.variant}>{badge.label}</Badge>;
      },
    },
    {
      key: 'total',
      label: 'Total',
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
        title="Delivery Challans"
        subtitle="Manage your delivery challans"
        actions={
          <Button
            icon={HiPlus}
            onClick={() => router.push('/invoice/challans/new')}
          >
            New Challan
          </Button>
        }
      />

      <Tabs tabs={statusTabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-4">
        {!loading && challans.length === 0 ? (
          <EmptyState
            icon={HiDocumentDuplicate}
            title="No delivery challans found"
            description={
              activeTab === 'all'
                ? 'Create your first delivery challan to get started.'
                : `No ${activeTab} challans found.`
            }
            action={
              <Button icon={HiPlus} onClick={() => router.push('/invoice/challans/new')}>
                New Challan
              </Button>
            }
          />
        ) : (
          <Table
            columns={columns}
            data={challans}
            loading={loading}
            emptyMessage="No challans found"
            onRowClick={(row) => router.push(`/invoice/challans/${row._id || row.id}`)}
          />
        )}
      </div>
    </div>
  );
}
