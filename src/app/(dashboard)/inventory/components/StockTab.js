'use client';

import { FaSearch, FaPlus, FaEdit, FaTrash, FaSortAmountDown, FaSortAmountUp, FaBoxes, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

export default function StockTab({
  sortedItems, categories, searchTerm, setSearchTerm, selectedCategory, setSelectedCategory,
  sortBy, setSortBy, sortOrder, setSortOrder,
  isMobile, formatCurrency,
  setShowAddModal, handleEditItem, handleDeleteItem,
  getStatusColor, dashboardStats, inventoryItems,
}) {
  const getStockBarColor = (current, min, max) => {
    const ratio = max > 0 ? current / max : 0;
    if (current <= min || ratio < 0.2) return '#ef4444';
    if (ratio < 0.5) return '#f59e0b';
    return '#059669';
  };

  const getStockBarWidth = (current, max) => {
    if (!max || max <= 0) return 0;
    return Math.min((current / max) * 100, 100);
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
            return (
              <div key={item._id || item.id} style={{
                background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb',
                padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: getStatusColor?.(item.status) || barColor,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </span>
                    <span style={{
                      fontSize: 11, background: '#f3f4f6', color: '#6b7280',
                      padding: '1px 6px', borderRadius: 4, flexShrink: 0,
                    }}>
                      {item.category}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${barWidth}%`, height: '100%', background: barColor, borderRadius: 3, transition: 'width 0.3s' }} />
                    </div>
                    <span style={{ fontSize: 12, color: '#374151', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {item.currentStock} {item.unit}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => handleEditItem(item)} style={{
                    padding: 6, border: '1px solid #e5e7eb', borderRadius: 6,
                    background: '#fff', cursor: 'pointer', display: 'flex',
                  }}>
                    <FaEdit size={13} color="#6b7280" />
                  </button>
                  <button onClick={() => handleDeleteItem(item._id || item.id)} style={{
                    padding: 6, border: '1px solid #fee2e2', borderRadius: 6,
                    background: '#fff', cursor: 'pointer', display: 'flex',
                  }}>
                    <FaTrash size={12} color="#ef4444" />
                  </button>
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
                <th style={{ ...thStyle, textAlign: 'left', minWidth: 160 }}>Stock</th>
                <th style={thStyle}>Min / Max</th>
                <th style={thStyle}>Cost</th>
                <th style={{ ...thStyle, textAlign: 'left' }}>Supplier</th>
                <th style={{ ...thStyle, width: 90 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item, idx) => {
                const barColor = getStockBarColor(item.currentStock, item.minStock, item.maxStock);
                const barWidth = getStockBarWidth(item.currentStock, item.maxStock);
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
                      }} />
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: '#111827' }}>{item.name}</td>
                    <td style={tdStyle}>
                      <span style={{
                        fontSize: 12, background: '#f3f4f6', color: '#374151',
                        padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap',
                      }}>
                        {item.category}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 7, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{
                            width: `${barWidth}%`, height: '100%', background: barColor,
                            borderRadius: 4, transition: 'width 0.3s',
                          }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap', minWidth: 50 }}>
                          {item.currentStock} {item.unit}
                        </span>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
                      {item.minStock} / {item.maxStock}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center', color: '#374151', fontWeight: 500 }}>
                      {formatCurrency(item.costPerUnit)}
                    </td>
                    <td style={{ ...tdStyle, color: '#6b7280', fontSize: 13 }}>
                      {item.supplier || '\u2014'}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <button onClick={() => handleEditItem(item)} style={actionBtnStyle} title="Edit">
                          <FaEdit size={13} color="#6b7280" />
                        </button>
                        <button onClick={() => handleDeleteItem(item._id || item.id)}
                          style={{ ...actionBtnStyle, borderColor: '#fee2e2' }} title="Delete"
                        >
                          <FaTrash size={12} color="#ef4444" />
                        </button>
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
