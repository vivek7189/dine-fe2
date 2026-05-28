'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FaChartLine,
  FaBoxes,
  FaIndustry,
  FaWarehouse,
  FaClipboardList,
  FaUtensils,
  FaTrophy,
  FaDownload,
  FaCalendarAlt,
  FaSpinner,
  FaArrowLeft,
  FaChartBar,
  FaUsers,
  FaTags,
  FaPercent,
  FaFileInvoiceDollar,
  FaAddressBook,
  FaMoneyBillWave,
  FaShoppingBag,
  FaChartArea,
  FaWallet,
  FaFilePdf,
  FaFileExcel,
  FaFileCsv,
  FaChevronDown,
  FaStore,
  FaCheck,
  FaTimes,
  FaListOl,
  FaSortAmountDown,
  FaSortAmountUp,
  FaSearch,
} from 'react-icons/fa';
import apiClient from '../../../../lib/api';

// ============================================
// HQ REPORTS TAB
// Cross-outlet analytics with sub-report cards
// ============================================

const REPORT_TYPES = {
  SALES: 'sales',
  INVENTORY: 'inventory',
  PL: 'pl',
  KITCHEN: 'kitchen',
  WAREHOUSE: 'warehouse',
  INDENT: 'indent',
  MENU: 'menu',
  RANKING: 'ranking',
  STAFF: 'staff',
  CATEGORY: 'category',
  DISCOUNT: 'discount',
  TAX: 'tax',
  CUSTOMER: 'customer',
  PAYMENT: 'payment',
  ORDER_ANALYTICS: 'order-analytics',
  REVENUE_TRENDS: 'revenue-trends',
  WALLET_LOYALTY: 'wallet-loyalty',
  ITEM_SALES: 'item-sales',
};

const getDefaultStartDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
};

const getDefaultEndDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// ---- Styles ----

const styles = {
  container: {
    padding: '0',
  },
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '24px',
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    background: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    transition: 'all 0.15s',
  },
  dateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  dateInput: {
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#374151',
    outline: 'none',
    background: 'white',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  },
  reportCard: (isActive) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '28px 16px',
    background: isActive ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'white',
    border: isActive ? '2px solid #16a34a' : '1px solid #f1f5f9',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center',
    boxShadow: isActive ? '0 4px 16px rgba(22,163,74,0.18)' : '0 1px 4px rgba(0,0,0,0.04)',
  }),
  reportCardIcon: (isActive) => ({
    fontSize: '28px',
    color: isActive ? 'white' : '#16a34a',
  }),
  reportCardLabel: (isActive) => ({
    fontSize: '14px',
    fontWeight: '600',
    color: isActive ? 'white' : '#374151',
  }),
  card: {
    background: 'white',
    borderRadius: '16px',
    border: '1px solid #f1f5f9',
    padding: '24px',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '16px',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '14px',
    marginBottom: '24px',
  },
  statCard: (color) => ({
    background: `${color}08`,
    border: `1px solid ${color}22`,
    borderRadius: '14px',
    padding: '18px',
    textAlign: 'center',
  }),
  statValue: (color) => ({
    fontSize: '24px',
    fontWeight: '700',
    color: color || '#111827',
  }),
  statLabel: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '4px',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0',
    fontSize: '14px',
  },
  th: {
    textAlign: 'left',
    padding: '12px 14px',
    fontWeight: '600',
    color: '#6b7280',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '2px solid #f1f5f9',
    whiteSpace: 'nowrap',
  },
  td: (isEven) => ({
    padding: '12px 14px',
    color: '#374151',
    borderBottom: '1px solid #f8fafc',
    background: isEven ? '#fafbfc' : 'white',
  }),
  exportBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: '#16a34a',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '60px 20px',
    color: '#6b7280',
    fontSize: '15px',
  },
  spinner: {
    animation: 'hqSpin 1s linear infinite',
    fontSize: '24px',
    color: '#16a34a',
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 20px',
    color: '#9ca3af',
    fontSize: '15px',
  },
  badge: (color) => ({
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '600',
    background: `${color}18`,
    color: color,
  }),
  rankBadge: (rank) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    fontWeight: '700',
    fontSize: '14px',
    background: rank === 1 ? '#fef3c7' : rank === 2 ? '#f1f5f9' : rank === 3 ? '#fef3c7' : '#f9fafb',
    color: rank === 1 ? '#d97706' : rank === 2 ? '#6b7280' : rank === 3 ? '#b45309' : '#9ca3af',
    border: rank <= 3 ? '2px solid' : '1px solid #e5e7eb',
    borderColor: rank === 1 ? '#f59e0b' : rank === 2 ? '#9ca3af' : rank === 3 ? '#d97706' : '#e5e7eb',
  }),
  stockCell: (level) => ({
    padding: '12px 14px',
    fontWeight: '600',
    fontSize: '13px',
    color: level === 'critical' ? '#dc2626' : level === 'low' ? '#d97706' : level === 'ok' ? '#16a34a' : '#374151',
    background: level === 'critical' ? '#fef2f2' : level === 'low' ? '#fffbeb' : level === 'ok' ? '#f0fdf4' : 'white',
    borderBottom: '1px solid #f8fafc',
    textAlign: 'center',
  }),
  pipelineBar: {
    display: 'flex',
    gap: '4px',
    marginBottom: '24px',
    borderRadius: '10px',
    overflow: 'hidden',
    height: '32px',
  },
  pipelineSegment: (color, pct) => ({
    flex: `${pct} 0 0%`,
    minWidth: pct > 0 ? '28px' : '0',
    background: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '700',
    color: 'white',
  }),
  tableWrap: {
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
};

const PIPELINE_COLORS = {
  pending: '#f59e0b',
  approved: '#3b82f6',
  processing: '#8b5cf6',
  dispatched: '#06b6d4',
  delivered: '#16a34a',
  rejected: '#dc2626',
  cancelled: '#6b7280',
};

// ---- Sub-components ----

const LoadingState = () => (
  <div style={styles.loading}>
    <FaSpinner style={styles.spinner} />
    <span>Loading report data...</span>
  </div>
);

const EmptyState = ({ message }) => (
  <div style={styles.emptyState}>{message || 'No data available for this period.'}</div>
);

const ExportButton = ({ onExport, exporting }) => (
  <button
    style={{ ...styles.exportBtn, opacity: exporting ? 0.7 : 1, pointerEvents: exporting ? 'none' : 'auto' }}
    onClick={onExport}
    disabled={exporting}
  >
    {exporting ? <FaSpinner style={{ animation: 'hqSpin 1s linear infinite' }} /> : <FaDownload />}
    {exporting ? 'Exporting...' : 'Export CSV'}
  </button>
);

const SummaryCard = ({ label, value, color }) => (
  <div style={styles.statCard(color || '#16a34a')}>
    <div style={styles.statValue(color || '#16a34a')}>{value}</div>
    <div style={styles.statLabel}>{label}</div>
  </div>
);

// ---- Report Views ----

