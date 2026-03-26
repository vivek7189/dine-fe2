'use client';

import { FaHistory, FaArrowDown, FaSearch, FaCalendarAlt, FaBoxOpen } from 'react-icons/fa';

const periodOptions = [
  { id: 'today', label: 'Today' },
  { id: '7days', label: '7 Days' },
  { id: '30days', label: '30 Days' },
  { id: 'custom', label: 'Custom' },
];

const getSourceBadge = (source) => {
  const map = {
    order: { bg: '#ecfdf5', color: '#059669', label: 'Order' },
    manual: { bg: '#eff6ff', color: '#3b82f6', label: 'Manual' },
    waste: { bg: '#fef2f2', color: '#ef4444', label: 'Waste' },
    transfer: { bg: '#f5f3ff', color: '#8b5cf6', label: 'Transfer' },
    adjustment: { bg: '#fffbeb', color: '#d97706', label: 'Adjustment' },
    recipe: { bg: '#ecfdf5', color: '#047857', label: 'Recipe' },
    restock: { bg: '#f0fdf4', color: '#16a34a', label: 'Restock' },
  };
  return map[source] || { bg: '#f3f4f6', color: '#6b7280', label: source || 'Unknown' };
};

export default function UsageTab({
  usageTransactions, usageSummary, usagePeriod, setUsagePeriod,
  usageStartDate, setUsageStartDate, usageEndDate, setUsageEndDate,
  loadUsageData, loadingUsage, isMobile, formatCurrency,
}) {
  const handlePeriodChange = (period) => {
    setUsagePeriod(period);
    if (period !== 'custom') {
      loadUsageData(period);
    }
  };

  const handleApplyCustom = () => {
    if (usageStartDate && usageEndDate) {
      loadUsageData('custom');
    }
  };

  if (loadingUsage) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '44px', height: '44px', border: '4px solid #e5e7eb', borderTop: '4px solid #059669',
            borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px',
          }} />
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading usage data...</p>
        </div>
      </div>
    );
  }

  const hasData = (usageTransactions && usageTransactions.length > 0) || (usageSummary && usageSummary.length > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Period Filter Bar */}
      <div style={{
        backgroundColor: 'white', borderRadius: '14px', padding: isMobile ? '14px' : '18px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
        }}>
          <FaCalendarAlt size={14} style={{ color: '#059669', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginRight: '4px' }}>Period:</span>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {periodOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handlePeriodChange(opt.id)}
                style={{
                  padding: '6px 14px', borderRadius: '8px', border: 'none',
                  backgroundColor: usagePeriod === opt.id ? '#059669' : '#f3f4f6',
                  color: usagePeriod === opt.id ? 'white' : '#4b5563',
                  fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {usagePeriod === 'custom' && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginLeft: isMobile ? 0 : '8px', marginTop: isMobile ? '8px' : 0 }}>
              <input
                type="date"
                value={usageStartDate}
                onChange={(e) => setUsageStartDate(e.target.value)}
                style={{
                  padding: '6px 10px', borderRadius: '8px', border: '1px solid #d1d5db',
                  fontSize: '12px', color: '#374151', outline: 'none',
                }}
              />
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>to</span>
              <input
                type="date"
                value={usageEndDate}
                onChange={(e) => setUsageEndDate(e.target.value)}
                style={{
                  padding: '6px 10px', borderRadius: '8px', border: '1px solid #d1d5db',
                  fontSize: '12px', color: '#374151', outline: 'none',
                }}
              />
              <button
                onClick={handleApplyCustom}
                style={{
                  padding: '6px 14px', borderRadius: '8px', border: 'none',
                  backgroundColor: '#059669', color: 'white',
                  fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                }}
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {!hasData ? (
        /* Empty State */
        <div style={{
          backgroundColor: 'white', borderRadius: '14px', padding: '60px 20px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
          textAlign: 'center',
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #059669, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <FaBoxOpen size={24} color="white" />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', margin: '0 0 6px' }}>
            No usage data yet
          </h3>
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0, maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto' }}>
            Usage data will appear here as inventory is consumed through orders, recipes, and manual adjustments.
          </p>
        </div>
      ) : (
        <>
          {/* Top Consumed Ingredients */}
          {usageSummary && usageSummary.length > 0 && (
            <div style={{
              backgroundColor: 'white', borderRadius: '14px', padding: isMobile ? '16px' : '20px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
            }}>
              <div style={{
                fontSize: '15px', fontWeight: '700', color: '#1f2937', margin: '0 0 14px 0',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <FaArrowDown size={14} style={{ color: '#059669' }} />
                Top Consumed Ingredients
                <span style={{
                  fontSize: '11px', fontWeight: '700', color: 'white',
                  backgroundColor: '#059669', padding: '2px 8px', borderRadius: '99px',
                }}>
                  {usageSummary.length}
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: '10px',
              }}>
                {usageSummary.map((item, idx) => (
                  <div key={item.itemId || item.name || idx} style={{
                    padding: '14px 16px', borderRadius: '12px',
                    backgroundColor: '#fafafa', border: '1px solid #f3f4f6',
                    borderLeft: '4px solid #059669',
                    display: 'flex', flexDirection: 'column', gap: '6px',
                  }}>
                    <div style={{
                      fontWeight: '700', fontSize: '14px', color: '#1f2937',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {item.inventoryItemName || item.name || 'Unknown Item'}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        <span style={{ fontWeight: '600', color: '#059669' }}>
                          {item.totalQuantityConsumed ?? item.totalQuantity ?? 0}
                        </span>
                        {' '}{item.unit || 'units'} consumed
                      </div>
                      {(item.totalCostConsumed != null || item.totalCost != null) && (
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          Cost: <span style={{ fontWeight: '600', color: '#1f2937' }}>
                            {formatCurrency(item.totalCostConsumed ?? item.totalCost ?? 0)}
                          </span>
                        </div>
                      )}
                      {(item.transactionCount != null) && (
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          Orders: <span style={{ fontWeight: '600', color: '#1f2937' }}>
                            {item.transactionCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transaction Log */}
          {usageTransactions && usageTransactions.length > 0 && (
            <div style={{
              backgroundColor: 'white', borderRadius: '14px', padding: isMobile ? '16px' : '20px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
            }}>
              <div style={{
                fontSize: '15px', fontWeight: '700', color: '#1f2937', margin: '0 0 14px 0',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <FaHistory size={14} style={{ color: '#059669' }} />
                Transaction Log
                <span style={{
                  fontSize: '11px', fontWeight: '700', color: 'white',
                  backgroundColor: '#059669', padding: '2px 8px', borderRadius: '99px',
                }}>
                  {usageTransactions.length}
                </span>
              </div>

              {isMobile ? (
                /* Mobile: card layout */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {usageTransactions.map((tx, idx) => {
                    const badge = getSourceBadge(tx.source || tx.type);
                    const qtyChange = tx.quantityChange ?? tx.quantity ?? 0;
                    const isNegative = qtyChange < 0;
                    return (
                      <div key={tx.id || idx} style={{
                        padding: '12px 14px', borderRadius: '10px',
                        backgroundColor: '#fafafa', border: '1px solid #f3f4f6',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontWeight: '600', fontSize: '13px', color: '#1f2937' }}>
                            {tx.inventoryItemName || tx.itemName || 'Unknown'}
                          </span>
                          <span style={{
                            fontWeight: '700', fontSize: '13px',
                            color: isNegative ? '#ef4444' : '#059669',
                          }}>
                            {isNegative ? '' : '+'}{qtyChange} {tx.unit || ''}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                            {tx.createdAt || tx.date
                              ? new Date(tx.createdAt || tx.date).toLocaleString(undefined, {
                                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                })
                              : '--'}
                          </span>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span style={{
                              padding: '2px 8px', borderRadius: '99px', fontSize: '10px',
                              fontWeight: '700', backgroundColor: badge.bg, color: badge.color,
                            }}>
                              {badge.label}
                            </span>
                            {(tx.orderRef || tx.reference) && (
                              <span style={{ fontSize: '10px', color: '#6b7280' }}>
                                {tx.referenceId || tx.orderRef}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Desktop: table layout */
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                        {['Date & Time', 'Ingredient', 'Qty Change', 'Unit', 'Source', 'Order Ref'].map((h) => (
                          <th key={h} style={{
                            padding: '10px 12px', textAlign: 'left', fontSize: '11px',
                            fontWeight: '600', color: '#6b7280', textTransform: 'uppercase',
                            letterSpacing: '0.03em', whiteSpace: 'nowrap',
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {usageTransactions.map((tx, idx) => {
                        const badge = getSourceBadge(tx.source || tx.type);
                        const qtyChange = tx.quantityChange ?? tx.quantity ?? 0;
                        const isNegative = qtyChange < 0;
                        return (
                          <tr key={tx.id || idx} style={{
                            borderBottom: '1px solid #f3f4f6',
                            transition: 'background-color 0.1s',
                          }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <td style={{ padding: '10px 12px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                              {tx.createdAt || tx.date
                                ? new Date(tx.createdAt || tx.date).toLocaleString(undefined, {
                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                  })
                                : '--'}
                            </td>
                            <td style={{ padding: '10px 12px', fontWeight: '600', color: '#1f2937' }}>
                              {tx.inventoryItemName || tx.itemName || 'Unknown'}
                            </td>
                            <td style={{
                              padding: '10px 12px', fontWeight: '700',
                              color: isNegative ? '#ef4444' : '#059669',
                            }}>
                              {isNegative ? '' : '+'}{qtyChange}
                            </td>
                            <td style={{ padding: '10px 12px', color: '#6b7280' }}>
                              {tx.unit || '--'}
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{
                                padding: '3px 10px', borderRadius: '99px', fontSize: '10px',
                                fontWeight: '700', backgroundColor: badge.bg, color: badge.color,
                                textTransform: 'uppercase', letterSpacing: '0.03em',
                              }}>
                                {badge.label}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px', color: '#6b7280', fontSize: '12px' }}>
                              {tx.referenceId || tx.orderRef || '--'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
