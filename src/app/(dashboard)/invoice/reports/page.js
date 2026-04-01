'use client';

import { useState, useEffect } from 'react';
import apiClient from '../../../../lib/api';
import { useToast } from '../contexts/InvoiceToastContext';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import {
  HiCurrencyRupee,
  HiTrendingUp,
  HiCash,
  HiChevronDown,
  HiChevronUp,
} from 'react-icons/hi';

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

const reportCards = [
  {
    key: 'receivables',
    title: 'Receivables Aging Summary',
    icon: HiCurrencyRupee,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    key: 'sales',
    title: 'Sales Summary',
    icon: HiTrendingUp,
    color: 'bg-green-50 text-green-600',
  },
  {
    key: 'expenses',
    title: 'Expense Summary',
    icon: HiCash,
    color: 'bg-orange-50 text-orange-600',
  },
];

export default function ReportsPage() {
  const { showToast } = useToast();
  const [expandedCard, setExpandedCard] = useState(null);
  const [summaries, setSummaries] = useState({});
  const [loadingSummaries, setLoadingSummaries] = useState(true);
  const [detailData, setDetailData] = useState({});
  const [loadingDetail, setLoadingDetail] = useState({});

  // Fetch summary data for all cards
  useEffect(() => {
    async function fetchSummaries() {
      try {
        const [receivables, sales, expenses] = await Promise.allSettled([
          apiClient.getInvoiceReportReceivables(),
          apiClient.getInvoiceReportSales(),
          apiClient.getInvoiceReportExpenses(),
        ]);
        setSummaries({
          receivables: receivables.status === 'fulfilled' ? receivables.value : null,
          sales: sales.status === 'fulfilled' ? sales.value : null,
          expenses: expenses.status === 'fulfilled' ? expenses.value : null,
        });
      } catch {
        // Summaries remain empty
      } finally {
        setLoadingSummaries(false);
      }
    }
    fetchSummaries();
  }, []);

  async function toggleCard(key) {
    if (expandedCard === key) {
      setExpandedCard(null);
      return;
    }
    setExpandedCard(key);

    if (detailData[key]) return; // Already fetched

    setLoadingDetail((prev) => ({ ...prev, [key]: true }));
    try {
      let data;
      if (key === 'receivables') {
        data = await apiClient.getInvoiceReportReceivables();
      } else if (key === 'sales') {
        data = await apiClient.getInvoiceReportSales();
      } else if (key === 'expenses') {
        data = await apiClient.getInvoiceReportExpenses();
      }
      setDetailData((prev) => ({ ...prev, [key]: data }));
    } catch (err) {
      const card = reportCards.find((c) => c.key === key);
      showToast(err.message || `Failed to load ${card?.title}`, 'error');
    } finally {
      setLoadingDetail((prev) => ({ ...prev, [key]: false }));
    }
  }

  function getSummaryValue(key) {
    if (loadingSummaries) return null;
    const data = summaries[key];
    if (!data) return 'Rs.0.00';

    switch (key) {
      case 'receivables':
        return formatCurrency(data.aging?.total?.amount || 0);
      case 'sales':
        return formatCurrency(data.summary?.totalSales || 0);
      case 'expenses':
        return formatCurrency(data.summary?.totalExpenses || 0);
      default:
        return 'Rs.0.00';
    }
  }

  function renderDetailContent(key) {
    const data = detailData[key];
    if (!data) return null;

    switch (key) {
      case 'receivables':
        return renderReceivablesDetail(data);
      case 'sales':
        return renderSalesDetail(data);
      case 'expenses':
        return renderExpensesDetail(data);
      default:
        return null;
    }
  }

  function renderReceivablesDetail(data) {
    const aging = data.aging || {};
    const agingBuckets = [
      { label: 'Current', amount: aging.current?.amount || 0, variant: 'success' },
      { label: '1-15 Days', amount: aging['1_15']?.amount || 0, variant: 'warning' },
      { label: '16-30 Days', amount: aging['16_30']?.amount || 0, variant: 'warning' },
      { label: '31-45 Days', amount: aging['31_45']?.amount || 0, variant: 'danger' },
      { label: 'Above 45 Days', amount: aging['45_plus']?.amount || 0, variant: 'danger' },
    ];

    const invoiceList = data.invoices || [];
    const invoiceColumns = [
      {
        key: 'invoiceNumber',
        label: 'Invoice #',
        render: (val) => <span className="font-medium text-gray-900">{val}</span>,
      },
      {
        key: 'dueDate',
        label: 'Due Date',
        render: (val) => formatDate(val),
      },
      {
        key: 'balanceDue',
        label: 'Balance Due',
        render: (val) => (
          <span className={Number(val) > 0 ? 'text-red-600 font-medium' : ''}>
            {formatCurrency(val)}
          </span>
        ),
      },
      {
        key: 'daysOverdue',
        label: 'Days Overdue',
        render: (val) => <span className="font-semibold">{val || 0}</span>,
      },
    ];

    return (
      <div className="space-y-4">
        {/* Aging Buckets */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {agingBuckets.map((bucket) => (
            <div
              key={bucket.label}
              className="bg-gray-50 rounded-lg p-3 border border-gray-100"
            >
              <p className="text-xs font-medium text-gray-500">{bucket.label}</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {formatCurrency(bucket.amount)}
              </p>
            </div>
          ))}
        </div>

        {/* Invoice Breakdown */}
        {invoiceList.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Invoices</h4>
            <Table
              columns={invoiceColumns}
              data={invoiceList}
              emptyMessage="No invoice data"
            />
          </div>
        )}
      </div>
    );
  }

  function renderSalesDetail(data) {
    const summary = data.summary || {};
    const byStatus = data.byStatus || {};
    const statusRows = Object.entries(byStatus).map(([status, val]) => ({
      status,
      count: val.count || 0,
      amount: val.amount || 0,
    }));
    const statusColumns = [
      {
        key: 'status',
        label: 'Status',
        render: (val) => <span className="font-medium text-gray-900 capitalize">{val}</span>,
      },
      {
        key: 'count',
        label: 'Count',
        render: (val) => val || 0,
      },
      {
        key: 'amount',
        label: 'Amount',
        render: (val) => formatCurrency(val),
      },
    ];

    return (
      <div className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <p className="text-xs font-medium text-blue-600">Total Sales</p>
            <p className="text-lg font-bold text-blue-900 mt-1">
              {formatCurrency(summary.totalSales || 0)}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <p className="text-xs font-medium text-green-600">Total Received</p>
            <p className="text-lg font-bold text-green-900 mt-1">
              {formatCurrency(summary.totalReceived || 0)}
            </p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
            <p className="text-xs font-medium text-orange-600">Total Outstanding</p>
            <p className="text-lg font-bold text-orange-900 mt-1">
              {formatCurrency(summary.totalOutstanding || 0)}
            </p>
          </div>
        </div>

        {/* By Status Breakdown */}
        {statusRows.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">By Status</h4>
            <Table
              columns={statusColumns}
              data={statusRows}
              emptyMessage="No status data"
            />
          </div>
        )}
      </div>
    );
  }

  function renderExpensesDetail(data) {
    const summary = data.summary || {};
    const byCategoryObj = data.byCategory || {};
    const categories = Object.entries(byCategoryObj).map(([category, val]) => ({
      category,
      count: val.count || 0,
      total: val.amount || 0,
    }));
    const categoryColumns = [
      {
        key: 'category',
        label: 'Category',
        render: (val) => <span className="font-medium text-gray-900 capitalize">{(val || '').replace(/_/g, ' ')}</span>,
      },
      {
        key: 'count',
        label: 'Count',
        render: (val) => val || 0,
      },
      {
        key: 'total',
        label: 'Total Amount',
        render: (val) => (
          <span className="font-semibold">{formatCurrency(val)}</span>
        ),
      },
    ];

    return (
      <div className="space-y-4">
        {/* Total */}
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-orange-600">Total Expenses</p>
              <p className="text-xl font-bold text-orange-900 mt-1">
                {formatCurrency(summary.totalExpenses || 0)}
              </p>
            </div>
            {summary.expenseCount !== undefined && (
              <div className="text-right">
                <p className="text-xs font-medium text-orange-600">Total Records</p>
                <p className="text-xl font-bold text-orange-900 mt-1">{summary.expenseCount}</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        {categories.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">By Category</h4>
            <Table
              columns={categoryColumns}
              data={categories}
              emptyMessage="No category data"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="View financial summaries and insights"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {reportCards.map((card) => {
          const Icon = card.icon;
          const summaryVal = getSummaryValue(card.key);
          return (
            <button
              key={card.key}
              onClick={() => toggleCard(card.key)}
              className={`text-left bg-white rounded-lg border transition-all cursor-pointer ${
                expandedCard === card.key
                  ? 'border-blue-300 ring-1 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{card.title}</h3>
                      {loadingSummaries ? (
                        <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mt-1" />
                      ) : (
                        <p className="text-lg font-bold text-gray-900 mt-0.5">{summaryVal}</p>
                      )}
                    </div>
                  </div>
                  {expandedCard === card.key ? (
                    <HiChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <HiChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded Detail */}
      {expandedCard && (
        <Card title={reportCards.find((c) => c.key === expandedCard)?.title}>
          {loadingDetail[expandedCard] ? (
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
              <div className="h-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 bg-gray-200 rounded animate-pulse w-2/3" />
            </div>
          ) : detailData[expandedCard] ? (
            renderDetailContent(expandedCard)
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No data available for this report.</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
