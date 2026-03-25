'use client';

import { FaRobot, FaChartLine, FaExclamationTriangle, FaRecycle, FaDownload, FaTimes, FaBoxes, FaClock, FaWarehouse, FaClipboardList } from 'react-icons/fa';

const urgencyColors = {
  high: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
  medium: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
  low: { bg: '#ecfdf5', text: '#065f46', border: '#10b981' },
};

const riskColors = {
  critical: { bg: '#fee2e2', text: '#991b1b', border: '#dc2626' },
  high: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
  medium: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
  low: { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
};

const reportButtons = [
  { type: 'low-stock', icon: FaExclamationTriangle, title: 'Low Stock', desc: 'Items below minimum levels', bg: '#fef3c7', color: '#92400e' },
  { type: 'expired', icon: FaClock, title: 'Expired Items', desc: 'Past or near expiry date', bg: '#fee2e2', color: '#dc2626' },
  { type: 'value', icon: FaChartLine, title: 'Inventory Value', desc: 'Total stock valuation', bg: '#dbeafe', color: '#1d4ed8' },
  { type: 'supplier', icon: FaWarehouse, title: 'Supplier Report', desc: 'Supplier performance data', bg: '#e0e7ff', color: '#3730a3' },
];

export default function InsightsTab({
  aiReorderSuggestions = [],
  wastePredictions = [],
  wasteSummary,
  inventoryItems = [],
  suppliers = [],
  isMobile,
  formatCurrency,
  generateReport,
  reportData,
  setReportData,
}) {
  const totalAtRisk = wasteSummary?.totalItemsAtRisk || wastePredictions.length;
  const estimatedLoss = wasteSummary?.totalEstimatedLoss || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* AI Summary Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #059669 0%, #6366f1 100%)',
        borderRadius: '16px',
        padding: isMobile ? '20px' : '28px 32px',
        color: 'white',
        display: 'flex',
        alignItems: isMobile ? 'flex-start' : 'center',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '16px',
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <FaRobot size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '700' }}>
            AI Inventory Insights
          </h2>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
            {wasteSummary
              ? `${totalAtRisk} item${totalAtRisk !== 1 ? 's' : ''} at risk with an estimated loss of ${formatCurrency(estimatedLoss)}. ${aiReorderSuggestions.length} reorder suggestion${aiReorderSuggestions.length !== 1 ? 's' : ''} available.`
              : `${aiReorderSuggestions.length} reorder suggestion${aiReorderSuggestions.length !== 1 ? 's' : ''} and ${wastePredictions.length} waste prediction${wastePredictions.length !== 1 ? 's' : ''} ready for review.`}
          </p>
        </div>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '12px',
          padding: '12px 20px', textAlign: 'center', flexShrink: 0,
        }}>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>{aiReorderSuggestions.length + wastePredictions.length}</p>
          <p style={{ margin: 0, fontSize: '11px', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Action Items</p>
        </div>
      </div>

      {/* Reorder Suggestions */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <FaBoxes size={18} color="#6366f1" />
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
            Reorder Suggestions
          </h3>
          <span style={{
            backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: '12px',
            fontWeight: '600', padding: '2px 10px', borderRadius: '10px',
          }}>
            {aiReorderSuggestions.length}
          </span>
        </div>

        {aiReorderSuggestions.length === 0 ? (
          <div style={{
            backgroundColor: 'white', padding: '40px', borderRadius: '12px',
            textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <FaBoxes size={28} color="#d1d5db" style={{ marginBottom: '8px' }} />
            <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>No reorder suggestions at this time</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
            {aiReorderSuggestions.slice(0, 12).map((s, idx) => {
              const u = urgencyColors[s.urgency] || urgencyColors.low;
              return (
                <div key={idx} style={{
                  backgroundColor: 'white', borderRadius: '12px', padding: '16px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: `4px solid ${u.border}`,
                  display: 'flex', flexDirection: 'column', gap: '8px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                      {s.inventoryItemName}
                    </h4>
                    <span style={{
                      padding: '2px 10px', borderRadius: '10px', fontSize: '10px',
                      fontWeight: '700', backgroundColor: u.bg, color: u.text,
                      textTransform: 'uppercase', letterSpacing: '0.3px', whiteSpace: 'nowrap',
                    }}>
                      {s.urgency}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280' }}>
                    <span>Current: <strong style={{ color: '#374151' }}>{s.currentStock}</strong></span>
                    <span>Min: <strong style={{ color: '#374151' }}>{s.minStock}</strong></span>
                    <span>Order: <strong style={{ color: '#059669' }}>{s.suggestedQuantity}</strong></span>
                  </div>
                  {s.estimatedCost != null && (
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#059669' }}>
                      Est. Cost: {formatCurrency(s.estimatedCost)}
                    </p>
                  )}
                  {s.reasoning && (
                    <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', fontStyle: 'italic', lineHeight: '1.4' }}>
                      {s.reasoning}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Waste Predictions */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <FaRecycle size={18} color="#059669" />
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
            Waste Predictions
          </h3>
          <span style={{
            backgroundColor: '#ecfdf5', color: '#065f46', fontSize: '12px',
            fontWeight: '600', padding: '2px 10px', borderRadius: '10px',
          }}>
            {wastePredictions.length}
          </span>
        </div>

        {wasteSummary && (
          <div style={{
            backgroundColor: 'white', borderRadius: '12px', padding: '16px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '12px',
            display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '16px',
          }}>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#6b7280' }}>Items at Risk</p>
              <p style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#1f2937' }}>{wasteSummary.totalItemsAtRisk}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#6b7280' }}>Estimated Loss</p>
              <p style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#ef4444' }}>{formatCurrency(wasteSummary.totalEstimatedLoss || 0)}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#6b7280' }}>Critical Risk</p>
              <p style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#dc2626' }}>{wasteSummary.criticalRisk}</p>
            </div>
          </div>
        )}

        {wastePredictions.length === 0 ? (
          <div style={{
            backgroundColor: 'white', padding: '40px', borderRadius: '12px',
            textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <FaRecycle size={28} color="#d1d5db" style={{ marginBottom: '8px' }} />
            <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>No waste risk detected</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
            {wastePredictions.slice(0, 12).map((p, idx) => {
              const r = riskColors[p.wasteRisk] || riskColors.low;
              return (
                <div key={idx} style={{
                  backgroundColor: 'white', borderRadius: '12px', padding: '16px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: `4px solid ${r.border}`,
                  display: 'flex', flexDirection: 'column', gap: '8px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                      {p.inventoryItemName}
                    </h4>
                    <span style={{
                      padding: '2px 10px', borderRadius: '10px', fontSize: '10px',
                      fontWeight: '700', backgroundColor: r.bg, color: r.text,
                      textTransform: 'uppercase', letterSpacing: '0.3px', whiteSpace: 'nowrap',
                    }}>
                      {p.wasteRisk}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', gap: '12px' }}>
                    <span>Expires in <strong style={{ color: '#374151' }}>{p.daysToExpiry} days</strong></span>
                    {p.estimatedLoss != null && (
                      <span>Loss: <strong style={{ color: '#ef4444' }}>{formatCurrency(p.estimatedLoss)}</strong></span>
                    )}
                  </div>
                  {p.recommendations && p.recommendations.length > 0 && (
                    <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '8px' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '600', color: '#6b7280' }}>Recommendations:</p>
                      <ul style={{ margin: 0, paddingLeft: '16px' }}>
                        {p.recommendations.map((rec, ri) => (
                          <li key={ri} style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.5' }}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Quick Reports */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <FaClipboardList size={18} color="#6366f1" />
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
            Quick Reports
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '12px' }}>
          {reportButtons.map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.type}
                onClick={() => generateReport(btn.type)}
                style={{
                  backgroundColor: btn.bg, color: btn.color, border: 'none',
                  borderRadius: '12px', padding: '16px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  gap: '8px', textAlign: 'left', transition: 'transform 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <Icon size={20} />
                <span style={{ fontWeight: '600', fontSize: '14px' }}>{btn.title}</span>
                <span style={{ fontSize: '11px', opacity: 0.8 }}>{btn.desc}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Report Modal */}
      {reportData && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }} onClick={() => setReportData(null)}>
          <div
            style={{
              backgroundColor: 'white', borderRadius: '16px',
              width: '100%', maxWidth: '640px', maxHeight: '80vh',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px 24px', borderBottom: '1px solid #e5e7eb',
            }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                {reportData.title}
              </h4>
              <button
                onClick={() => setReportData(null)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#6b7280', padding: '4px', borderRadius: '6px',
                }}
              >
                <FaTimes size={18} />
              </button>
            </div>
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 16px' }}>
                Generated on: {new Date().toLocaleString()}
              </p>
              <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                {reportData.content}
              </div>
            </div>
            <div style={{
              padding: '16px 24px', borderTop: '1px solid #e5e7eb',
              display: 'flex', justifyContent: 'flex-end', gap: '8px',
            }}>
              <button
                onClick={() => window.print()}
                style={{
                  backgroundColor: '#059669', color: 'white', border: 'none',
                  borderRadius: '8px', padding: '8px 20px', fontSize: '13px',
                  fontWeight: '600', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', gap: '6px',
                }}
              >
                <FaDownload size={12} /> Export
              </button>
              <button
                onClick={() => setReportData(null)}
                style={{
                  backgroundColor: '#f3f4f6', color: '#374151', border: 'none',
                  borderRadius: '8px', padding: '8px 20px', fontSize: '13px',
                  fontWeight: '600', cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
