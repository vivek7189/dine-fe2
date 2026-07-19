'use client';

import { FaSearch, FaPlus, FaEdit, FaTrash, FaSortAmountDown, FaSortAmountUp, FaBoxes, FaExclamationTriangle, FaCheckCircle, FaFireAlt, FaClock, FaFileCsv, FaFileExcel } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import { exportInventoryCSV, exportInventoryExcel } from '../utils/inventoryExport';
const InventoryDownloadPDFButton = dynamic(() => import('./pdf/InventoryDownloadPDFButton'), { ssr: false });

export default function StockTab({
  sortedItems, categories, searchTerm, setSearchTerm, selectedCategory, setSelectedCategory,
  sortBy, setSortBy, sortOrder, setSortOrder,
  isMobile, formatCurrency,
  setShowAddModal, handleEditItem, handleDeleteItem,
  getStatusColor, dashboardStats, inventoryItems, todayUsageSummary = [],
  onViewHistory,
  permissions = { read: true, add: true, update: true, delete: true },
  currentRestaurant,
}) {
  const getStockBarColor = (current, min, max) => {
    const ratio = max > 0 ? current / max : 0;
    if (current <= min || ratio < 0.2) return '#ef4444';
    if (ratio < 0.5) return '#f59e0b';
    return '#10b981';
  };

  const getStockBarWidth = (current, max) => {
    if (!max || max <= 0) return 0;
    return Math.min((current / max) * 100, 100);
  };

  // Build today's usage lookup by item ID/name
  const todayUsageMap = {};
  todayUsageSummary.forEach(u => {
    const key = u.itemId || u.inventoryItemId || u.inventoryItemName;
    if (key) todayUsageMap[key] = u;
  });

  const getItemTodayUsage = (item) => {
    return todayUsageMap[item._id] || todayUsageMap[item.id] || todayUsageMap[item.name] || null;
  };

  const lowStockCount = dashboardStats?.lowStockItems ?? inventoryItems?.filter(i => i.currentStock <= i.minStock).length ?? 0;
  const totalValue = dashboardStats?.totalValue ?? 0;
  const totalItems = dashboardStats?.totalItems ?? inventoryItems?.length ?? 0;
  const categoryCount = dashboardStats?.categories ?? categories?.length ?? 0;

  return (
    <div>
      {/* Compact Stats Row */}
      <div style={{
        display: 'flex', gap: '1px', background: '#e5e7eb', borderRadius: 10,
        overflow: 'hidden', marginBottom: 16,
      }}>
        {[
          { label: 'Total Items', value: totalItems, icon: <FaBoxes size={14} color="#059669" /> },
          { label: 'Low Stock', value: lowStockCount, icon: <FaExclamationTriangle size={14} color={lowStockCount > 0 ? '#ef4444' : '#059669'} /> },
          { label: 'Value', value: formatCurrency(totalValue), icon: <FaCheckCircle size={14} color="#059669" /> },
          { label: 'Categories', value: categoryCount, icon: <FaBoxes size={14} color="#059669" /> },
        ].map((stat, i) => (
          <div key={i} style={{
            flex: 1, background: '#fff', padding: isMobile ? '10px 8px' : '12px 16px',
            display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
          }}>
            {stat.icon}
            <div>
              <div style={{ fontSize: isMobile ? 15 : 18, fontWeight: 700, color: '#111827' }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, alignItems: 'center',
      }}>
        <div style={{ position: 'relative', flex: isMobile ? '1 1 100%' : '1 1 220px', maxWidth: isMobile ? '100%' : 300 }}>
          <FaSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px 8px 32px', border: '1px solid #d1d5db',
              borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff',
            }}
            onFocus={e => e.target.style.borderColor = '#059669'}
            onBlur={e => e.target.style.borderColor = '#d1d5db'}
          />
        </div>

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          style={{
            padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8,
            fontSize: 14, background: '#fff', outline: 'none', cursor: 'pointer',
            flex: isMobile ? '1 1 45%' : '0 0 auto',
          }}
        >
          <option value="all">All Categories</option>
          {categories?.map(cat => <option key={cat.id || cat} value={cat.id || cat}>{cat.name || cat}</option>)}
        </select>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{
            padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8,
            fontSize: 14, background: '#fff', outline: 'none', cursor: 'pointer',
            flex: isMobile ? '1 1 35%' : '0 0 auto',
          }}
        >
          <option value="name">Name</option>
          <option value="currentStock">Stock</option>
          <option value="category">Category</option>
          <option value="costPerUnit">Cost</option>
        </select>

        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          style={{
            padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8,
            background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
          }}
          title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        >
          {sortOrder === 'asc' ? <FaSortAmountUp size={14} color="#6b7280" /> : <FaSortAmountDown size={14} color="#6b7280" />}
        </button>

        {permissions.add && (
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '8px 16px', background: '#059669', color: '#fff', border: 'none',
              borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, marginLeft: isMobile ? 0 : 'auto',
              flex: isMobile ? '1 1 100%' : '0 0 auto', justifyContent: 'center',
            }}
          >
            <FaPlus size={12} /> Add Item
          </button>
        )}

        <button
          type="button"
          onClick={() => exportInventoryCSV(sortedItems, currentRestaurant?.name)}
          title="Download inventory as CSV"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          <FaFileCsv size={13} color="#10b981" /> CSV
        </button>
        <button
          type="button"
          onClick={() => exportInventoryExcel(sortedItems, currentRestaurant?.name)}
          title="Download inventory as Excel"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          <FaFileExcel size={13} color="#217346" /> Excel
        </button>

        <InventoryDownloadPDFButton
          reportType="stock"
          data={{ items: sortedItems, stats: dashboardStats }}
          org={{ name: currentRestaurant?.name || '' }}
          logoUrl={currentRestaurant?.printSettings?.receiptLogo?.url || null}
          filename="stock-report.pdf"
        />
      </div>

      {/* Table / List */}
      {sortedItems?.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px', background: '#fff',
          borderRadius: 12, border: '1px solid #e5e7eb',
        }}>
          <FaBoxes size={48} color="#d1d5db" />
          <h3 style={{ margin: '16px 0 8px', color: '#374151', fontSize: 18 }}>No inventory items found</h3>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
            {searchTerm || selectedCategory !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Get started by adding your first inventory item.'}
          </p>
          {!searchTerm && selectedCategory === 'all' && (
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                padding: '10px 24px', background: '#059669', color: '#fff', border: 'none',
                borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              <FaPlus size={12} /> Add Your First Item
            </button>
          )}
        </div>
      ) : isMobile ? (
        /* Mobile List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sortedItems.map(item => {
            const barColor = getStockBarColor(item.currentStock, item.minStock, item.maxStock);
            const barWidth = getStockBarWidth(item.currentStock, item.maxStock);
            const usage = getItemTodayUsage(item);
            const consumed = usage?.totalQuantityConsumed || 0;
            return (
              <div key={item._id || item.id} style={{
                background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb',
                padding: '12px 14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: getStatusColor?.(item.status) || barColor,
                  }} />
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </span>
                    <span style={{
                      fontSize: 11, background: '#f3f4f6', color: '#6b7280',
                      padding: '1px 6px', borderRadius: 4, flexShrink: 0,
                    }}>
                      {item.category}
                    </span>
                    {item.linkedMenuItemId && (
                      <span style={{
                        fontSize: 10, background: '#eff6ff', color: '#2563eb',
                        padding: '1px 6px', borderRadius: 4, flexShrink: 0, fontWeight: 600,
                      }}>
                        🔗 Menu
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => onViewHistory?.(item)} style={{
                      padding: 6, border: '1px solid #dbeafe', borderRadius: 6,
                      background: '#fff', cursor: 'pointer', display: 'flex',
                    }} title="History">
                      <FaClock size={13} color="#4f46e5" />
                    </button>
                    {permissions.update && (
                      <button onClick={() => handleEditItem(item)} style={{
                        padding: 6, border: '1px solid #e5e7eb', borderRadius: 6,
                        background: '#fff', cursor: 'pointer', display: 'flex',
                      }}>
                        <FaEdit size={13} color="#6b7280" />
                      </button>
                    )}
                    {permissions.delete && (
                      <button onClick={() => handleDeleteItem(item._id || item.id)} style={{
                        padding: 6, border: '1px solid #fee2e2', borderRadius: 6,
                        background: '#fff', cursor: 'pointer', display: 'flex',
                      }}>
                        <FaTrash size={12} color="#ef4444" />
                      </button>
                    )}
                  </div>
                </div>
                {/* Stock bar with labels */}
                <div style={{ marginLeft: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: barColor }}>
                      {item.currentStock} {item.unit}
                    </span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>of {item.maxStock} {item.unit}</span>
                  </div>
                  <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                    <div style={{
                      width: `${barWidth}%`, height: '100%',
                      background: `linear-gradient(90deg, ${barColor}dd, ${barColor})`,
                      borderRadius: 4, transition: 'width 0.3s',
                    }} />
                  </div>
                  {consumed > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <FaFireAlt size={10} color="#f59e0b" />
                      <span style={{ fontSize: 11, color: '#92400e', fontWeight: 500 }}>
                        {consumed} {item.unit} used today
                      </span>
                    </div>
                  )}
                  {item.wastedQty > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <FaExclamationTriangle size={10} color="#ea580c" />
                      <span style={{ fontSize: 11, color: '#ea580c', fontWeight: 500 }}>
                        {item.wastedQty} {item.unit} wasted today{item.wastedValue > 0 ? ` · ${formatCurrency(item.wastedValue)}` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Desktop Table */
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ ...thStyle, width: 36 }}></th>
                <th style={{ ...thStyle, textAlign: 'left' }}>Name</th>
                <th style={{ ...thStyle, textAlign: 'left' }}>Category</th>
                <th style={{ ...thStyle, textAlign: 'left', minWidth: 220 }}>Stock Level</th>
                <th style={thStyle}>Min / Max</th>
                <th style={thStyle}>Today&apos;s Usage</th>
                <th style={thStyle}>Today&apos;s Waste</th>
                <th style={thStyle}>Cost</th>
                <th style={{ ...thStyle, textAlign: 'left' }}>Supplier</th>
                <th style={{ ...thStyle, width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item, idx) => {
                const barColor = getStockBarColor(item.currentStock, item.minStock, item.maxStock);
                const barWidth = getStockBarWidth(item.currentStock, item.maxStock);
                const usage = getItemTodayUsage(item);
                const consumed = usage?.totalQuantityConsumed || 0;
                const stockPercent = item.maxStock > 0 ? Math.round((item.currentStock / item.maxStock) * 100) : 0;

                return (
                  <tr key={item._id || item.id} style={{
                    borderBottom: idx < sortedItems.length - 1 ? '1px solid #f3f4f6' : 'none',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={tdStyle}>
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%', margin: '0 auto',
                        background: getStatusColor?.(item.status) || barColor,
                        boxShadow: `0 0 0 3px ${(getStatusColor?.(item.status) || barColor)}22`,
                      }} />
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: '#111827' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {item.name}
                        {item.linkedMenuItemId && (
                          <span style={{
                            fontSize: 10, background: '#eff6ff', color: '#2563eb',
                            padding: '1px 6px', borderRadius: 4, fontWeight: 600, whiteSpace: 'nowrap',
                          }}>
                            🔗 Menu
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        fontSize: 12, background: '#f3f4f6', color: '#374151',
                        padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap',
                      }}>
                        {item.category}
                      </span>
                    </td>
                    {/* Enhanced Stock Column */}
                    <td style={tdStyle}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: barColor }}>
                            {item.currentStock} {item.unit}
                          </span>
                          <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>
                            {stockPercent}%
                          </span>
                        </div>
                        <div style={{
                          height: 8, background: '#f3f4f6', borderRadius: 4,
                          overflow: 'hidden', position: 'relative',
                        }}>
                          <div style={{
                            width: `${barWidth}%`, height: '100%',
                            background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
                            borderRadius: 4, transition: 'width 0.4s ease',
                          }} />
                        </div>
                        <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>
                          capacity: {item.maxStock} {item.unit}
                        </div>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
                      {item.minStock} / {item.maxStock}
                    </td>
                    {/* Today's Usage Column */}
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      {consumed > 0 ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
                          background: '#fef3c7', padding: '3px 10px', borderRadius: 12,
                        }}>
                          <FaFireAlt size={10} color="#d97706" />
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>
                            {consumed} {item.unit}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: '#d1d5db' }}>—</span>
                      )}
                    </td>
                    {/* Wasted Column (dynamic days) */}
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      {item.wastedQty > 0 ? (
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#ea580c' }}>
                            {item.wastedQty} {item.unit}
                          </div>
                          {item.wastedValue > 0 && (
                            <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>
                              {formatCurrency(item.wastedValue)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: '#d1d5db' }}>—</span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center', color: '#374151', fontWeight: 500 }}>
                      {formatCurrency(item.costPerUnit)}
                    </td>
                    <td style={{ ...tdStyle, color: '#6b7280', fontSize: 13 }}>
                      {item.supplier || '\u2014'}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <button onClick={() => onViewHistory?.(item)}
                          style={{ ...actionBtnStyle, borderColor: '#dbeafe' }} title="History"
                        >
                          <FaClock size={13} color="#4f46e5" />
                        </button>
                        {permissions.update && (
                          <button onClick={() => handleEditItem(item)} style={actionBtnStyle} title="Edit">
                            <FaEdit size={13} color="#6b7280" />
                          </button>
                        )}
                        {permissions.delete && (
                          <button onClick={() => handleDeleteItem(item._id || item.id)}
                            style={{ ...actionBtnStyle, borderColor: '#fee2e2' }} title="Delete"
                          >
                            <FaTrash size={12} color="#ef4444" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle = {
  padding: '10px 12px', fontSize: 12, fontWeight: 600,
  color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em',
  textAlign: 'center', whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: '10px 12px', verticalAlign: 'middle',
};

const actionBtnStyle = {
  padding: 6, border: '1px solid #e5e7eb', borderRadius: 6,
  background: '#fff', cursor: 'pointer', display: 'inline-flex',
  alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s',
};
