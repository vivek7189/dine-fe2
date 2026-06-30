'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../../../../lib/api';
import Card from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';
import Button from '../components/ui/Button';
import { HiPlus, HiCurrencyRupee } from 'react-icons/hi';
import { useCurrency } from '../../../../contexts/CurrencyContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const dashboardTabs = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'recent', label: 'Recent Updates' },
];

const agingBuckets = [
  { key: 'current', label: 'CURRENT', color: 'bg-green-500', textColor: 'text-green-600' },
  { key: '1-15', label: '1-15 Days', color: 'bg-red-400', textColor: 'text-red-500' },
  { key: '16-30', label: '16-30 Days', color: 'bg-red-500', textColor: 'text-red-600' },
  { key: '31-45', label: '31-45 Days', color: 'bg-red-600', textColor: 'text-red-700' },
  { key: '45+', label: 'Above 45 Days', color: 'bg-red-700', textColor: 'text-red-800' },
];

const defaultMonths = [
  'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
  'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar',
];

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '0.00';
  return Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const { getCurrencySymbol } = useCurrency();
  const cs = getCurrencySymbol();
  const [orgName, setOrgName] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [receivables, setReceivables] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [loadingReceivables, setLoadingReceivables] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);

  useEffect(() => {
    async function fetchOrg() {
      try {
        const org = await apiClient.getInvoiceOrg();
        setOrgName(org?.name || org?.orgName || '');
      } catch { /* ignore */ }
    }
    fetchOrg();
  }, []);

  useEffect(() => {
    async function fetchReceivables() {
      try {
        const raw = await apiClient.getInvoiceReportReceivables();
        const aging = raw.aging || {};
        setReceivables({
          total: aging.total?.amount || 0,
          current: aging.current?.amount || 0,
          overdue: {
            '1-15': aging['1_15']?.amount || 0,
            '16-30': aging['16_30']?.amount || 0,
            '31-45': aging['31_45']?.amount || 0,
            '45+': aging['45_plus']?.amount || 0,
          },
        });
      } catch {
        setReceivables({
          total: 0,
          current: 0,
          overdue: { '1-15': 0, '16-30': 0, '31-45': 0, '45+': 0 },
        });
      } finally {
        setLoadingReceivables(false);
      }
    }

    async function fetchSales() {
      try {
        const raw = await apiClient.getInvoiceReportSales();
        const summary = raw.summary || {};
        setSalesData({
          months: defaultMonths.map((m) => ({
            month: m,
            sales: 0,
            receipts: 0,
            expenses: 0,
          })),
          totalSales: summary.totalSales || 0,
          totalReceipts: summary.totalReceived || 0,
          totalExpenses: 0,
        });
      } catch {
        setSalesData({
          months: defaultMonths.map((m) => ({
            month: m,
            sales: 0,
            receipts: 0,
            expenses: 0,
          })),
          totalSales: 0,
          totalReceipts: 0,
          totalExpenses: 0,
        });
      } finally {
        setLoadingSales(false);
      }
    }

    fetchReceivables();
    fetchSales();
  }, []);

  const totalReceivable = receivables?.total || 0;
  const currentAmount = receivables?.current || 0;
  const overdueAmounts = receivables?.overdue || {};
  const totalOverdue =
    (overdueAmounts['1-15'] || 0) +
    (overdueAmounts['16-30'] || 0) +
    (overdueAmounts['31-45'] || 0) +
    (overdueAmounts['45+'] || 0);

  const chartData = salesData?.months || defaultMonths.map((m) => ({
    month: m,
    sales: 0,
    receipts: 0,
    expenses: 0,
  }));

  const isMobileEmbed = typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__;

  return (
    <div>
      {/* Greeting */}
      <div className={isMobileEmbed ? 'mb-3' : 'mb-6'}>
        <h1 className={isMobileEmbed ? 'text-lg font-semibold text-gray-900' : 'text-xl font-semibold text-gray-900'}>
          Hello, {orgName || 'there'}
        </h1>
        {orgName && !isMobileEmbed && (
          <p className="text-sm text-gray-500 mt-0.5">{orgName}</p>
        )}
      </div>

      {/* Tabs */}
      <Tabs tabs={dashboardTabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'dashboard' ? (
        <div className="mt-6 space-y-6">
          {/* Total Receivables */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Total Receivables
                </h3>
                {loadingReceivables ? (
                  <div className="h-8 w-40 bg-gray-200 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {cs}{formatCurrency(totalReceivable)}
                  </p>
                )}
              </div>
              <Button size="sm" icon={HiPlus} onClick={() => {
                const isMobileEmbed = typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__;
                router.push(isMobileEmbed ? '/mobile/invoice?page=invoices-new' : '/invoice/invoices/new');
              }}>
                New
              </Button>
            </div>

            {/* Aging buckets */}
            {!loadingReceivables && (
              <>
                <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-gray-100 mb-4">
                  {totalReceivable > 0 && (
                    <>
                      <div
                        className="bg-green-500 rounded-l-full transition-all"
                        style={{
                          width: `${(currentAmount / totalReceivable) * 100}%`,
                        }}
                      />
                      {agingBuckets.slice(1).map((bucket) => (
                        <div
                          key={bucket.key}
                          className={`${bucket.color} transition-all`}
                          style={{
                            width: `${
                              ((overdueAmounts[bucket.key] || 0) / totalReceivable) * 100
                            }%`,
                          }}
                        />
                      ))}
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div>
                    <p className="text-xs font-medium text-green-600 uppercase">Current</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                      {cs}{formatCurrency(currentAmount)}
                    </p>
                  </div>
                  <div className="col-span-1 md:col-span-2 lg:col-span-5">
                    <p className="text-xs font-medium text-red-600 uppercase mb-1">Overdue</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {agingBuckets.slice(1).map((bucket) => (
                        <div key={bucket.key}>
                          <p className="text-xs text-gray-500">{bucket.label}</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {cs}{formatCurrency(overdueAmounts[bucket.key] || 0)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* Sales & Expenses Chart */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Sales and Expenses
              </h3>
              <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white">
                <option>This Fiscal Year</option>
                <option>Previous Fiscal Year</option>
              </select>
            </div>

            {loadingSales ? (
              <div className="h-64 bg-gray-100 rounded animate-pulse" />
            ) : (
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barGap={2}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
                      />
                      <Tooltip
                        formatter={(value) => [`${cs}${formatCurrency(value)}`]}
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          fontSize: '12px',
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '12px' }}
                      />
                      <Bar dataKey="sales" name="Sales" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="receipts" name="Receipts" fill="#22c55e" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="expenses" name="Expenses" fill="#f97316" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="lg:w-48 flex lg:flex-col gap-4 lg:gap-3">
                  <div className="flex-1 bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-medium">Total Sales</p>
                    <p className="text-lg font-bold text-blue-900 mt-1">
                      {cs}{formatCurrency(salesData?.totalSales || 0)}
                    </p>
                  </div>
                  <div className="flex-1 bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-600 font-medium">Total Receipts</p>
                    <p className="text-lg font-bold text-green-900 mt-1">
                      {cs}{formatCurrency(salesData?.totalReceipts || 0)}
                    </p>
                  </div>
                  <div className="flex-1 bg-orange-50 rounded-lg p-3">
                    <p className="text-xs text-orange-600 font-medium">Total Expenses</p>
                    <p className="text-lg font-bold text-orange-900 mt-1">
                      {cs}{formatCurrency(salesData?.totalExpenses || 0)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-400 mt-4">
              Sales value displayed is inclusive of tax and inclusive of credits.
            </p>
          </Card>
        </div>
      ) : (
        /* Recent Updates tab */
        <div className="mt-6">
          <Card>
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <HiCurrencyRupee className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-1">
                No recent updates
              </h3>
              <p className="text-sm text-gray-500 text-center max-w-sm">
                Your recent activity will appear here. Start by creating an invoice or adding a customer.
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
