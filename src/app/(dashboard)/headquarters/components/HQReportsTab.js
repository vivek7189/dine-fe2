'use client';

import { useState, useEffect, useCallback } from 'react';
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

  const summary = data.summary || {};
  const outletBreakdown = (data.outlets || []).sort((a, b) => (b.revenue || 0) - (a.revenue || 0));

  return (
    <>
      <div style={styles.summaryGrid}>
        <SummaryCard label="Total Revenue" value={formatCurrency(summary.totalRevenue || 0)} color="#16a34a" />
        <SummaryCard label="Total Expenses" value={formatCurrency(summary.totalExpenses || 0)} color="#dc2626" />
        <SummaryCard label="Gross Profit" value={formatCurrency(summary.grossProfit || 0)} color="#3b82f6" />
      </div>
      {outletBreakdown.length > 0 && (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Outlet</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Revenue</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Expenses</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Profit</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Orders</th>
              </tr>
            </thead>
            <tbody>
              {outletBreakdown.map((row, idx) => (
                <tr key={row.outletId || idx}>
                  <td style={styles.td(idx % 2 === 0)}>
                    <span style={{ fontWeight: '600' }}>{row.name || row.outletName || '-'}</span>
                  </td>
                  <td style={{ ...styles.td(idx % 2 === 0), textAlign: 'right', fontWeight: '600', color: '#16a34a' }}>
                    {formatCurrency(row.revenue || 0)}
                  </td>
                  <td style={{ ...styles.td(idx % 2 === 0), textAlign: 'right', color: '#dc2626' }}>
                    {formatCurrency(row.expenses || 0)}
                  </td>
                  <td style={{ ...styles.td(idx % 2 === 0), textAlign: 'right', fontWeight: '600', color: (row.profit || 0) >= 0 ? '#16a34a' : '#dc2626' }}>
                    {formatCurrency(row.profit || 0)}
                  </td>
                  <td style={{ ...styles.td(idx % 2 === 0), textAlign: 'right' }}>
                    {(row.orderCount || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
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

  return (
    <div style={styles.tableWrap}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Item</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Total Sales</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Total Revenue</th>
            {outletList.map((o) => (
              <th key={o.id || o._id} style={{ ...styles.th, textAlign: 'right' }}>{o.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, idx) => (
            <tr key={item.itemId || idx}>
              <td style={styles.td(idx % 2 === 0)}><span style={{ fontWeight: '600' }}>{item.name || '-'}</span></td>
              <td style={{ ...styles.td(idx % 2 === 0), textAlign: 'right', fontWeight: '600' }}>
                {(item.totalSales || 0).toLocaleString()}
              </td>
              <td style={{ ...styles.td(idx % 2 === 0), textAlign: 'right', fontWeight: '600', color: '#16a34a' }}>
                {formatCurrency(item.totalRevenue || 0)}
              </td>
              {outletList.map((o) => {
                const outletData = item.perOutlet?.[o.id || o._id] || {};
                return (
                  <td key={o.id || o._id} style={{ ...styles.td(idx % 2 === 0), textAlign: 'right', fontSize: '13px' }}>
                    <div>{(outletData.sales || 0).toLocaleString()} sold</div>
                    <div style={{ color: '#6b7280' }}>{formatCurrency(outletData.revenue || 0)}</div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
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
  const { staffRankings, totalStaff } = data;
  const topPerformer = staffRankings[0];
  const totalTips = staffRankings.reduce((s, st) => s + (st.tipsEarned || 0), 0);

  return (
    <div>
      <div style={styles.summaryGrid}>
        <div style={styles.statCard('#3b82f6')}><div style={styles.statValue('#3b82f6')}>{totalStaff}</div><div style={styles.statLabel}>Total Staff</div></div>
        <div style={styles.statCard('#16a34a')}><div style={styles.statValue('#16a34a')}>{topPerformer?.staffName || '-'}</div><div style={styles.statLabel}>Top Performer</div></div>
        <div style={styles.statCard('#8b5cf6')}><div style={styles.statValue('#8b5cf6')}>{formatCurrency(topPerformer?.totalSales || 0)}</div><div style={styles.statLabel}>Highest Sales</div></div>
        <div style={styles.statCard('#d97706')}><div style={styles.statValue('#d97706')}>{formatCurrency(totalTips)}</div><div style={styles.statLabel}>Total Tips</div></div>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead><tr>
            <th style={{ ...styles.th, textAlign: 'center', width: '60px' }}>Rank</th>
            <th style={styles.th}>Staff Name</th>
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

// ---- Main Component ----

export default function HQReportsTab({ orgData, outlets, formatCurrency }) {
  const [activeReport, setActiveReport] = useState(null);
  const [startDate, setStartDate] = useState(getDefaultStartDate);
  const [endDate, setEndDate] = useState(getDefaultEndDate);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

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
      const dateParams = { startDate, endDate };

      switch (reportKey) {
        case REPORT_TYPES.INVENTORY:
          result = await apiClient.getInventoryComparison(orgId);
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
          result = await apiClient.getIndentTracking(orgId);
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
  }, [orgId, startDate, endDate]);

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

  const handleExport = async () => {
    if (!orgId || !activeReport) return;
    setExporting(true);
    try {
      const response = await apiClient.exportHQReport(orgId, getExportType(activeReport), { startDate, endDate });
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

      <div style={styles.card}>
        {renderActiveReport()}
      </div>

      {!loading && !error && reportData && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <ExportButton onExport={handleExport} exporting={exporting} />
        </div>
      )}
    </div>
  );
}