const InventoryComparisonView = ({ data, outlets, formatCurrency }) => {
  if (!data || !data.items || data.items.length === 0) return <EmptyState message="No inventory data found." />;

  const outletList = data.outlets || outlets?.outlet || [];
  const lowStockCount = data.lowStockCount || 0;

  const getStockLevel = (cell) => {
    if (!cell || cell.qty === undefined || cell.qty === null) return 'none';
    if (cell.qty <= 0) return 'critical';
    if (cell.qty <= (cell.reorderLevel || 5)) return 'low';
    return 'ok';
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <span style={styles.badge('#dc2626')}>Low Stock: {lowStockCount}</span>
        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#f0fdf4', border: '1px solid #16a34a', marginRight: 4 }}></span>OK
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#fffbeb', border: '1px solid #d97706', margin: '0 4px 0 12px' }}></span>Low
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#fef2f2', border: '1px solid #dc2626', margin: '0 4px 0 12px' }}></span>Critical
        </span>
      </div>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Item</th>
              {outletList.map((o) => (
                <th key={o.id || o._id} style={{ ...styles.th, textAlign: 'center' }}>{o.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, idx) => (
              <tr key={item.itemId || idx}>
                <td style={styles.td(idx % 2 === 0)}>
                  <div style={{ fontWeight: '600' }}>{item.name}</div>
                  {item.unit && <div style={{ fontSize: '12px', color: '#9ca3af' }}>{item.unit}</div>}
                </td>
                {outletList.map((o) => {
                  const cell = item.outlets?.[o.id || o._id] || {};
                  const level = getStockLevel(cell);
                  return (
                    <td key={o.id || o._id} style={styles.stockCell(level)}>
                      {cell.qty !== undefined && cell.qty !== null ? cell.qty : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

const ConsolidatedPLView = ({ data, formatCurrency }) => {
  if (!data) return <EmptyState />;

  // Backend returns flat fields, not nested summary
  const totalRevenue = data.totalRevenue ?? data.summary?.totalRevenue ?? 0;
  const totalExpenses = data.totalExpenses ?? data.summary?.totalExpenses ?? 0;
  const grossProfit = data.grossProfit ?? data.summary?.grossProfit ?? (totalRevenue - totalExpenses);
  const outletCount = data.outletCount || 0;
  const outletBreakdown = (data.outletBreakdown || data.outlets || []).sort((a, b) => (b.totalRevenue || b.revenue || 0) - (a.totalRevenue || a.revenue || 0));
  const profitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0.0';
  const totalOrders = outletBreakdown.reduce((s, o) => s + (o.orderCount || 0), 0);
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div>
      <div style={styles.summaryGrid}>
        <SummaryCard label="Total Revenue" value={formatCurrency(totalRevenue)} color="#16a34a" />
        <SummaryCard label="Total Expenses" value={formatCurrency(totalExpenses)} color="#dc2626" />
        <SummaryCard label="Gross Profit" value={formatCurrency(grossProfit)} color={grossProfit >= 0 ? '#3b82f6' : '#dc2626'} />
        <SummaryCard label="Profit Margin" value={`${profitMargin}%`} color={Number(profitMargin) >= 0 ? '#8b5cf6' : '#dc2626'} />
        <SummaryCard label="Total Orders" value={totalOrders.toLocaleString()} color="#3b82f6" />
        <SummaryCard label="Avg Ticket Size" value={formatCurrency(avgTicket)} color="#d97706" />
        <SummaryCard label="Outlets" value={outletCount || outletBreakdown.length} color="#6b7280" />
      </div>

      {outletBreakdown.length > 0 && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Per-Outlet Breakdown</div>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Outlet</th>
                  <th style={styles.th}>Type</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Revenue</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Expenses</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Profit</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Margin</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Orders</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>% of Revenue</th>
                </tr>
              </thead>
              <tbody>
                {outletBreakdown.map((row, idx) => {
                  const rev = row.totalRevenue || row.revenue || 0;
                  const exp = row.totalExpenses || row.expenses || 0;
                  const profit = row.grossProfit || row.profit || (rev - exp);
                  const margin = rev > 0 ? ((profit / rev) * 100).toFixed(1) : '0.0';
                  const revPct = totalRevenue > 0 ? ((rev / totalRevenue) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={row.outletId || idx}>
                      <td style={styles.td(idx % 2 === 0)}>
                        <span style={{ fontWeight: '600' }}>{row.outletName || row.name || '-'}</span>
                      </td>
                      <td style={styles.td(idx % 2 === 0)}>
                        <span style={styles.badge(row.outletType === 'warehouse' ? '#6b7280' : row.outletType === 'central_kitchen' ? '#8b5cf6' : '#3b82f6')}>
                          {(row.outletType || 'outlet').replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ ...styles.td(idx % 2 === 0), textAlign: 'right', fontWeight: '600', color: '#16a34a' }}>
                        {formatCurrency(rev)}
                      </td>
                      <td style={{ ...styles.td(idx % 2 === 0), textAlign: 'right', color: '#dc2626' }}>
                        {formatCurrency(exp)}
                      </td>
                      <td style={{ ...styles.td(idx % 2 === 0), textAlign: 'right', fontWeight: '600', color: profit >= 0 ? '#16a34a' : '#dc2626' }}>
                        {formatCurrency(profit)}
                      </td>
                      <td style={{ ...styles.td(idx % 2 === 0), textAlign: 'right' }}>
                        <span style={{ color: Number(margin) >= 0 ? '#16a34a' : '#dc2626', fontWeight: '600' }}>{margin}%</span>
                      </td>
                      <td style={{ ...styles.td(idx % 2 === 0), textAlign: 'right' }}>
                        {(row.orderCount || 0).toLocaleString()}
                      </td>
                      <td style={{ ...styles.td(idx % 2 === 0), textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <div style={{ width: '50px', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(Number(revPct), 100)}%`, height: '100%', background: '#16a34a', borderRadius: '3px' }} />
                          </div>
                          <span style={{ fontSize: '12px' }}>{revPct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const KitchenReportsView = ({ data, formatCurrency }) => {
  if (!data) return <EmptyState />;

  const summary = data.summary || {};
  const recipes = data.recipes || [];
  const waste = data.waste || {};

  return (
    <>
      <div style={styles.summaryGrid}>
        <SummaryCard label="Total Orders" value={(summary.totalOrders || 0).toLocaleString()} color="#3b82f6" />
        <SummaryCard label="Completion Rate" value={`${(summary.completionRate || 0).toFixed(1)}%`} color="#16a34a" />
        <SummaryCard label="Yield Rate" value={`${(summary.yieldRate || 0).toFixed(1)}%`} color="#8b5cf6" />
        <SummaryCard label="Total Waste" value={formatCurrency(summary.wasteCost || 0)} color="#dc2626" />
      </div>

      {recipes.length > 0 && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Recipe Breakdown</div>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Recipe</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Orders</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Completed</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Target Qty</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Produced Qty</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map((r, idx) => (
                  <tr key={r.recipeId || idx}>
                    <td style={styles.td(idx % 2 === 0)}><span style={{ fontWeight: '600' }}>{r.name || '-'}</span></td>
                    <td style={{ ...styles.td(idx % 2 === 0), textAlign: 'right' }}>{r.orders || 0}</td>
                    <td style={{ ...styles.td(idx % 2 === 0), textAlign: 'right' }}>{r.completed || 0}</td>
                    <td style={{ ...styles.td(idx % 2 === 0), textAlign: 'right' }}>{r.targetQty || 0}</td>
                    <td style={{ ...styles.td(idx % 2 === 0), textAlign: 'right' }}>{r.producedQty || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {waste && (waste.totalEntries > 0 || (waste.byReason && waste.byReason.length > 0)) && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Waste Summary</div>
          <div style={styles.summaryGrid}>
            <SummaryCard label="Entries" value={waste.totalEntries || 0} color="#f59e0b" />
            <SummaryCard label="Total Qty" value={waste.totalQty || 0} color="#dc2626" />
            <SummaryCard label="Total Cost" value={formatCurrency(waste.totalCost || 0)} color="#dc2626" />
          </div>
          {waste.byReason && waste.byReason.length > 0 && (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Reason</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Qty</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {waste.byReason.map((w, idx) => (
                    <tr key={w.reason || idx}>
                      <td style={styles.td(idx % 2 === 0)}>{w.reason || 'Unknown'}</td>
                      <td style={{ ...styles.td(idx % 2 === 0), textAlign: 'right' }}>{w.qty || 0}</td>
                      <td style={{ ...styles.td(idx % 2 === 0), textAlign: 'right' }}>{formatCurrency(w.cost || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
};

const WarehouseMetricsView = ({ data, formatCurrency }) => {
  if (!data) return <EmptyState />;

  const summary = data.summary || {};
  const statusPipeline = data.statusPipeline || {};
  const topItems = data.topRequestedItems || [];

  const totalPipeline = Object.values(statusPipeline).reduce((s, v) => s + v, 0) || 1;

  return (
    <>
      <div style={styles.summaryGrid}>
        <SummaryCard label="Total Indents" value={(summary.totalIndents || 0).toLocaleString()} color="#3b82f6" />
        <SummaryCard label="Fill Rate" value={`${(summary.fillRate || 0).toFixed(1)}%`} color="#16a34a" />
        <SummaryCard label="Avg Processing Time" value={`${(summary.avgProcessingTime || 0).toFixed(1)}h`} color="#8b5cf6" />
      </div>

      {Object.keys(statusPipeline).length > 0 && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Status Pipeline</div>
          <div style={styles.pipelineBar}>
            {Object.entries(statusPipeline).map(([status, count]) => (
              <div
                key={status}
                style={styles.pipelineSegment(PIPELINE_COLORS[status] || '#6b7280', (count / totalPipeline) * 100)}
                title={`${status}: ${count}`}
              >
                {count > 0 ? count : ''}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px' }}>
            {Object.entries(statusPipeline).map(([status, count]) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: PIPELINE_COLORS[status] || '#6b7280' }}></span>
                <span style={{ color: '#6b7280', textTransform: 'capitalize' }}>{status}: {count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {topItems.length > 0 && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Top Requested Items</div>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Item</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Times Requested</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Total Qty</th>
                </tr>
              </thead>
              <tbody>
                {topItems.map((item, idx) => (
                  <tr key={item.itemId || idx}>
                    <td style={styles.td(idx % 2 === 0)}>{idx + 1}</td>
                    <td style={styles.td(idx % 2 === 0)}><span style={{ fontWeight: '600' }}>{item.name || '-'}</span></td>
                    <td style={{ ...styles.td(idx % 2 === 0), textAlign: 'right' }}>{item.timesRequested || 0}</td>
                    <td style={{ ...styles.td(idx % 2 === 0), textAlign: 'right' }}>{item.totalQty || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

const IndentTrackingView = ({ data }) => {
  if (!data) return <EmptyState />;

  const summary = data.summary || {};
  const indents = data.indents || [];

  const statusColors = {
    pending: '#f59e0b',
    approved: '#3b82f6',
    processing: '#8b5cf6',
    dispatched: '#06b6d4',
    delivered: '#16a34a',
    rejected: '#dc2626',
    cancelled: '#6b7280',
  };

  return (
    <>
      <div style={styles.summaryGrid}>
        {Object.entries(summary).map(([status, count]) => (
          <SummaryCard key={status} label={status.charAt(0).toUpperCase() + status.slice(1)} value={count} color={statusColors[status] || '#6b7280'} />
        ))}
      </div>

      {indents.length > 0 ? (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Indent #</th>
                <th style={styles.th}>Outlet</th>
                <th style={styles.th}>Warehouse</th>
                <th style={styles.th}>Priority</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Items</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {indents.map((indent, idx) => {
                const priorityColor = indent.priority === 'high' ? '#dc2626' : indent.priority === 'medium' ? '#f59e0b' : '#16a34a';
                return (
                  <tr key={indent.indentId || indent.indentNumber || idx}>
                    <td style={styles.td(idx % 2 === 0)}>
                      <span style={{ fontWeight: '700', fontFamily: 'monospace' }}>{indent.indentNumber || '-'}</span>
                    </td>
                    <td style={styles.td(idx % 2 === 0)}>{indent.outletName || '-'}</td>
                    <td style={styles.td(idx % 2 === 0)}>{indent.warehouseName || '-'}</td>
                    <td style={styles.td(idx % 2 === 0)}>
                      <span style={styles.badge(priorityColor)}>
                        {(indent.priority || 'normal').charAt(0).toUpperCase() + (indent.priority || 'normal').slice(1)}
                      </span>
                    </td>
                    <td style={{ ...styles.td(idx % 2 === 0), textAlign: 'right' }}>{indent.itemCount || 0}</td>
                    <td style={styles.td(idx % 2 === 0)}>
                      <span style={styles.badge(statusColors[indent.status] || '#6b7280')}>
                        {(indent.status || '-').charAt(0).toUpperCase() + (indent.status || '').slice(1)}
                      </span>
                    </td>
                    <td style={styles.td(idx % 2 === 0)}>
                      {indent.date ? new Date(indent.date).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState message="No indents found." />
      )}
    </>
  );
};

const MenuPerformanceView = ({ data, outlets, formatCurrency }) => {
  if (!data || !data.items || data.items.length === 0) return <EmptyState message="No menu performance data." />;

  const outletList = data.outlets || outlets?.outlet || [];

  // Build per-outlet lookup from outletBreakdown array
  const getOutletData = (item, outletId) => {
    const breakdown = item.outletBreakdown || [];
    return breakdown.find(o => o.outletId === outletId) || {};
  };

  // Summary stats
  const totalItems = data.totalUniqueItems || data.items.length;
  const totalRevenue = data.items.reduce((s, i) => s + (i.totalRevenue || 0), 0);
  const totalSold = data.items.reduce((s, i) => s + (i.totalSalesCount || i.totalSales || 0), 0);
  const avgPrice = totalSold > 0 ? totalRevenue / totalSold : 0;

  return (
    <div>
      <div style={styles.summaryGrid}>
        <SummaryCard label="Unique Items" value={totalItems} color="#3b82f6" />
        <SummaryCard label="Total Qty Sold" value={totalSold.toLocaleString()} color="#8b5cf6" />
        <SummaryCard label="Total Revenue" value={formatCurrency(totalRevenue)} color="#16a34a" />
        <SummaryCard label="Avg Price" value={formatCurrency(avgPrice)} color="#d97706" />
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: '50px' }}>#</th>
              <th style={styles.th}>Item</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Qty Sold</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Revenue</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>% of Revenue</th>
              {outletList.map((o) => (
                <th key={o.id || o._id} style={{ ...styles.th, textAlign: 'right' }}>{o.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, idx) => {
              const itemName = item.itemName || item.name || '-';
              const qtySold = item.totalSalesCount || item.totalSales || 0;
              const revPct = totalRevenue > 0 ? ((item.totalRevenue || 0) / totalRevenue * 100).toFixed(1) : '0.0';
              return (
                <tr key={idx}>
                  <td style={styles.td(idx % 2 === 0)}>
                    <span style={{ fontWeight: '600', color: '#9ca3af' }}>{idx + 1}</span>
                  </td>
                  <td style={styles.td(idx % 2 === 0)}><span style={{ fontWeight: '600' }}>{itemName}</span></td>
                  <td style={{ ...styles.td(idx % 2 === 0), textAlign: 'right', fontWeight: '600' }}>
                    {qtySold.toLocaleString()}
                  </td>
                  <td style={{ ...styles.td(idx % 2 === 0), textAlign: 'right', fontWeight: '600', color: '#16a34a' }}>
                    {formatCurrency(item.totalRevenue || 0)}
                  </td>
                  <td style={{ ...styles.td(idx % 2 === 0), textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      <div style={{ width: '50px', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(Number(revPct), 100)}%`, height: '100%', background: '#16a34a', borderRadius: '3px' }} />
                      </div>
                      <span style={{ fontSize: '12px' }}>{revPct}%</span>
                    </div>
                  </td>
                  {outletList.map((o) => {
                    const od = getOutletData(item, o.id || o._id);
                    return (
                      <td key={o.id || o._id} style={{ ...styles.td(idx % 2 === 0), textAlign: 'right', fontSize: '13px' }}>
                        <div style={{ fontWeight: '500' }}>{(od.salesCount || od.sales || 0).toLocaleString()}</div>
                        <div style={{ color: '#6b7280', fontSize: '11px' }}>{formatCurrency(od.revenue || 0)}</div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ---- Item-wise Sales View ----
const ItemSalesView = ({ data, formatCurrency }) => {
  const [sortBy, setSortBy] = useState('quantity');
  const [sortDir, setSortDir] = useState('desc');
  const [search, setSearch] = useState('');

  const rawItems = data?.items || data?.breakdown || [];
  if (!rawItems.length) return <EmptyState message="No item sales data available." />;

  // Filter + sort
  let items = [...rawItems];
  if (search) {
    const term = search.toLowerCase();
    items = items.filter(i => (i.itemName || i.name || '').toLowerCase().includes(term));
  }
  items.sort((a, b) => {
    let cmp = 0;
    const aQty = a.totalSalesCount || a.totalSales || a.quantity || 0;
    const bQty = b.totalSalesCount || b.totalSales || b.quantity || 0;
    const aRev = a.totalRevenue || a.revenue || 0;
    const bRev = b.totalRevenue || b.revenue || 0;
    if (sortBy === 'quantity') cmp = aQty - bQty;
    else if (sortBy === 'revenue') cmp = aRev - bRev;
    else cmp = (a.itemName || a.name || '').localeCompare(b.itemName || b.name || '');
    return sortDir === 'desc' ? -cmp : cmp;
  });

  const totalQty = items.reduce((s, i) => s + (i.totalSalesCount || i.totalSales || i.quantity || 0), 0);
  const totalRev = items.reduce((s, i) => s + (i.totalRevenue || i.revenue || 0), 0);

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortBy(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null;
    return sortDir === 'desc' ? <FaSortAmountDown style={{ fontSize: '10px' }} /> : <FaSortAmountUp style={{ fontSize: '10px' }} />;
  };

  return (
    <div>
      <div style={styles.summaryGrid}>
        <SummaryCard label="Total Items" value={rawItems.length} color="#3b82f6" />
        <SummaryCard label="Total Qty Sold" value={totalQty.toLocaleString()} color="#8b5cf6" />
        <SummaryCard label="Total Revenue" value={formatCurrency(totalRev)} color="#16a34a" />
        <SummaryCard label="Avg per Item" value={formatCurrency(items.length > 0 ? totalRev / items.length : 0)} color="#d97706" />
      </div>

      {/* Search */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
        <div style={{ position: 'relative' }}>
          <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '12px' }} />
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '32px', paddingRight: '12px', paddingTop: '7px', paddingBottom: '7px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', width: '200px', outline: 'none' }}
          />
        </div>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: '50px' }}>#</th>
              <th style={{ ...styles.th, cursor: 'pointer' }} onClick={() => toggleSort('name')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Item <SortIcon field="name" /></span>
              </th>
              <th style={{ ...styles.th, textAlign: 'center', cursor: 'pointer' }} onClick={() => toggleSort('quantity')}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>Qty <SortIcon field="quantity" /></span>
              </th>
              <th style={{ ...styles.th, textAlign: 'right', cursor: 'pointer' }} onClick={() => toggleSort('revenue')}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>Revenue <SortIcon field="revenue" /></span>
              </th>
              <th style={{ ...styles.th, textAlign: 'right' }}>% of Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const name = item.itemName || item.name || '-';
              const qty = item.totalSalesCount || item.totalSales || item.quantity || 0;
              const rev = item.totalRevenue || item.revenue || 0;
              const revPct = totalRev > 0 ? ((rev / totalRev) * 100) : 0;
              const isTop3 = idx < 3 && sortBy === 'quantity' && sortDir === 'desc';
              return (
                <tr key={idx}>
                  <td style={styles.td(idx % 2 === 0)}>
                    <span style={{ fontWeight: '600', color: '#9ca3af' }}>{idx + 1}</span>
                  </td>
                  <td style={styles.td(idx % 2 === 0)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isTop3 && (
                        <span style={{
                          fontSize: '10px', fontWeight: '700', padding: '1px 6px', borderRadius: '4px',
                          background: idx === 0 ? '#fef9c3' : idx === 1 ? '#f1f5f9' : '#fff7ed',
                          color: idx === 0 ? '#a16207' : idx === 1 ? '#64748b' : '#c2410c'
                        }}>
                          {idx === 0 ? '1st' : idx === 1 ? '2nd' : '3rd'}
                        </span>
                      )}
                      <span style={{ fontWeight: '600' }}>{name}</span>
                    </div>
                  </td>
                  <td style={{ ...styles.td(idx % 2 === 0), textAlign: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#eff6ff', color: '#1d4ed8', fontWeight: '700', fontSize: '13px', padding: '2px 10px', borderRadius: '12px', minWidth: '36px' }}>
                      {qty}
                    </span>
                  </td>
                  <td style={{ ...styles.td(idx % 2 === 0), textAlign: 'right', fontWeight: '600', color: '#16a34a' }}>
                    {formatCurrency(rev)}
                  </td>
                  <td style={{ ...styles.td(idx % 2 === 0), textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      <div style={{ width: '50px', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(revPct, 100)}%`, height: '100%', background: '#f43f5e', borderRadius: '3px' }} />
                      </div>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>{revPct.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
              <td style={{ ...styles.td(false), background: 'transparent' }}></td>
              <td style={{ ...styles.td(false), background: 'transparent', fontWeight: '700' }}>Total</td>
              <td style={{ ...styles.td(false), background: 'transparent', textAlign: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#dbeafe', color: '#1e40af', fontWeight: '700', fontSize: '13px', padding: '2px 10px', borderRadius: '12px' }}>
                  {totalQty}
                </span>
              </td>
              <td style={{ ...styles.td(false), background: 'transparent', textAlign: 'right', fontWeight: '700', color: '#059669' }}>
                {formatCurrency(totalRev)}
              </td>
              <td style={{ ...styles.td(false), background: 'transparent', textAlign: 'right', fontSize: '12px', color: '#6b7280' }}>100%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

const OutletRankingView = ({ data, formatCurrency }) => {
  if (!data || !data.rankings || data.rankings.length === 0) return <EmptyState message="No ranking data." />;

  const rankings = data.rankings || [];

  return (
    <div style={styles.tableWrap}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{ ...styles.th, textAlign: 'center', width: '60px' }}>Rank</th>
            <th style={styles.th}>Outlet</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Revenue</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Orders</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Avg Ticket</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((row, idx) => {
            const rank = idx + 1;
            const isTop3 = rank <= 3;
            return (
              <tr key={row.outletId || idx} style={isTop3 ? { background: rank === 1 ? '#fefce8' : rank === 2 ? '#f8fafc' : '#fffbeb' } : undefined}>
                <td style={{ ...styles.td(false), textAlign: 'center', background: 'transparent' }}>
                  <div style={styles.rankBadge(rank)}>{rank}</div>
                </td>
                <td style={{ ...styles.td(false), background: 'transparent' }}>
                  <span style={{ fontWeight: isTop3 ? '700' : '500', fontSize: isTop3 ? '15px' : '14px' }}>
                    {row.name || row.outletName || '-'}
                  </span>
                </td>
                <td style={{ ...styles.td(false), textAlign: 'right', background: 'transparent', fontWeight: '700', color: '#16a34a' }}>
                  {formatCurrency(row.revenue || 0)}
                </td>
                <td style={{ ...styles.td(false), textAlign: 'right', background: 'transparent' }}>
                  {(row.orders || 0).toLocaleString()}
                </td>
                <td style={{ ...styles.td(false), textAlign: 'right', background: 'transparent' }}>
                  {formatCurrency(row.avgTicket || 0)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ---- Sales Summary View ----

const SalesSummaryView = ({ data, formatCurrency }) => {
  if (!data || !data.summary) return <EmptyState message="No sales data." />;
  const { summary, paymentBreakdown = [], serviceTypeBreakdown = [], dailyTrend = [], peakHours = [], outletBreakdown = [] } = data;

  const svcLabels = { dine_in: 'Dine-in', takeaway: 'Takeaway', delivery: 'Delivery', aggregator: 'Aggregator' };
  const pmLabels = { cash: 'Cash', card: 'Card', upi: 'UPI', aggregator: 'Aggregator', other: 'Other' };

  return (
    <div>
      <div style={styles.summaryGrid}>
        <div style={styles.statCard('#16a34a')}><div style={styles.statValue('#16a34a')}>{formatCurrency(summary.totalRevenue || 0)}</div><div style={styles.statLabel}>Total Revenue</div></div>
        <div style={styles.statCard('#3b82f6')}><div style={styles.statValue('#3b82f6')}>{(summary.totalOrders || 0).toLocaleString()}</div><div style={styles.statLabel}>Total Orders</div></div>
        <div style={styles.statCard('#8b5cf6')}><div style={styles.statValue('#8b5cf6')}>{formatCurrency(summary.avgTicketSize || 0)}</div><div style={styles.statLabel}>Avg Ticket Size</div></div>
        <div style={styles.statCard('#d97706')}><div style={styles.statValue('#d97706')}>{formatCurrency((summary.totalTips || 0) + (summary.totalServiceCharge || 0))}</div><div style={styles.statLabel}>Tips + Service Charge</div></div>
      </div>

      {paymentBreakdown.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={styles.cardTitle}>Payment Method Breakdown</h4>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead><tr>
                <th style={styles.th}>Method</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Transactions</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Amount</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>%</th>
              </tr></thead>
              <tbody>
                {paymentBreakdown.map((p, i) => (
                  <tr key={p.method}>
                    <td style={styles.td(i % 2 === 0)}><span style={{ fontWeight: '600' }}>{pmLabels[p.method] || p.method}</span></td>
                    <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right' }}>{p.count}</td>
                    <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right', fontWeight: '600', color: '#16a34a' }}>{formatCurrency(p.amount)}</td>
                    <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right' }}>{p.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {serviceTypeBreakdown.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={styles.cardTitle}>Service Type Breakdown</h4>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead><tr>
                <th style={styles.th}>Type</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Orders</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Amount</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>%</th>
              </tr></thead>
              <tbody>
                {serviceTypeBreakdown.map((s, i) => (
                  <tr key={s.type}>
                    <td style={styles.td(i % 2 === 0)}><span style={{ fontWeight: '600' }}>{svcLabels[s.type] || s.type}</span></td>
                    <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right' }}>{s.count}</td>
                    <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right', fontWeight: '600', color: '#16a34a' }}>{formatCurrency(s.amount)}</td>
                    <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right' }}>{s.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {peakHours.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={styles.cardTitle}>Peak Hours</h4>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead><tr>
                <th style={styles.th}>Hour</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Orders</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Revenue</th>
              </tr></thead>
              <tbody>
                {peakHours.map((h, i) => (
                  <tr key={h.hour}>
                    <td style={styles.td(i % 2 === 0)}><span style={{ fontWeight: '600' }}>{h.hour}</span></td>
                    <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right' }}>{h.orderCount}</td>
                    <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right', color: '#16a34a', fontWeight: '600' }}>{formatCurrency(h.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {dailyTrend.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={styles.cardTitle}>Daily Trend</h4>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead><tr>
                <th style={styles.th}>Date</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Revenue</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Orders</th>
              </tr></thead>
              <tbody>
                {dailyTrend.map((d, i) => (
                  <tr key={d.date}>
                    <td style={styles.td(i % 2 === 0)}><span style={{ fontWeight: '500' }}>{d.date}</span></td>
                    <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right', fontWeight: '600', color: '#16a34a' }}>{formatCurrency(d.revenue)}</td>
                    <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right' }}>{d.orderCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {outletBreakdown.length > 1 && (
        <div>
          <h4 style={styles.cardTitle}>Per-Outlet Breakdown</h4>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead><tr>
                <th style={styles.th}>Outlet</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Revenue</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Orders</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Avg Ticket</th>
              </tr></thead>
              <tbody>
                {outletBreakdown.map((o, i) => (
                  <tr key={o.outletId}>
                    <td style={styles.td(i % 2 === 0)}><span style={{ fontWeight: '600' }}>{o.outletName}</span></td>
                    <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right', fontWeight: '600', color: '#16a34a' }}>{formatCurrency(o.revenue)}</td>
                    <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right' }}>{o.orderCount}</td>
                    <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right' }}>{formatCurrency(o.avgTicketSize)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ---- Staff Performance View ----

const StaffPerformanceView = ({ data, formatCurrency }) => {
  if (!data || !data.staffRankings || data.staffRankings.length === 0) return <EmptyState message="No staff data for this period." />;
  const { staffRankings, totalStaff, roleBreakdown } = data;
  const topPerformer = staffRankings[0];
  const totalTips = staffRankings.reduce((s, st) => s + (st.tipsEarned || 0), 0);
  const distinctRoles = new Set(staffRankings.map(s => s.role).filter(Boolean));

  return (
    <div>
      <div style={styles.summaryGrid}>
        <div style={styles.statCard('#3b82f6')}><div style={styles.statValue('#3b82f6')}>{totalStaff}</div><div style={styles.statLabel}>Total Staff</div></div>
        <div style={styles.statCard('#16a34a')}><div style={styles.statValue('#16a34a')}>{topPerformer?.staffName || '-'}</div><div style={styles.statLabel}>Top Performer</div></div>
        <div style={styles.statCard('#8b5cf6')}><div style={styles.statValue('#8b5cf6')}>{formatCurrency(topPerformer?.totalSales || 0)}</div><div style={styles.statLabel}>Highest Sales</div></div>
        <div style={styles.statCard('#d97706')}><div style={styles.statValue('#d97706')}>{formatCurrency(totalTips)}</div><div style={styles.statLabel}>Total Tips</div></div>
      </div>

      {/* Role Breakdown */}
      {roleBreakdown && roleBreakdown.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Performance by Role</h4>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(roleBreakdown.length, 4)}, 1fr)`, gap: '12px' }}>
            {roleBreakdown.map((r, i) => (
              <div key={i} style={{ padding: '14px 16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', textTransform: 'capitalize', marginBottom: '4px' }}>{r.role}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {r.staffCount} staff &middot; {r.totalOrders} orders &middot; {formatCurrency(r.totalSales)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead><tr>
            <th style={{ ...styles.th, textAlign: 'center', width: '60px' }}>Rank</th>
            <th style={styles.th}>Staff Name</th>
            {distinctRoles.size > 0 && <th style={styles.th}>Role</th>}
            <th style={styles.th}>Outlet(s)</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Orders</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Sales</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Avg Ticket</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Tips</th>
          </tr></thead>
          <tbody>
            {staffRankings.map((s, idx) => (
              <tr key={s.staffId || idx} style={s.rank <= 3 ? { background: s.rank === 1 ? '#fefce8' : s.rank === 2 ? '#f8fafc' : '#fffbeb' } : undefined}>
                <td style={{ ...styles.td(false), textAlign: 'center', background: 'transparent' }}><div style={styles.rankBadge(s.rank)}>{s.rank}</div></td>
                <td style={{ ...styles.td(false), background: 'transparent', fontWeight: s.rank <= 3 ? '700' : '500' }}>{s.staffName}</td>
                {distinctRoles.size > 0 && <td style={{ ...styles.td(false), background: 'transparent', fontSize: '13px', color: '#6b7280', textTransform: 'capitalize' }}>{s.role || '—'}</td>}
                <td style={{ ...styles.td(false), background: 'transparent', fontSize: '13px', color: '#6b7280' }}>{(s.outlets || []).join(', ')}</td>
                <td style={{ ...styles.td(false), textAlign: 'right', background: 'transparent' }}>{s.ordersHandled}</td>
                <td style={{ ...styles.td(false), textAlign: 'right', background: 'transparent', fontWeight: '700', color: '#16a34a' }}>{formatCurrency(s.totalSales)}</td>
                <td style={{ ...styles.td(false), textAlign: 'right', background: 'transparent' }}>{formatCurrency(s.avgTicketSize)}</td>
                <td style={{ ...styles.td(false), textAlign: 'right', background: 'transparent', color: '#d97706' }}>{formatCurrency(s.tipsEarned)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ---- Category Sales View ----

const CategorySalesView = ({ data, formatCurrency }) => {
  if (!data || !data.categories || data.categories.length === 0) return <EmptyState message="No category data for this period." />;
  const { categories, totalCategories } = data;
  const topCat = categories[0];

  return (
    <div>
      <div style={styles.summaryGrid}>
        <div style={styles.statCard('#3b82f6')}><div style={styles.statValue('#3b82f6')}>{totalCategories}</div><div style={styles.statLabel}>Total Categories</div></div>
        <div style={styles.statCard('#16a34a')}><div style={styles.statValue('#16a34a')}>{topCat?.category || '-'}</div><div style={styles.statLabel}>Top Category</div></div>
        <div style={styles.statCard('#8b5cf6')}><div style={styles.statValue('#8b5cf6')}>{formatCurrency(topCat?.totalRevenue || 0)}</div><div style={styles.statLabel}>Top Category Revenue</div></div>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead><tr>
            <th style={styles.th}>Category</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Qty Sold</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Revenue</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>% of Revenue</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Items</th>
          </tr></thead>
          <tbody>
            {categories.map((c, i) => (
              <tr key={c.category}>
                <td style={styles.td(i % 2 === 0)}><span style={{ fontWeight: '600' }}>{c.category}</span></td>
                <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right' }}>{c.totalQuantity.toLocaleString()}</td>
                <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right', fontWeight: '600', color: '#16a34a' }}>{formatCurrency(c.totalRevenue)}</td>
                <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                    <div style={{ width: '60px', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(c.revenuePercentage, 100)}%`, height: '100%', background: '#16a34a', borderRadius: '3px' }} />
                    </div>
                    <span>{c.revenuePercentage}%</span>
                  </div>
                </td>
                <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right' }}>{c.uniqueItems}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ---- Discount Report View ----

const DiscountReportView = ({ data, formatCurrency }) => {
  if (!data || !data.summary) return <EmptyState message="No discount data for this period." />;
  const { summary, discountSourceBreakdown = [], outletBreakdown = [] } = data;

  return (
    <div>
      <div style={styles.summaryGrid}>
        <div style={styles.statCard('#dc2626')}><div style={styles.statValue('#dc2626')}>{formatCurrency(summary.totalDiscountGiven)}</div><div style={styles.statLabel}>Total Discounts Given</div></div>
        <div style={styles.statCard('#d97706')}><div style={styles.statValue('#d97706')}>{summary.discountedOrderPercentage}%</div><div style={styles.statLabel}>Orders Discounted</div></div>
        <div style={styles.statCard('#3b82f6')}><div style={styles.statValue('#3b82f6')}>{formatCurrency(summary.avgTicketWithDiscount)}</div><div style={styles.statLabel}>Avg Ticket (w/ Discount)</div></div>
        <div style={styles.statCard('#16a34a')}><div style={styles.statValue('#16a34a')}>{formatCurrency(summary.avgTicketWithoutDiscount)}</div><div style={styles.statLabel}>Avg Ticket (w/o Discount)</div></div>
      </div>

      {discountSourceBreakdown.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={styles.cardTitle}>Discount Source Breakdown</h4>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead><tr>
                <th style={styles.th}>Source</th>
                <th style={styles.th}>Name</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Count</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Total Discount</th>
              </tr></thead>
              <tbody>
                {discountSourceBreakdown.map((d, i) => (
                  <tr key={d.name + i}>
                    <td style={styles.td(i % 2 === 0)}>
                      <span style={styles.badge(d.source === 'offer' ? '#3b82f6' : d.source === 'manual' ? '#d97706' : '#8b5cf6')}>
                        {d.source}
                      </span>
                    </td>
                    <td style={styles.td(i % 2 === 0)}><span style={{ fontWeight: '500' }}>{d.name}</span></td>
                    <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right' }}>{d.count}</td>
                    <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right', fontWeight: '600', color: '#dc2626' }}>{formatCurrency(d.totalDiscount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {outletBreakdown.length > 1 && (
        <div>
          <h4 style={styles.cardTitle}>Per-Outlet Breakdown</h4>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead><tr>
                <th style={styles.th}>Outlet</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Total Discount</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Discounted Orders</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Total Orders</th>
              </tr></thead>
              <tbody>
                {outletBreakdown.map((o, i) => (
                  <tr key={o.outletId}>
                    <td style={styles.td(i % 2 === 0)}><span style={{ fontWeight: '600' }}>{o.outletName}</span></td>
                    <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right', fontWeight: '600', color: '#dc2626' }}>{formatCurrency(o.totalDiscount)}</td>
                    <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right' }}>{o.discountedOrders}</td>
                    <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right' }}>{o.totalOrders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ---- Tax Summary View ----

const TaxSummaryView = ({ data, formatCurrency }) => {
  if (!data || !data.summary) return <EmptyState message="No tax data for this period." />;
  const { summary, taxBreakdown = [], monthlyTrend = [], outletBreakdown = [] } = data;

  return (
    <div>
      <div style={styles.summaryGrid}>
        <div style={styles.statCard('#3b82f6')}><div style={styles.statValue('#3b82f6')}>{formatCurrency(summary.totalTaxCollected)}</div><div style={styles.statLabel}>Total Tax Collected</div></div>
        <div style={styles.statCard('#16a34a')}><div style={styles.statValue('#16a34a')}>{formatCurrency(summary.totalTaxableAmount)}</div><div style={styles.statLabel}>Taxable Amount</div></div>
        <div style={styles.statCard('#8b5cf6')}><div style={styles.statValue('#8b5cf6')}>{formatCurrency(summary.avgTaxPerOrder)}</div><div style={styles.statLabel}>Avg Tax / Order</div></div>
      </div>

      {taxBreakdown.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={styles.cardTitle}>Tax Breakdown</h4>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead><tr>
                <th style={styles.th}>Tax Name</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Rate</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Total Amount</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Orders</th>
              </tr></thead>
              <tbody>
                {taxBreakdown.map((t, i) => (
                  <tr key={t.taxName + t.rate}>
                    <td style={styles.td(i % 2 === 0)}><span style={{ fontWeight: '600' }}>{t.taxName}</span></td>
                    <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right' }}>{t.rate > 0 ? `${t.rate}%` : '-'}</td>
                    <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right', fontWeight: '600', color: '#3b82f6' }}>{formatCurrency(t.totalAmount)}</td>
                    <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right' }}>{t.orderCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {monthlyTrend.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={styles.cardTitle}>Monthly Trend</h4>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead><tr>
                <th style={styles.th}>Month</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Tax Collected</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Orders</th>
              </tr></thead>
              <tbody>
                {monthlyTrend.map((m, i) => (
                  <tr key={m.month}>
                    <td style={styles.td(i % 2 === 0)}><span style={{ fontWeight: '500' }}>{m.month}</span></td>
                    <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right', fontWeight: '600', color: '#3b82f6' }}>{formatCurrency(m.taxCollected)}</td>
                    <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right' }}>{m.orderCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {outletBreakdown.length > 1 && (
        <div>
          <h4 style={styles.cardTitle}>Per-Outlet Breakdown</h4>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead><tr>
                <th style={styles.th}>Outlet</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Total Tax</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Taxable Amount</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Orders</th>
              </tr></thead>
              <tbody>
                {outletBreakdown.map((o, i) => (
                  <tr key={o.outletId}>
                    <td style={styles.td(i % 2 === 0)}><span style={{ fontWeight: '600' }}>{o.outletName}</span></td>
                    <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right', fontWeight: '600', color: '#3b82f6' }}>{formatCurrency(o.totalTax)}</td>
                    <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right' }}>{formatCurrency(o.taxableAmount)}</td>
                    <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right' }}>{o.orderCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ---- Customer Insights View ----

const CustomerInsightsView = ({ data, formatCurrency }) => {
  if (!data || !data.summary) return <EmptyState message="No customer data for this period." />;
  const { summary, topCustomers = [], outletBreakdown = [] } = data;

  return (
    <div>
      <div style={styles.summaryGrid}>
        <div style={styles.statCard('#3b82f6')}><div style={styles.statValue('#3b82f6')}>{summary.totalCustomers}</div><div style={styles.statLabel}>Total Customers</div></div>
        <div style={styles.statCard('#16a34a')}><div style={styles.statValue('#16a34a')}>{summary.newCustomers}</div><div style={styles.statLabel}>New Customers</div></div>
        <div style={styles.statCard('#8b5cf6')}><div style={styles.statValue('#8b5cf6')}>{summary.returningCustomers}</div><div style={styles.statLabel}>Returning</div></div>
        <div style={styles.statCard('#d97706')}><div style={styles.statValue('#d97706')}>{formatCurrency(summary.avgLifetimeValue)}</div><div style={styles.statLabel}>Avg Lifetime Value</div></div>
        <div style={styles.statCard('#6b7280')}><div style={styles.statValue('#6b7280')}>{summary.anonymousOrders}</div><div style={styles.statLabel}>Anonymous Orders</div></div>
      </div>

      {topCustomers.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={styles.cardTitle}>Top Customers</h4>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead><tr>
                <th style={{ ...styles.th, textAlign: 'center', width: '60px' }}>Rank</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Phone</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Visits</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Total Spend</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Avg Order</th>
                <th style={styles.th}>Last Visit</th>
              </tr></thead>
              <tbody>
                {topCustomers.map((c, idx) => (
                  <tr key={c.phone + idx} style={c.rank <= 3 ? { background: c.rank === 1 ? '#fefce8' : c.rank === 2 ? '#f8fafc' : '#fffbeb' } : undefined}>
                    <td style={{ ...styles.td(false), textAlign: 'center', background: 'transparent' }}><div style={styles.rankBadge(c.rank)}>{c.rank}</div></td>
                    <td style={{ ...styles.td(false), background: 'transparent', fontWeight: c.rank <= 3 ? '700' : '500' }}>{c.name}</td>
                    <td style={{ ...styles.td(false), background: 'transparent', fontFamily: 'monospace', fontSize: '13px', color: '#6b7280' }}>{c.phone}</td>
                    <td style={{ ...styles.td(false), textAlign: 'right', background: 'transparent' }}>{c.visitCount}</td>
                    <td style={{ ...styles.td(false), textAlign: 'right', background: 'transparent', fontWeight: '700', color: '#16a34a' }}>{formatCurrency(c.totalSpend)}</td>
                    <td style={{ ...styles.td(false), textAlign: 'right', background: 'transparent' }}>{formatCurrency(c.avgOrderValue)}</td>
                    <td style={{ ...styles.td(false), background: 'transparent', fontSize: '13px', color: '#6b7280' }}>{c.lastVisit ? new Date(c.lastVisit).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {outletBreakdown.length > 1 && (
        <div>
          <h4 style={styles.cardTitle}>Per-Outlet Breakdown</h4>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead><tr>
                <th style={styles.th}>Outlet</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Total Customers</th>
              </tr></thead>
              <tbody>
                {outletBreakdown.map((o, i) => (
                  <tr key={o.outletId}>
                    <td style={styles.td(i % 2 === 0)}><span style={{ fontWeight: '600' }}>{o.outletName}</span></td>
                    <td style={{ ...styles.td(i % 2 === 0), textAlign: 'right' }}>{o.totalCustomers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ---- Payment Analytics View ----

const PaymentAnalyticsView = ({ data, formatCurrency }) => {
  const sm = data?.summary || {};
  const methods = data?.methodBreakdown || [];
  const hourly = data?.hourlyTrend || [];
  const daily = data?.dailyTrend || [];
  return (
    <div>
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Payment Summary</h3>
        <div style={styles.summaryGrid}>
          <div style={styles.statCard('#16a34a')}><div style={styles.statValue('#16a34a')}>{sm.totalTransactions || 0}</div><div style={styles.statLabel}>Total Transactions</div></div>
          <div style={styles.statCard('#3b82f6')}><div style={styles.statValue('#3b82f6')}>{formatCurrency(sm.totalRevenue || 0)}</div><div style={styles.statLabel}>Total Revenue</div></div>
          <div style={styles.statCard('#8b5cf6')}><div style={styles.statValue('#8b5cf6')}>{formatCurrency(sm.avgTransactionValue || 0)}</div><div style={styles.statLabel}>Avg Transaction</div></div>
          <div style={styles.statCard('#d97706')}><div style={styles.statValue('#d97706')}>{sm.splitPaymentCount || 0}</div><div style={styles.statLabel}>Split Payments</div></div>
        </div>
      </div>
      {methods.length > 0 && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Method Breakdown</h3>
          <div style={styles.tableWrap}><table style={styles.table}><thead><tr>
            <th style={styles.th}>Method</th><th style={styles.th}>Count</th><th style={styles.th}>Amount</th><th style={styles.th}>Share</th><th style={styles.th}>Avg Value</th>
          </tr></thead><tbody>
            {methods.map((m, i) => (
              <tr key={i}><td style={styles.td(i % 2 === 0)} className="capitalize">{m.method}</td>
              <td style={styles.td(i % 2 === 0)}>{m.count}</td>
              <td style={styles.td(i % 2 === 0)}>{formatCurrency(m.amount)}</td>
              <td style={styles.td(i % 2 === 0)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3 }}><div style={{ width: `${m.percentage || 0}%`, height: 6, background: '#16a34a', borderRadius: 3 }} /></div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{(m.percentage || 0).toFixed(1)}%</span>
                </div>
              </td>
              <td style={styles.td(i % 2 === 0)}>{formatCurrency(m.avgValue || 0)}</td></tr>
            ))}
          </tbody></table></div>
        </div>
      )}
      {daily.length > 0 && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Daily Payment Trend</h3>
          <div style={styles.tableWrap}><table style={styles.table}><thead><tr>
            <th style={styles.th}>Date</th><th style={styles.th}>Cash</th><th style={styles.th}>Card</th><th style={styles.th}>UPI</th><th style={styles.th}>Other</th><th style={styles.th}>Total</th>
          </tr></thead><tbody>
            {daily.map((d, i) => (
              <tr key={i}>
                <td style={styles.td(i % 2 === 0)}>{d.date}</td>
                <td style={styles.td(i % 2 === 0)}>{formatCurrency(d.cash || 0)}</td>
                <td style={styles.td(i % 2 === 0)}>{formatCurrency(d.card || 0)}</td>
                <td style={styles.td(i % 2 === 0)}>{formatCurrency(d.upi || 0)}</td>
                <td style={styles.td(i % 2 === 0)}>{formatCurrency(d.other || 0)}</td>
                <td style={{...styles.td(i % 2 === 0), fontWeight: 700, color: '#16a34a'}}>{formatCurrency(d.total || 0)}</td>
              </tr>
            ))}
          </tbody></table></div>
        </div>
      )}
    </div>
  );
};

// ---- Order Analytics View ----

const OrderAnalyticsView = ({ data, formatCurrency }) => {
  const sm = data?.summary || {};
  const types = data?.typeBreakdown || [];
  const dow = data?.dayOfWeekAnalysis || [];
  const daily = data?.dailyVolume || [];
  return (
    <div>
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Order Summary</h3>
        <div style={styles.summaryGrid}>
          <div style={styles.statCard('#3b82f6')}><div style={styles.statValue('#3b82f6')}>{sm.totalOrders || 0}</div><div style={styles.statLabel}>Total Orders</div></div>
          <div style={styles.statCard('#8b5cf6')}><div style={styles.statValue('#8b5cf6')}>{(sm.avgItemsPerOrder || 0).toFixed(1)}</div><div style={styles.statLabel}>Avg Items/Order</div></div>
          <div style={styles.statCard('#dc2626')}><div style={styles.statValue('#dc2626')}>{(sm.cancellationRate || 0).toFixed(1)}%</div><div style={styles.statLabel}>Cancellation Rate</div></div>
          <div style={styles.statCard('#16a34a')}><div style={styles.statValue('#16a34a')}>{formatCurrency(sm.avgOrderValue || 0)}</div><div style={styles.statLabel}>Avg Order Value</div></div>
        </div>
      </div>
      {types.length > 0 && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Type Breakdown</h3>
          <div style={styles.tableWrap}><table style={styles.table}><thead><tr>
            <th style={styles.th}>Type</th><th style={styles.th}>Count</th><th style={styles.th}>Amount</th><th style={styles.th}>Share</th>
          </tr></thead><tbody>
            {types.map((t, i) => (
              <tr key={i}>
                <td style={styles.td(i % 2 === 0)} className="capitalize">{(t.type || '').replace(/_/g, ' ')}</td>
                <td style={styles.td(i % 2 === 0)}>{t.count}</td>
                <td style={styles.td(i % 2 === 0)}>{formatCurrency(t.amount)}</td>
                <td style={styles.td(i % 2 === 0)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3 }}><div style={{ width: `${t.percentage || 0}%`, height: 6, background: '#3b82f6', borderRadius: 3 }} /></div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{(t.percentage || 0).toFixed(1)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody></table></div>
        </div>
      )}
      {dow.length > 0 && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Day of Week Analysis</h3>
          <div style={styles.tableWrap}><table style={styles.table}><thead><tr>
            <th style={styles.th}>Day</th><th style={styles.th}>Orders</th><th style={styles.th}>Revenue</th><th style={styles.th}>Avg Value</th>
          </tr></thead><tbody>
            {dow.map((d, i) => (
              <tr key={i}>
                <td style={styles.td(i % 2 === 0)}>{d.day}</td>
                <td style={styles.td(i % 2 === 0)}>{d.orderCount}</td>
                <td style={{...styles.td(i % 2 === 0), fontWeight: 600, color: '#16a34a'}}>{formatCurrency(d.revenue)}</td>
                <td style={styles.td(i % 2 === 0)}>{formatCurrency(d.avgValue || 0)}</td>
              </tr>
            ))}
          </tbody></table></div>
        </div>
      )}
      {daily.length > 0 && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Daily Volume</h3>
          <div style={styles.tableWrap}><table style={styles.table}><thead><tr>
            <th style={styles.th}>Date</th><th style={styles.th}>Orders</th><th style={styles.th}>Revenue</th><th style={styles.th}>Avg Value</th>
          </tr></thead><tbody>
            {daily.map((d, i) => (
              <tr key={i}>
                <td style={styles.td(i % 2 === 0)}>{d.date}</td>
                <td style={styles.td(i % 2 === 0)}>{d.orderCount}</td>
                <td style={{...styles.td(i % 2 === 0), fontWeight: 600, color: '#16a34a'}}>{formatCurrency(d.revenue)}</td>
                <td style={styles.td(i % 2 === 0)}>{formatCurrency(d.avgValue || 0)}</td>
              </tr>
            ))}
          </tbody></table></div>
        </div>
      )}
    </div>
  );
};

// ---- Revenue Trends View ----

const RevenueTrendsView = ({ data, formatCurrency }) => {
  const sm = data?.summary || {};
  const daily = data?.dailyTrend || [];
  const dow = data?.dayOfWeekAvg || [];
  const outlets = data?.outletTrend || [];
  const bestDay = data?.bestDay || null;
  const worstDay = data?.worstDay || null;
  const growth = sm.growthRate || 0;
  return (
    <div>
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Revenue Summary</h3>
        <div style={styles.summaryGrid}>
          <div style={styles.statCard('#16a34a')}><div style={styles.statValue('#16a34a')}>{formatCurrency(sm.totalRevenue || 0)}</div><div style={styles.statLabel}>Total Revenue</div></div>
          <div style={styles.statCard('#3b82f6')}><div style={styles.statValue('#3b82f6')}>{formatCurrency(sm.previousPeriodRevenue || 0)}</div><div style={styles.statLabel}>Previous Period</div></div>
          <div style={styles.statCard(growth >= 0 ? '#16a34a' : '#dc2626')}><div style={styles.statValue(growth >= 0 ? '#16a34a' : '#dc2626')}>{growth >= 0 ? '\u25B2' : '\u25BC'} {Math.abs(growth).toFixed(1)}%</div><div style={styles.statLabel}>Growth Rate</div></div>
          <div style={styles.statCard('#8b5cf6')}><div style={styles.statValue('#8b5cf6')}>{formatCurrency(sm.avgDailyRevenue || 0)}</div><div style={styles.statLabel}>Avg Daily Revenue</div></div>
        </div>
      </div>
      {(bestDay || worstDay) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14, marginBottom: 20 }}>
          {bestDay && (
            <div style={{ ...styles.statCard('#16a34a'), textAlign: 'left' }}>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Best Day</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#16a34a' }}>{bestDay.date}</div>
              <div style={{ fontWeight: 600, color: '#374151' }}>{formatCurrency(bestDay.revenue || 0)} &middot; {bestDay.orderCount || 0} orders</div>
            </div>
          )}
          {worstDay && (
            <div style={{ ...styles.statCard('#dc2626'), textAlign: 'left' }}>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Worst Day</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#dc2626' }}>{worstDay.date}</div>
              <div style={{ fontWeight: 600, color: '#374151' }}>{formatCurrency(worstDay.revenue || 0)} &middot; {worstDay.orderCount || 0} orders</div>
            </div>
          )}
        </div>
      )}
      {dow.length > 0 && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Day of Week Average</h3>
          <div style={styles.tableWrap}><table style={styles.table}><thead><tr>
            <th style={styles.th}>Day</th><th style={styles.th}>Avg Revenue</th><th style={styles.th}>Avg Orders</th><th style={styles.th}>Total Revenue</th>
          </tr></thead><tbody>
            {dow.map((d, i) => (
              <tr key={i}>
                <td style={styles.td(i % 2 === 0)}>{d.day}</td>
                <td style={{...styles.td(i % 2 === 0), fontWeight: 600, color: '#16a34a'}}>{formatCurrency(d.avgRevenue || 0)}</td>
                <td style={styles.td(i % 2 === 0)}>{(d.avgOrders || 0).toFixed(1)}</td>
                <td style={styles.td(i % 2 === 0)}>{formatCurrency(d.totalRevenue || 0)}</td>
              </tr>
            ))}
          </tbody></table></div>
        </div>
      )}
      {outlets.length > 0 && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Outlet Comparison</h3>
          <div style={styles.tableWrap}><table style={styles.table}><thead><tr>
            <th style={styles.th}>Outlet</th><th style={styles.th}>Current</th><th style={styles.th}>Previous</th><th style={styles.th}>Growth</th>
          </tr></thead><tbody>
            {outlets.map((o, i) => {
              const g = o.growth || 0;
              return (
                <tr key={i}>
                  <td style={styles.td(i % 2 === 0)}><span style={{ fontWeight: 600 }}>{o.outletName}</span></td>
                  <td style={{...styles.td(i % 2 === 0), fontWeight: 600, color: '#16a34a'}}>{formatCurrency(o.revenue)}</td>
                  <td style={styles.td(i % 2 === 0)}>{formatCurrency(o.previousRevenue || 0)}</td>
                  <td style={{...styles.td(i % 2 === 0), fontWeight: 600, color: g >= 0 ? '#16a34a' : '#dc2626'}}>{g >= 0 ? '\u25B2' : '\u25BC'} {Math.abs(g).toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody></table></div>
        </div>
      )}
      {daily.length > 0 && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Daily Revenue Trend</h3>
          <div style={styles.tableWrap}><table style={styles.table}><thead><tr>
            <th style={styles.th}>Date</th><th style={styles.th}>Revenue</th><th style={styles.th}>Orders</th><th style={styles.th}>Avg Value</th>
          </tr></thead><tbody>
            {daily.map((d, i) => (
              <tr key={i}>
                <td style={styles.td(i % 2 === 0)}>{d.date}</td>
                <td style={{...styles.td(i % 2 === 0), fontWeight: 600, color: '#16a34a'}}>{formatCurrency(d.revenue)}</td>
                <td style={styles.td(i % 2 === 0)}>{d.orderCount}</td>
                <td style={styles.td(i % 2 === 0)}>{formatCurrency(d.avgValue || 0)}</td>
              </tr>
            ))}
          </tbody></table></div>
        </div>
      )}
    </div>
  );
};

// ---- Wallet & Loyalty View ----

const WalletLoyaltyView = ({ data, formatCurrency }) => {
  const sm = data?.summary || {};
  const topUsers = data?.topWalletUsers || [];
  const trend = data?.loyaltyTrend || [];
  return (
    <div>
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Wallet & Loyalty Summary</h3>
        <div style={styles.summaryGrid}>
          <div style={styles.statCard('#16a34a')}><div style={styles.statValue('#16a34a')}>{formatCurrency(sm.totalWalletRedeemed || 0)}</div><div style={styles.statLabel}>Wallet Redeemed</div></div>
          <div style={styles.statCard('#3b82f6')}><div style={styles.statValue('#3b82f6')}>{(sm.totalLoyaltyPointsIssued || 0).toLocaleString()}</div><div style={styles.statLabel}>Points Issued</div></div>
          <div style={styles.statCard('#8b5cf6')}><div style={styles.statValue('#8b5cf6')}>{(sm.totalLoyaltyPointsRedeemed || 0).toLocaleString()}</div><div style={styles.statLabel}>Points Redeemed</div></div>
          <div style={styles.statCard('#d97706')}><div style={styles.statValue('#d97706')}>{(sm.loyaltyOrderPercentage || 0).toFixed(1)}%</div><div style={styles.statLabel}>Loyalty Order %</div></div>
          <div style={styles.statCard('#06b6d4')}><div style={styles.statValue('#06b6d4')}>{sm.walletOrderCount || 0}</div><div style={styles.statLabel}>Wallet Orders</div></div>
          <div style={styles.statCard('#f59e0b')}><div style={styles.statValue('#f59e0b')}>{sm.loyaltyOrderCount || 0}</div><div style={styles.statLabel}>Loyalty Orders</div></div>
        </div>
      </div>
      {topUsers.length > 0 && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Top Wallet Users</h3>
          <div style={styles.tableWrap}><table style={styles.table}><thead><tr>
            <th style={styles.th}>#</th><th style={styles.th}>Name</th><th style={styles.th}>Phone</th><th style={styles.th}>Redeemed</th><th style={styles.th}>Orders</th>
          </tr></thead><tbody>
            {topUsers.map((u, i) => (
              <tr key={i}>
                <td style={styles.td(i % 2 === 0)}>{i + 1}</td>
                <td style={styles.td(i % 2 === 0)}><span style={{ fontWeight: 600 }}>{u.name || 'Guest'}</span></td>
                <td style={{...styles.td(i % 2 === 0), fontFamily: 'monospace', fontSize: 13, color: '#6b7280'}}>{u.phone || '-'}</td>
                <td style={{...styles.td(i % 2 === 0), fontWeight: 600, color: '#16a34a'}}>{formatCurrency(u.totalRedeemed || 0)}</td>
                <td style={styles.td(i % 2 === 0)}>{u.orderCount || 0}</td>
              </tr>
            ))}
          </tbody></table></div>
        </div>
      )}
      {trend.length > 0 && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Loyalty Daily Trend</h3>
          <div style={styles.tableWrap}><table style={styles.table}><thead><tr>
            <th style={styles.th}>Date</th><th style={styles.th}>Points Issued</th><th style={styles.th}>Points Redeemed</th><th style={styles.th}>Redemption Value</th>
          </tr></thead><tbody>
            {trend.map((t, i) => (
              <tr key={i}>
                <td style={styles.td(i % 2 === 0)}>{t.date}</td>
                <td style={styles.td(i % 2 === 0)}>{t.pointsIssued}</td>
                <td style={styles.td(i % 2 === 0)}>{t.pointsRedeemed}</td>
                <td style={{...styles.td(i % 2 === 0), fontWeight: 600, color: '#16a34a'}}>{formatCurrency(t.redemptionValue || 0)}</td>
              </tr>
            ))}
          </tbody></table></div>
        </div>
      )}
    </div>
  );
};

// ---- Excel Sheet Data Helper ----

function getExcelSheetData(reportType, data, formatCurrency) {
  const sheets = [];
  const sm = data?.summary || {};

  switch (reportType) {
    case REPORT_TYPES.SALES: {
      sheets.push({ name: 'Summary', data: [
        ['Sales Summary Report'],
        [],
        ['Metric', 'Value'],
        ['Total Revenue', sm.totalRevenue || 0],
        ['Total Orders', sm.totalOrders || 0],
        ['Avg Ticket Size', sm.avgTicketSize || 0],
        ['Total Tips', sm.totalTips || 0],
        ['Service Charge', sm.totalServiceCharge || 0],
      ]});
      if (data?.paymentBreakdown?.length) {
        sheets.push({ name: 'Payment Breakdown', data: [
          ['Method', 'Count', 'Amount', 'Percentage'],
          ...data.paymentBreakdown.map(p => [p.method, p.count, p.amount, `${p.percentage}%`])
        ]});
      }
      if (data?.serviceTypeBreakdown?.length) {
        sheets.push({ name: 'Service Type', data: [
          ['Type', 'Count', 'Amount', 'Percentage'],
          ...data.serviceTypeBreakdown.map(s => [s.type?.replace(/_/g, ' '), s.count, s.amount, `${s.percentage}%`])
        ]});
      }
      if (data?.dailyTrend?.length) {
        sheets.push({ name: 'Daily Trend', data: [
          ['Date', 'Revenue', 'Orders', 'Avg Value'],
          ...data.dailyTrend.map(d => [d.date, d.revenue, d.orderCount, d.orderCount > 0 ? Math.round((d.revenue / d.orderCount) * 100) / 100 : 0])
        ]});
      }
      if (data?.outletBreakdown?.length) {
        sheets.push({ name: 'Outlet Breakdown', data: [
          ['Outlet', 'Revenue', 'Orders', 'Avg Ticket'],
          ...data.outletBreakdown.map(o => [o.outletName, o.revenue, o.orderCount, o.avgTicketSize])
        ]});
      }
      break;
    }
    case REPORT_TYPES.STAFF: {
      const staff = data?.staffRankings || data?.rankings || [];
      sheets.push({ name: 'Staff Performance', data: [
        ['Rank', 'Name', 'Outlets', 'Orders', 'Sales', 'Avg Ticket', 'Tips'],
        ...staff.map((s, i) => [i + 1, s.staffName || s.name, Array.isArray(s.outlets) ? s.outlets.join(', ') : '', s.ordersHandled || s.orders || 0, s.totalSales || s.sales || 0, s.avgTicketSize || 0, s.tipsEarned || s.tips || 0])
      ]});
      break;
    }
    case REPORT_TYPES.MENU: {
      const items = data?.items || data?.breakdown || [];
      sheets.push({ name: 'Menu Performance', data: [
        ['#', 'Item', 'Qty Sold', 'Revenue', 'Revenue %'],
        ...items.map((item, i) => [i + 1, item.itemName || item.name, item.qtySold || item.quantity || item.totalSalesCount || item.totalSales || 0, item.revenue || item.totalRevenue || 0, `${(item.revenuePercentage || 0).toFixed(1)}%`])
      ]});
      break;
    }
    case REPORT_TYPES.CATEGORY: {
      const cats = data?.categories || data?.breakdown || [];
      sheets.push({ name: 'Category Sales', data: [
        ['Category', 'Qty Sold', 'Revenue', 'Share %', 'Unique Items'],
        ...cats.map(c => [c.category, c.totalQuantity || 0, c.totalRevenue || 0, `${(c.revenuePercentage || 0).toFixed(1)}%`, c.uniqueItems || 0])
      ]});
      break;
    }
    case REPORT_TYPES.DISCOUNT: {
      const sources = data?.discountSourceBreakdown || data?.sourceBreakdown || data?.sources || [];
      const outlets = data?.outletBreakdown || [];
      sheets.push({ name: 'Discount Summary', data: [
        ['Metric', 'Value'],
        ['Total Discount Given', sm.totalDiscountGiven || 0],
        ['Discounted Order %', `${sm.discountedOrderPercentage || 0}%`],
        ['Avg Ticket w/ Discount', sm.avgTicketWithDiscount || 0],
        ['Avg Ticket w/o Discount', sm.avgTicketWithoutDiscount || 0],
      ]});
      if (sources.length) sheets.push({ name: 'Sources', data: [['Source', 'Name', 'Count', 'Total Discount'], ...sources.map(s => [s.source || s.type, s.name || '-', s.count, s.totalDiscount])] });
      if (outlets.length) sheets.push({ name: 'By Outlet', data: [['Outlet', 'Discount', 'Discounted Orders', 'Total Orders'], ...outlets.map(o => [o.outletName, o.totalDiscount, o.discountedOrders, o.totalOrders])] });
      break;
    }
    case REPORT_TYPES.TAX: {
      const taxes = data?.taxBreakdown || [];
      const monthly = data?.monthlyTrend || [];
      sheets.push({ name: 'Tax Summary', data: [['Metric', 'Value'], ['Total Tax', sm.totalTaxCollected || 0], ['Taxable Amount', sm.totalTaxableAmount || 0], ['Avg Tax/Order', sm.avgTaxPerOrder || 0]] });
      if (taxes.length) sheets.push({ name: 'Tax Breakdown', data: [['Tax', 'Rate', 'Amount', 'Orders'], ...taxes.map(t => [t.taxName || t.name, `${t.rate}%`, t.totalAmount || t.amount || 0, t.orderCount || 0])] });
      if (monthly.length) sheets.push({ name: 'Monthly', data: [['Month', 'Tax Collected', 'Orders'], ...monthly.map(m => [m.month, m.taxCollected, m.orderCount])] });
      break;
    }
    case REPORT_TYPES.CUSTOMER: {
      const tops = data?.topCustomers || [];
      sheets.push({ name: 'Customer Insights', data: [['Metric', 'Value'], ['Total Customers', sm.totalCustomers || 0], ['New', sm.newCustomers || 0], ['Returning', sm.returningCustomers || 0], ['Avg Lifetime Value', sm.avgLifetimeValue || 0]] });
      if (tops.length) sheets.push({ name: 'Top Customers', data: [['Rank', 'Name', 'Phone', 'Visits', 'Spend', 'Avg Order', 'Last Visit'], ...tops.map((c, i) => [c.rank || i + 1, c.name || 'Guest', c.phone || '-', c.visitCount || c.visits || 0, c.totalSpend || c.spend || 0, c.avgOrderValue || 0, c.lastVisit || '-'])] });
      break;
    }
    case REPORT_TYPES.RANKING: {
      const ranks = data?.rankings || data?.outletRankings || [];
      sheets.push({ name: 'Outlet Ranking', data: [['Rank', 'Outlet', 'Revenue', 'Orders', 'Avg Ticket'], ...ranks.map((o, i) => [o.rank || i + 1, o.name || o.outletName, o.revenue, o.orders || o.orderCount || 0, o.avgTicket || o.avgTicketSize || 0])] });
      break;
    }
    case REPORT_TYPES.PL: {
      const outlets = data?.outletBreakdown || [];
      const totalRevenue = data.totalRevenue ?? sm.totalRevenue ?? 0;
      const totalExpenses = data.totalExpenses ?? sm.totalExpenses ?? 0;
      const grossProfit = data.grossProfit ?? sm.grossProfit ?? (totalRevenue - totalExpenses);
      const profitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0.0';
      sheets.push({ name: 'P&L Summary', data: [['Metric', 'Value'], ['Revenue', totalRevenue], ['Expenses', totalExpenses], ['Gross Profit', grossProfit], ['Margin', `${profitMargin}%`], ['Orders', sm.totalOrders || outlets.reduce((s, o) => s + (o.orderCount || 0), 0)]] });
      if (outlets.length) sheets.push({ name: 'By Outlet', data: [['Outlet', 'Revenue', 'Expenses', 'Profit', 'Margin', 'Orders'], ...outlets.map(o => { const rev = o.totalRevenue || o.revenue || 0; const exp = o.totalExpenses || o.expenses || 0; const profit = o.grossProfit || o.profit || (rev - exp); return [o.outletName || o.name, rev, exp, profit, rev > 0 ? `${((profit / rev) * 100).toFixed(1)}%` : '0.0%', o.orderCount || 0]; })] });
      break;
    }
    case REPORT_TYPES.PAYMENT: {
      const methods = data?.methodBreakdown || [];
      const daily = data?.dailyTrend || [];
      sheets.push({ name: 'Payment Summary', data: [['Metric', 'Value'], ['Total Transactions', sm.totalTransactions || 0], ['Total Revenue', sm.totalRevenue || 0], ['Avg Transaction', sm.avgTransactionValue || 0], ['Split Payments', sm.splitPaymentCount || 0]] });
      if (methods.length) sheets.push({ name: 'Methods', data: [['Method', 'Count', 'Amount', 'Share', 'Avg Value'], ...methods.map(m => [m.method, m.count, m.amount, `${(m.percentage || 0).toFixed(1)}%`, m.avgValue || 0])] });
      if (daily.length) sheets.push({ name: 'Daily', data: [['Date', 'Cash', 'Card', 'UPI', 'Other', 'Total'], ...daily.map(d => [d.date, d.cash || 0, d.card || 0, d.upi || 0, d.other || 0, d.total || 0])] });
      break;
    }
    case REPORT_TYPES.ORDER_ANALYTICS: {
      const types = data?.typeBreakdown || [];
      const daily = data?.dailyVolume || [];
      const dow = data?.dayOfWeekAnalysis || [];
      sheets.push({ name: 'Order Summary', data: [['Metric', 'Value'], ['Total Orders', sm.totalOrders || 0], ['Avg Items/Order', sm.avgItemsPerOrder || 0], ['Cancellation Rate', `${sm.cancellationRate || 0}%`], ['Avg Order Value', sm.avgOrderValue || 0]] });
      if (types.length) sheets.push({ name: 'By Type', data: [['Type', 'Count', 'Revenue', 'Share'], ...types.map(t => [t.type?.replace(/_/g, ' '), t.count, t.amount, `${(t.percentage || 0).toFixed(1)}%`])] });
      if (dow.length) sheets.push({ name: 'Day of Week', data: [['Day', 'Orders', 'Revenue', 'Avg Value'], ...dow.map(d => [d.day, d.orderCount, d.revenue, d.avgValue || 0])] });
      if (daily.length) sheets.push({ name: 'Daily Volume', data: [['Date', 'Orders', 'Revenue', 'Avg Value'], ...daily.map(d => [d.date, d.orderCount, d.revenue, d.avgValue || 0])] });
      break;
    }
    case REPORT_TYPES.REVENUE_TRENDS: {
      const daily = data?.dailyTrend || [];
      const dow = data?.dayOfWeekAvg || [];
      const outlets = data?.outletTrend || [];
      sheets.push({ name: 'Revenue Summary', data: [['Metric', 'Value'], ['Total Revenue', sm.totalRevenue || 0], ['Previous Period', sm.previousPeriodRevenue || 0], ['Growth Rate', `${sm.growthRate || 0}%`], ['Avg Daily', sm.avgDailyRevenue || 0]] });
      if (dow.length) sheets.push({ name: 'Day of Week', data: [['Day', 'Avg Revenue', 'Avg Orders', 'Total'], ...dow.map(d => [d.day, d.avgRevenue || 0, (d.avgOrders || 0).toFixed(1), d.totalRevenue || 0])] });
      if (outlets.length) sheets.push({ name: 'Outlet Comparison', data: [['Outlet', 'Current', 'Previous', 'Growth'], ...outlets.map(o => [o.outletName, o.revenue, o.previousRevenue || 0, `${(o.growth || 0).toFixed(1)}%`])] });
      if (daily.length) sheets.push({ name: 'Daily', data: [['Date', 'Revenue', 'Orders', 'Avg Value'], ...daily.map(d => [d.date, d.revenue, d.orderCount, d.avgValue || 0])] });
      break;
    }
    case REPORT_TYPES.WALLET_LOYALTY: {
      const topUsers = data?.topWalletUsers || [];
      const trend = data?.loyaltyTrend || [];
      sheets.push({ name: 'Wallet & Loyalty', data: [['Metric', 'Value'], ['Wallet Redeemed', sm.totalWalletRedeemed || 0], ['Points Issued', sm.totalLoyaltyPointsIssued || 0], ['Points Redeemed', sm.totalLoyaltyPointsRedeemed || 0], ['Loyalty Orders', sm.loyaltyOrderCount || 0], ['Wallet Orders', sm.walletOrderCount || 0], ['Loyalty Usage %', `${sm.loyaltyOrderPercentage || 0}%`]] });
      if (topUsers.length) sheets.push({ name: 'Top Wallet Users', data: [['#', 'Name', 'Phone', 'Redeemed', 'Orders'], ...topUsers.map((u, i) => [i + 1, u.name || 'Guest', u.phone || '-', u.totalRedeemed || 0, u.orderCount || 0])] });
      if (trend.length) sheets.push({ name: 'Daily Trend', data: [['Date', 'Points Issued', 'Points Redeemed', 'Redemption Value'], ...trend.map(t => [t.date, t.pointsIssued, t.pointsRedeemed, t.redemptionValue || 0])] });
      break;
    }
    case REPORT_TYPES.ITEM_SALES: {
      const items = data?.items || data?.breakdown || [];
      const totalRev = items.reduce((s, i) => s + (i.totalRevenue || i.revenue || 0), 0);
      sheets.push({ name: 'Item-wise Sales', data: [
        ['#', 'Item', 'Qty Sold', 'Revenue', '% of Total'],
        ...items.map((item, i) => {
          const qty = item.totalSalesCount || item.totalSales || item.quantity || 0;
          const rev = item.totalRevenue || item.revenue || 0;
          const pct = totalRev > 0 ? ((rev / totalRev) * 100).toFixed(1) : '0.0';
          return [i + 1, item.itemName || item.name, qty, rev, `${pct}%`];
        })
      ]});
      break;
    }
    default:
      sheets.push({ name: 'Data', data: [['Report data available. Use CSV export for detailed data.']] });
  }

  return sheets.length > 0 ? sheets : [{ name: 'Data', data: [['No data available']] }];
}

// Keyframes for spinner animation
const SpinnerKeyframes = () => (
  <style>{`@keyframes hqSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
);

// ---- Main Component ----

export default function HQReportsTab({ orgData, outlets, formatCurrency, restaurantData: restaurantDataProp, selectedRestaurants, setSelectedRestaurants, allRestaurants, dateRange }) {
  const [activeReport, setActiveReport] = useState(null);
  const [startDate, setStartDate] = useState(getDefaultStartDate);
  const [endDate, setEndDate] = useState(getDefaultEndDate);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [summaries, setSummaries] = useState(null);
  const [showRestaurantPicker, setShowRestaurantPicker] = useState(false);
  const restaurantPickerRef = useRef(null);

  // Close restaurant picker on click outside
  useEffect(() => {
    if (!showRestaurantPicker) return;
    const handleClick = (e) => {
      if (restaurantPickerRef.current && !restaurantPickerRef.current.contains(e.target)) {
        setShowRestaurantPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showRestaurantPicker]);

  // Sync date range from parent Overview tab when it changes
  useEffect(() => {
    if (!dateRange) return;
    if (dateRange.preset === 'today') {
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
      setEndDate(today);
    } else if (dateRange.preset === '7d') {
      const end = new Date();
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    } else if (dateRange.preset === '30d') {
      const end = new Date();
      const start = new Date(end);
      start.setDate(start.getDate() - 29);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    } else if (dateRange.startDate && dateRange.endDate) {
      setStartDate(dateRange.startDate);
      setEndDate(dateRange.endDate);
    }
  }, [dateRange]);

  // Get restaurant data for logo - from prop or localStorage
  const restaurantData = restaurantDataProp || (() => {
    try { return JSON.parse(localStorage.getItem('selectedRestaurant')); } catch { return null; }
  })();

  const orgId = orgData?.id || orgData?._id;
  const settings = orgData?.settings || {};

  const reportCards = [
    { key: REPORT_TYPES.SALES, label: 'Sales Summary', icon: FaChartBar, show: true },
    { key: REPORT_TYPES.INVENTORY, label: 'Inventory Comparison', icon: FaBoxes, show: true },
    { key: REPORT_TYPES.PL, label: 'Consolidated P&L', icon: FaChartLine, show: true },
    { key: REPORT_TYPES.KITCHEN, label: 'Kitchen Reports', icon: FaIndustry, show: !!settings.centralKitchen },
    { key: REPORT_TYPES.WAREHOUSE, label: 'Warehouse Metrics', icon: FaWarehouse, show: !!settings.centralWarehouse },
    { key: REPORT_TYPES.INDENT, label: 'Indent Tracking', icon: FaClipboardList, show: !!settings.centralWarehouse },
    { key: REPORT_TYPES.MENU, label: 'Menu Performance', icon: FaUtensils, show: true },
    { key: REPORT_TYPES.RANKING, label: 'Outlet Ranking', icon: FaTrophy, show: true },
    { key: REPORT_TYPES.STAFF, label: 'Staff Performance', icon: FaUsers, show: true },
    { key: REPORT_TYPES.CATEGORY, label: 'Category Sales', icon: FaTags, show: true },
    { key: REPORT_TYPES.DISCOUNT, label: 'Discounts & Offers', icon: FaPercent, show: true },
    { key: REPORT_TYPES.TAX, label: 'Tax Summary', icon: FaFileInvoiceDollar, show: true },
    { key: REPORT_TYPES.CUSTOMER, label: 'Customer Insights', icon: FaAddressBook, show: true },
    { key: REPORT_TYPES.PAYMENT, label: 'Payment Analytics', icon: FaMoneyBillWave, show: true },
    { key: REPORT_TYPES.ORDER_ANALYTICS, label: 'Order Analytics', icon: FaShoppingBag, show: true },
    { key: REPORT_TYPES.REVENUE_TRENDS, label: 'Revenue Trends', icon: FaChartArea, show: true },
    { key: REPORT_TYPES.WALLET_LOYALTY, label: 'Wallet & Loyalty', icon: FaWallet, show: true },
    { key: REPORT_TYPES.ITEM_SALES, label: 'Item-wise Sales', icon: FaListOl, show: true },
  ].filter((c) => c.show);

  const getExportType = (reportKey) => {
    const map = {
      [REPORT_TYPES.INVENTORY]: 'inventory-comparison',
      [REPORT_TYPES.PL]: 'consolidated-pl',
      [REPORT_TYPES.KITCHEN]: 'kitchen-reports',
      [REPORT_TYPES.WAREHOUSE]: 'warehouse-metrics',
      [REPORT_TYPES.INDENT]: 'indent-tracking',
      [REPORT_TYPES.MENU]: 'menu-performance',
      [REPORT_TYPES.RANKING]: 'outlet-ranking',
      [REPORT_TYPES.SALES]: 'sales-summary',
      [REPORT_TYPES.STAFF]: 'staff-performance',
      [REPORT_TYPES.CATEGORY]: 'category-sales',
      [REPORT_TYPES.DISCOUNT]: 'discount-report',
      [REPORT_TYPES.TAX]: 'tax-summary',
      [REPORT_TYPES.CUSTOMER]: 'customer-insights',
      [REPORT_TYPES.PAYMENT]: 'payment-analytics',
      [REPORT_TYPES.ORDER_ANALYTICS]: 'order-analytics',
      [REPORT_TYPES.REVENUE_TRENDS]: 'revenue-trends',
      [REPORT_TYPES.WALLET_LOYALTY]: 'wallet-loyalty',
      [REPORT_TYPES.ITEM_SALES]: 'menu-performance',
    };
    return map[reportKey] || reportKey;
  };

  const loadReport = useCallback(async (reportKey) => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    setReportData(null);

    try {
      let result;
      const dateParams = {
        startDate,
        endDate,
        restaurantIds: selectedRestaurants?.length > 0 ? selectedRestaurants : undefined,
      };

      switch (reportKey) {
        case REPORT_TYPES.INVENTORY:
          result = await apiClient.getInventoryComparison(orgId, dateParams);
          break;
        case REPORT_TYPES.PL:
          result = await apiClient.getConsolidatedPL(orgId, dateParams);
          break;
        case REPORT_TYPES.KITCHEN:
          result = await apiClient.getKitchenReports(orgId, dateParams);
          break;
        case REPORT_TYPES.WAREHOUSE:
          result = await apiClient.getWarehouseMetrics(orgId, dateParams);
          break;
        case REPORT_TYPES.INDENT:
          result = await apiClient.getIndentTracking(orgId, dateParams);
          break;
        case REPORT_TYPES.MENU:
          result = await apiClient.getMenuPerformance(orgId, dateParams);
          break;
        case REPORT_TYPES.RANKING:
          result = await apiClient.getOutletRanking(orgId, dateParams);
          break;
        case REPORT_TYPES.SALES:
          result = await apiClient.getSalesSummary(orgId, dateParams);
          break;
        case REPORT_TYPES.STAFF:
          result = await apiClient.getStaffPerformance(orgId, dateParams);
          break;
        case REPORT_TYPES.CATEGORY:
          result = await apiClient.getCategorySales(orgId, dateParams);
          break;
        case REPORT_TYPES.DISCOUNT:
          result = await apiClient.getDiscountReport(orgId, dateParams);
          break;
        case REPORT_TYPES.TAX:
          result = await apiClient.getTaxSummary(orgId, dateParams);
          break;
        case REPORT_TYPES.CUSTOMER:
          result = await apiClient.getCustomerInsights(orgId, dateParams);
          break;
        case REPORT_TYPES.PAYMENT:
          result = await apiClient.getPaymentAnalytics(orgId, dateParams);
          break;
        case REPORT_TYPES.ORDER_ANALYTICS:
          result = await apiClient.getOrderAnalytics(orgId, dateParams);
          break;
        case REPORT_TYPES.REVENUE_TRENDS:
          result = await apiClient.getRevenueTrends(orgId, dateParams);
          break;
        case REPORT_TYPES.WALLET_LOYALTY:
          result = await apiClient.getWalletLoyaltyReport(orgId, dateParams);
          break;
        case REPORT_TYPES.ITEM_SALES:
          result = await apiClient.getMenuPerformance(orgId, dateParams);
          break;
        default:
          break;
      }

      setReportData(result?.data || result || null);
    } catch (err) {
      console.error('Failed to load report:', err);
      setError(err?.message || 'Failed to load report. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [orgId, startDate, endDate, selectedRestaurants]);

  // Load report summaries for card previews when on grid view
  useEffect(() => {
    if (activeReport || !orgId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.getReportSummaries(orgId, { startDate, endDate, restaurantIds: selectedRestaurants?.length > 0 ? selectedRestaurants : undefined });
        if (!cancelled && res?.summaries) setSummaries(res.summaries);
      } catch (e) {
        // Silently fail — previews are optional
      }
    })();
    return () => { cancelled = true; };
  }, [activeReport, orgId, startDate, endDate, selectedRestaurants]);

  const getPreviewText = (reportKey) => {
    if (!summaries) return null;
    const s = summaries[reportKey];
    if (!s) return null;
    const fmt = (v) => formatCurrency ? formatCurrency(v) : `₹${Number(v).toLocaleString()}`;
    switch (reportKey) {
      case 'sales': return `${fmt(s.revenue)} · ${s.orders} orders`;
      case 'pl': return `${s.margin}% margin`;
      case 'inventory': return `${s.lowStock} low stock`;
      case 'category': return s.topCategory ? `Top: ${s.topCategory}` : null;
      case 'discount': return fmt(s.totalDiscount);
      case 'tax': return fmt(s.totalTax);
      case 'payment': return s.topMethod ? `Top: ${s.topMethod.toUpperCase()}` : null;
      case 'order-analytics': return `${s.orders} orders`;
      case 'revenue-trends': return fmt(s.revenue);
      case 'item-sales': return s.topItem ? `Top: ${s.topItem}` : (s.items ? `${s.items} items` : null);
      default: return null;
    }
  };

  const handleSelectReport = (reportKey) => {
    setActiveReport(reportKey);
    loadReport(reportKey);
  };

  const handleBack = () => {
    setActiveReport(null);
    setReportData(null);
    setError(null);
  };

  const handleDateChange = () => {
    if (activeReport) {
      loadReport(activeReport);
    }
  };

  const handleExportCSV = async () => {
    if (!orgId || !activeReport) return;
    setExporting(true);
    try {
      // For item-sales, generate CSV client-side from loaded reportData
      if (activeReport === REPORT_TYPES.ITEM_SALES && reportData) {
        const sheetData = getExcelSheetData(activeReport, reportData, formatCurrency);
        if (sheetData.length > 0) {
          const csv = sheetData[0].data.map(r => r.map(c => { const s = String(c ?? ''); return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s; }).join(',')).join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `item-wise-sales-${startDate}-to-${endDate}.csv`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
        }
        setExporting(false);
        return;
      }
      const response = await apiClient.exportHQReport(orgId, getExportType(activeReport), { startDate, endDate, restaurantIds: selectedRestaurants?.length > 0 ? selectedRestaurants : undefined });
      if (response && response.blob) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${getExportType(activeReport)}-${startDate}-to-${endDate}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else if (response instanceof Blob) {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${getExportType(activeReport)}-${startDate}-to-${endDate}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        // Fallback: try to use response as text CSV
        const text = typeof response === 'string' ? response : JSON.stringify(response);
        const blob = new Blob([text], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${getExportType(activeReport)}-${startDate}-to-${endDate}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!reportData || exporting) return;
    setExporting(true);
    try {
      const XLSX = (await import('xlsx'));
      const wb = XLSX.utils.book_new();
      const sheetData = getExcelSheetData(activeReport, reportData, formatCurrency);
      sheetData.forEach(({ name, data }) => {
        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
      });
      const exportType = getExportType(activeReport);
      XLSX.writeFile(wb, `${exportType}-${startDate}-to-${endDate}.xlsx`);
    } catch (err) {
      console.error('Excel export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!reportData || exporting) return;
    setExporting(true);
    try {
      // Fetch fresh print settings to get latest logo
      let logoUrl = restaurantData?.printSettings?.receiptLogo?.url || null;
      const restaurantId = restaurantData?.id || orgData?.id;
      if (restaurantId) {
        try {
          const psRes = await apiClient.getPrintSettings(restaurantId);
          if (psRes?.printSettings?.receiptLogo?.url) {
            logoUrl = psRes.printSettings.receiptLogo.url;
          }
        } catch {}
      }
      // Convert logo URL to base64 via backend proxy to avoid CORS issues with GCP Storage URLs
      if (logoUrl) {
        try {
          const proxyRes = await apiClient.imageToBase64(logoUrl);
          if (proxyRes?.base64) {
            logoUrl = proxyRes.base64;
          }
        } catch (e) {
          console.warn('Logo base64 proxy failed:', e.message);
          // Keep the original logoUrl as fallback — @react-pdf/renderer may still load it
        }
      }
      const orgName = restaurantData?.name || orgData?.name || '';
      const dateRangeStr = `${startDate} to ${endDate}`;
      const { pdf: pdfFunc } = await import('@react-pdf/renderer');
      const { HQReportPDFDocument } = await import('./HQReportPDF');
      const blob = await pdfFunc(
        <HQReportPDFDocument
          reportType={activeReport}
          data={reportData}
          orgName={orgName}
          logoUrl={logoUrl}
          dateRange={dateRangeStr}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const exportType = getExportType(activeReport);
      link.download = `${exportType}-${startDate}-to-${endDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const renderActiveReport = () => {
    if (loading) return <LoadingState />;
    if (error) return (
      <div style={{ ...styles.emptyState, color: '#dc2626' }}>
        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Error</div>
        <div>{error}</div>
        <button
          onClick={() => loadReport(activeReport)}
          style={{ ...styles.backButton, marginTop: '16px', color: '#16a34a', borderColor: '#16a34a' }}
        >
          Retry
        </button>
      </div>
    );

    switch (activeReport) {
      case REPORT_TYPES.INVENTORY:
        return <InventoryComparisonView data={reportData} outlets={outlets} formatCurrency={formatCurrency} />;
      case REPORT_TYPES.PL:
        return <ConsolidatedPLView data={reportData} formatCurrency={formatCurrency} />;
      case REPORT_TYPES.KITCHEN:
        return <KitchenReportsView data={reportData} formatCurrency={formatCurrency} />;
      case REPORT_TYPES.WAREHOUSE:
        return <WarehouseMetricsView data={reportData} formatCurrency={formatCurrency} />;
      case REPORT_TYPES.INDENT:
        return <IndentTrackingView data={reportData} />;
      case REPORT_TYPES.MENU:
        return <MenuPerformanceView data={reportData} outlets={outlets} formatCurrency={formatCurrency} />;
      case REPORT_TYPES.RANKING:
        return <OutletRankingView data={reportData} formatCurrency={formatCurrency} />;
      case REPORT_TYPES.SALES:
        return <SalesSummaryView data={reportData} formatCurrency={formatCurrency} />;
      case REPORT_TYPES.STAFF:
        return <StaffPerformanceView data={reportData} formatCurrency={formatCurrency} />;
      case REPORT_TYPES.CATEGORY:
        return <CategorySalesView data={reportData} formatCurrency={formatCurrency} />;
      case REPORT_TYPES.DISCOUNT:
        return <DiscountReportView data={reportData} formatCurrency={formatCurrency} />;
      case REPORT_TYPES.TAX:
        return <TaxSummaryView data={reportData} formatCurrency={formatCurrency} />;
      case REPORT_TYPES.CUSTOMER:
        return <CustomerInsightsView data={reportData} formatCurrency={formatCurrency} />;
      case REPORT_TYPES.PAYMENT:
        return <PaymentAnalyticsView data={reportData} formatCurrency={formatCurrency} />;
      case REPORT_TYPES.ORDER_ANALYTICS:
        return <OrderAnalyticsView data={reportData} formatCurrency={formatCurrency} />;
      case REPORT_TYPES.REVENUE_TRENDS:
        return <RevenueTrendsView data={reportData} formatCurrency={formatCurrency} />;
      case REPORT_TYPES.WALLET_LOYALTY:
        return <WalletLoyaltyView data={reportData} formatCurrency={formatCurrency} />;
      case REPORT_TYPES.ITEM_SALES:
        return <ItemSalesView data={reportData} formatCurrency={formatCurrency} />;
      default:
        return <EmptyState message="Select a report to view." />;
    }
  };

  const activeCardInfo = reportCards.find((c) => c.key === activeReport);

  // ---- Render ----

  if (!activeReport) {
    // Report selection grid
    return (
      <div style={styles.container}>
        <SpinnerKeyframes />
        {/* Restaurant selector */}
        <div ref={restaurantPickerRef} style={{ position: 'relative', marginBottom: '12px' }}>
          <button
            onClick={() => setShowRestaurantPicker(!showRestaurantPicker)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 14px',
              backgroundColor: selectedRestaurants?.length > 0 ? '#f0fdf4' : '#f8fafc',
              borderRadius: '10px',
              border: `1px solid ${selectedRestaurants?.length > 0 ? '#bbf7d0' : '#e2e8f0'}`,
              cursor: 'pointer', fontSize: '13px', fontWeight: '500',
              color: selectedRestaurants?.length > 0 ? '#15803d' : '#6b7280',
              transition: 'all 0.15s',
            }}
          >
            <FaStore style={{ fontSize: '13px' }} />
            {selectedRestaurants?.length > 0
              ? selectedRestaurants.length === 1
                ? (allRestaurants?.find(r => r.id === selectedRestaurants[0])?.name || '1 restaurant')
                : `${selectedRestaurants.length} of ${allRestaurants?.length || '?'} restaurants`
              : `All restaurants (${allRestaurants?.length || 0})`}
            <FaChevronDown size={10} style={{ marginLeft: '4px', transform: showRestaurantPicker ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </button>
          {showRestaurantPicker && allRestaurants?.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, marginTop: '4px', zIndex: 50,
              backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)', minWidth: '280px', maxHeight: '320px',
              overflow: 'auto',
            }}>
              {/* Select All */}
              <div
                onClick={() => { setSelectedRestaurants([]); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6',
                  backgroundColor: !selectedRestaurants?.length ? '#f0fdf4' : 'white',
                  transition: 'background 0.1s',
                }}
              >
                <div style={{
                  width: '18px', height: '18px', borderRadius: '4px',
                  border: !selectedRestaurants?.length ? '2px solid #16a34a' : '2px solid #d1d5db',
                  backgroundColor: !selectedRestaurants?.length ? '#16a34a' : 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {!selectedRestaurants?.length && <FaCheck size={10} style={{ color: 'white' }} />}
                </div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>All Restaurants</span>
              </div>
              {/* Individual restaurants */}
              {allRestaurants.map(r => {
                const isSelected = selectedRestaurants?.includes(r.id);
                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      if (!setSelectedRestaurants) return;
                      if (isSelected) {
                        const next = selectedRestaurants.filter(id => id !== r.id);
                        setSelectedRestaurants(next);
                      } else {
                        setSelectedRestaurants([...(selectedRestaurants || []), r.id]);
                      }
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 14px', cursor: 'pointer',
                      backgroundColor: isSelected ? '#f0fdf4' : 'white',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'white'; }}
                  >
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '4px',
                      border: isSelected ? '2px solid #16a34a' : '2px solid #d1d5db',
                      backgroundColor: isSelected ? '#16a34a' : 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {isSelected && <FaCheck size={10} style={{ color: 'white' }} />}
                    </div>
                    <span style={{ fontSize: '13px', color: '#374151', fontWeight: isSelected ? '600' : '400' }}>{r.name}</span>
                  </div>
                );
              })}
              {/* Done button */}
              <div style={{ padding: '8px 14px', borderTop: '1px solid #f3f4f6' }}>
                <button
                  onClick={() => setShowRestaurantPicker(false)}
                  style={{
                    width: '100%', padding: '8px', borderRadius: '8px', border: 'none',
                    backgroundColor: '#16a34a', color: 'white', fontSize: '13px', fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <FaCalendarAlt style={{ color: '#6b7280', fontSize: '14px' }} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={styles.dateInput}
            />
            <span style={{ color: '#9ca3af', fontSize: '14px' }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={styles.dateInput}
            />
          </div>
          <div style={{ fontSize: '13px', color: '#9ca3af' }}>
            Date range applies to all reports below.
          </div>
        </div>

        <div style={styles.grid}>
          {reportCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                style={styles.reportCard(false)}
                onClick={() => handleSelectReport(card.key)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(22,163,74,0.12)';
                  e.currentTarget.style.borderColor = '#16a34a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
                  e.currentTarget.style.borderColor = '#f1f5f9';
                }}
              >
                <Icon style={styles.reportCardIcon(false)} />
                <span style={styles.reportCardLabel(false)}>{card.label}</span>
                {getPreviewText(card.key) && (
                  <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px', fontWeight: '500' }}>
                    {getPreviewText(card.key)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Active report view
  return (
    <div style={styles.container}>
      <SpinnerKeyframes />
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            style={styles.backButton}
            onClick={handleBack}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
          >
            <FaArrowLeft style={{ fontSize: '12px' }} />
            Back
          </button>
          {activeCardInfo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <activeCardInfo.icon style={{ fontSize: '20px', color: '#16a34a' }} />
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>{activeCardInfo.label}</span>
            </div>
          )}
        </div>

        <div style={styles.dateRow}>
          <FaCalendarAlt style={{ color: '#6b7280', fontSize: '14px' }} />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={styles.dateInput}
          />
          <span style={{ color: '#9ca3af', fontSize: '14px' }}>to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={styles.dateInput}
          />
          <button
            style={{ ...styles.backButton, color: '#16a34a', borderColor: '#bbf7d0', background: '#f0fdf4' }}
            onClick={handleDateChange}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#dcfce7'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f0fdf4'; }}
          >
            Apply
          </button>
        </div>
      </div>

      {/* Restaurant context indicator */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '10px', padding: '5px 12px', backgroundColor: selectedRestaurants?.length > 0 ? '#f0fdf4' : '#f8fafc', borderRadius: '8px', border: `1px solid ${selectedRestaurants?.length > 0 ? '#bbf7d0' : '#e2e8f0'}`, fontSize: '12px', color: selectedRestaurants?.length > 0 ? '#15803d' : '#6b7280', fontWeight: '500' }}>
        <FaStore style={{ fontSize: '11px' }} />
        {selectedRestaurants?.length > 0
          ? selectedRestaurants.length === 1
            ? (allRestaurants?.find(r => r.id === selectedRestaurants[0])?.name || '1 restaurant')
            : `${selectedRestaurants.length} of ${allRestaurants?.length || '?'} restaurants`
          : 'All restaurants'}
      </div>

      {/* Export Dropdown — above report card */}
      {!loading && !error && reportData && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button onClick={() => setShowExportMenu(!showExportMenu)} style={{ ...styles.exportBtn, opacity: exporting ? 0.7 : 1, pointerEvents: exporting ? 'none' : 'auto' }} disabled={exporting}>
              {exporting ? <FaSpinner style={{ animation: 'hqSpin 1s linear infinite' }} /> : <FaDownload />} {exporting ? 'Exporting...' : 'Export'} <FaChevronDown size={10} />
            </button>
            {showExportMenu && (
              <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, background: 'white', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: '1px solid #e5e7eb', minWidth: 160, zIndex: 50, overflow: 'hidden' }}>
                <button onClick={() => { handleExportCSV(); setShowExportMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', width: '100%', border: 'none', background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', transition: 'background 0.1s' }} onMouseEnter={e => e.target.style.background='#f9fafb'} onMouseLeave={e => e.target.style.background='white'}>
                  <FaFileCsv color="#16a34a" /> CSV
                </button>
                <button onClick={() => { handleExportExcel(); setShowExportMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', width: '100%', border: 'none', background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', borderTop: '1px solid #f3f4f6' }} onMouseEnter={e => e.target.style.background='#f9fafb'} onMouseLeave={e => e.target.style.background='white'}>
                  <FaFileExcel color="#16a34a" /> Excel (.xlsx)
                </button>
                <button onClick={() => { handleExportPDF(); setShowExportMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', width: '100%', border: 'none', background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', borderTop: '1px solid #f3f4f6' }} onMouseEnter={e => e.target.style.background='#f9fafb'} onMouseLeave={e => e.target.style.background='white'}>
                  <FaFilePdf color="#dc2626" /> PDF
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={styles.card}>
        {renderActiveReport()}
      </div>
    </div>
  );
}
