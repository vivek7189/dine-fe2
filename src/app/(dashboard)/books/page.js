'use client';

import { useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaChartLine, FaMoneyBillWave, FaReceipt, FaTruck, FaBalanceScale, FaBook, FaCheckCircle, FaTimesCircle, FaUsers, FaFileInvoice, FaListAlt } from 'react-icons/fa';
import { useCurrency } from '../../../contexts/CurrencyContext';
import useBooks from './hooks/useBooks';
import OverviewTab from './components/OverviewTab';
import RevenueTab from './components/RevenueTab';
import ExpensesTab from './components/ExpensesTab';
import SupplierDuesTab from './components/SupplierDuesTab';
import ProfitLossTab from './components/ProfitLossTab';
import PayrollTab from './components/PayrollTab';
import GSTReportsTab from './components/GSTReportsTab';
import LedgerTab from './components/LedgerTab';
import BooksModals from './components/BooksModals';

const tabs = [
  { id: 'overview', name: 'Overview', icon: FaChartLine },
  { id: 'revenue', name: 'Revenue', icon: FaMoneyBillWave },
  { id: 'expenses', name: 'Expenses', icon: FaReceipt },
  { id: 'supplier-dues', name: 'Payables', icon: FaTruck },
  { id: 'pnl', name: 'P&L', icon: FaBalanceScale },
  { id: 'payroll', name: 'Payroll', icon: FaUsers },
  { id: 'gst', name: 'GST Reports', icon: FaFileInvoice },
  { id: 'ledger', name: 'Ledger', icon: FaListAlt },
];

const validTabIds = tabs.map(t => t.id);

export default function BooksPage() {
  const { formatCurrency } = useCurrency();
  const books = useBooks();
  const { isMobile, activeTab, setActiveTab, error, setError, success, setSuccess, period, setPeriod, PERIODS, customStart, setCustomStart, customEnd, setCustomEnd } = books;
  const isMobileEmbed = typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__;
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read tab from URL on mount
  const urlTab = searchParams.get('tab');
  if (urlTab && validTabIds.includes(urlTab) && urlTab !== activeTab) {
    setActiveTab(urlTab);
  }

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    const isMobileEmbed = typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__;
    const basePath = isMobileEmbed ? '/mobile/books' : '/books';
    const url = tabId === 'overview' ? basePath : `${basePath}?tab=${tabId}`;
    router.replace(url, { scroll: false });
  }, [setActiveTab, router]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
      `}</style>

      <div style={{ padding: isMobile ? '12px' : '24px', maxWidth: '100%', overflowX: 'hidden' }}>
        {/* Header */}
        <div style={{ marginBottom: isMobileEmbed ? '12px' : '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: isMobileEmbed ? '8px' : '12px' }}>
          <div>
            <h1 style={{ fontSize: isMobileEmbed ? '18px' : (isMobile ? '22px' : '28px'), fontWeight: 800, color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center', gap: isMobileEmbed ? '8px' : '10px' }}>
              <div style={{ width: isMobileEmbed ? '28px' : '36px', height: isMobileEmbed ? '28px' : '36px', borderRadius: isMobileEmbed ? '8px' : '10px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaBook color="white" size={isMobileEmbed ? 12 : 16} />
              </div>
              Books
            </h1>
            {!isMobileEmbed && <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0 46px' }}>Financial overview & accounting</p>}
          </div>

          {/* Period Selector */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              style={{
                padding: '9px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
                fontSize: '13px', fontWeight: 600, color: '#334155', backgroundColor: 'white',
                cursor: 'pointer', outline: 'none'
              }}
            >
              {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            {period === 'custom' && (
              <>
                <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
                  style={{ padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none' }} />
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>to</span>
                <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
                  style={{ padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none' }} />
              </>
            )}
          </div>
        </div>

        {/* Toast Messages */}
        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', animation: 'slideInUp 0.2s ease-out' }}>
            <FaTimesCircle size={14} />
            <span style={{ flex: 1 }}>{error}</span>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '18px', padding: '0 4px', lineHeight: 1 }}>×</button>
          </div>
        )}
        {success && (
          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', animation: 'slideInUp 0.2s ease-out' }}>
            <FaCheckCircle size={14} />
            <span style={{ flex: 1 }}>{success}</span>
            <button onClick={() => setSuccess(null)} style={{ background: 'none', border: 'none', color: '#1e40af', cursor: 'pointer', fontSize: '18px', padding: '0 4px', lineHeight: 1 }}>×</button>
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{
          marginBottom: isMobile ? '16px' : '20px', display: 'flex', gap: '2px',
          backgroundColor: 'white', padding: '4px', borderRadius: '14px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflowX: 'auto',
          WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none'
        }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => handleTabChange(tab.id)} style={{
                padding: isMobile ? '10px 14px' : '10px 20px', borderRadius: '10px', border: 'none',
                backgroundColor: isActive ? '#2563eb' : 'transparent',
                color: isActive ? 'white' : '#6b7280',
                fontWeight: 600, fontSize: isMobile ? '12px' : '13px',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                gap: isMobile ? '5px' : '8px', transition: 'all 0.2s',
                whiteSpace: 'nowrap', minHeight: '40px'
              }}>
                <Icon size={isMobile ? 12 : 14} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab {...books} formatCurrency={formatCurrency} />}
        {activeTab === 'revenue' && <RevenueTab {...books} formatCurrency={formatCurrency} />}
        {activeTab === 'expenses' && <ExpensesTab {...books} formatCurrency={formatCurrency} />}
        {activeTab === 'supplier-dues' && <SupplierDuesTab {...books} formatCurrency={formatCurrency} />}
        {activeTab === 'pnl' && <ProfitLossTab {...books} formatCurrency={formatCurrency} />}
        {activeTab === 'payroll' && (
          <PayrollTab
            payrollConfig={books.payrollConfig}
            payrollRuns={books.payrollRuns}
            loadingPayroll={books.loadingPayroll}
            isMobile={books.isMobile}
            formatCurrency={formatCurrency}
            staffList={books.staffList}
            onSaveConfig={books.handleSavePayrollConfig}
            onDeleteConfig={books.handleDeletePayrollConfig}
            onGenerateRun={books.handleGeneratePayrollRun}
            onUpdateRun={books.handleUpdatePayrollRun}
            onViewSlips={books.handleViewPaySlips}
          />
        )}
        {activeTab === 'gst' && (
          <GSTReportsTab
            restaurantId={books.restaurantId}
            apiClient={books.apiClient}
            isMobile={books.isMobile}
            formatCurrency={formatCurrency}
          />
        )}
        {activeTab === 'ledger' && (
          <LedgerTab
            restaurantId={books.restaurantId}
            apiClient={books.apiClient}
            isMobile={books.isMobile}
            formatCurrency={formatCurrency}
          />
        )}
      </div>

      {/* Modals */}
      <BooksModals {...books} formatCurrency={formatCurrency} />
    </div>
  );
}
