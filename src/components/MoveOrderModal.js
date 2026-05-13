'use client';

import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaSpinner, FaExchangeAlt, FaChair } from 'react-icons/fa';
import apiClient from '../lib/api';

/**
 * Compact modal for moving an order from one table to another.
 * Shows floor tabs (if multi-floor) and a grid of available tables.
 * Used by both DashboardTablesPanel and the Tables page.
 */
export default function MoveOrderModal({
  isOpen,
  onClose,
  sourceTable,   // { id, name, currentOrderId, floorId, floorName }
  floors = [],
  restaurantId,
  onMoveComplete, // (oldTableId, newTableId) => void
}) {
  const [selectedFloorId, setSelectedFloorId] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [moving, setMoving] = useState(false);
  const [error, setError] = useState(null);

  // Compute available tables per floor
  const floorData = useMemo(() => {
    if (!floors || floors.length === 0) return [];
    return floors.map(floor => {
      const available = (floor.tables || []).filter(t =>
        t.status === 'available' && t.id !== sourceTable?.id
      );
      return {
        id: floor.id,
        name: floor.name || floor.info?.name || 'Floor',
        tables: available,
        totalTables: (floor.tables || []).length,
      };
    }).filter(f => f.tables.length > 0 || f.id === sourceTable?.floorId);
  }, [floors, sourceTable]);

  // Default to source table's floor, or first floor with available tables
  const activeFloorId = selectedFloorId
    || sourceTable?.floorId
    || floorData.find(f => f.tables.length > 0)?.id
    || floorData[0]?.id;

  const activeFloor = floorData.find(f => f.id === activeFloorId);
  const availableTables = activeFloor?.tables || [];
  const showFloorTabs = floorData.length > 1;

  const handleMove = async () => {
    if (!selectedTarget || !sourceTable?.currentOrderId || moving) return;
    setMoving(true);
    setError(null);

    try {
      const targetFloor = floorData.find(f => f.id === activeFloorId);
      await apiClient.moveOrderToTable(sourceTable.currentOrderId, {
        targetTableId: selectedTarget.id,
        targetTableName: selectedTarget.name || selectedTarget.number,
        targetFloorId: activeFloorId || null,
        targetFloorName: targetFloor?.name || null,
        restaurantId,
      });

      if (onMoveComplete) {
        onMoveComplete(sourceTable.id, selectedTarget.id);
      }
      onClose();
    } catch (err) {
      console.error('Move order failed:', err);
      setError(err.message || 'Failed to move order. Please try again.');
    } finally {
      setMoving(false);
    }
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '420px',
          maxHeight: '80vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #f3f4f6',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FaExchangeAlt size={14} color="#3b82f6" />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                Move Order
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Table {sourceTable?.name}{sourceTable?.floorName ? ` · ${sourceTable.floorName}` : ''}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
              color: '#9ca3af', borderRadius: '6px',
            }}
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Floor Tabs */}
        {showFloorTabs && (
          <div style={{
            padding: '12px 20px 0', display: 'flex', gap: '6px', flexWrap: 'wrap',
          }}>
            {floorData.map(floor => {
              const isActive = floor.id === activeFloorId;
              return (
                <button
                  key={floor.id}
                  onClick={() => { setSelectedFloorId(floor.id); setSelectedTarget(null); setError(null); }}
                  style={{
                    padding: '6px 12px', borderRadius: '20px', border: 'none',
                    fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                    background: isActive ? '#111827' : '#f3f4f6',
                    color: isActive ? '#fff' : '#374151',
                    transition: 'all 0.15s',
                  }}
                >
                  {floor.name} ({floor.tables.length})
                </button>
              );
            })}
          </div>
        )}

        {/* Table Grid */}
        <div style={{
          padding: '16px 20px', flex: 1, overflowY: 'auto',
          minHeight: '120px',
        }}>
          {availableTables.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '32px 16px', color: '#9ca3af',
            }}>
              <FaChair size={24} style={{ marginBottom: '8px', opacity: 0.4 }} />
              <div style={{ fontSize: '13px' }}>No available tables on this floor</div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
              gap: '8px',
            }}>
              {availableTables.map(table => {
                const isSelected = selectedTarget?.id === table.id;
                return (
                  <button
                    key={table.id}
                    onClick={() => { setSelectedTarget(table); setError(null); }}
                    style={{
                      padding: '12px 8px', borderRadius: '10px',
                      border: isSelected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                      background: isSelected ? '#eff6ff' : '#fff',
                      cursor: 'pointer', textAlign: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      fontSize: '14px', fontWeight: 600,
                      color: isSelected ? '#1d4ed8' : '#111827',
                    }}>
                      {table.name || table.number}
                    </div>
                    {table.capacity && (
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                        {table.capacity} seats
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            margin: '0 20px', padding: '8px 12px', borderRadius: '8px',
            background: '#fef2f2', color: '#dc2626', fontSize: '12px',
          }}>
            {error}
          </div>
        )}

        {/* Footer */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid #f3f4f6',
          display: 'flex', gap: '8px',
        }}>
          <button
            onClick={onClose}
            disabled={moving}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px',
              border: '1px solid #e5e7eb', background: '#fff',
              color: '#374151', fontSize: '13px', fontWeight: 600,
              cursor: moving ? 'not-allowed' : 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleMove}
            disabled={!selectedTarget || moving}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
              background: !selectedTarget || moving ? '#d1d5db' : '#3b82f6',
              color: '#fff', fontSize: '13px', fontWeight: 600,
              cursor: !selectedTarget || moving ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}
          >
            {moving ? (
              <><FaSpinner size={12} className="spin" /> Moving...</>
            ) : (
              <>Move{selectedTarget ? ` to ${selectedTarget.name || selectedTarget.number}` : ''}</>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
