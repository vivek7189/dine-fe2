'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import {
  FaPlus,
  FaTrash,
  FaPrint,
  FaClock,
  FaUsers,
  FaExclamationTriangle,
  FaChevronDown,
  FaChevronUp,
  FaCalendarAlt,
} from 'react-icons/fa';

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SHIFT_TYPES = {
  off: { label: '—', hours: 0, bg: '#f3f4f6', color: '#9ca3af', border: '#e5e7eb', full: 'Off' },
  morning: { label: 'M', hours: 8, bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd', full: 'Morning (6am–2pm)' },
  afternoon: { label: 'A', hours: 8, bg: '#fef3c7', color: '#b45309', border: '#fcd34d', full: 'Afternoon (2pm–10pm)' },
  night: { label: 'N', hours: 8, bg: '#ede9fe', color: '#7c3aed', border: '#c4b5fd', full: 'Night (10pm–6am)' },
  split: { label: 'S', hours: 9, bg: '#dcfce7', color: '#15803d', border: '#86efac', full: 'Split (11am–3pm, 6pm–11pm)' },
};

const SHIFT_CYCLE = ['off', 'morning', 'afternoon', 'night', 'split'];

const ROLES = ['Chef', 'Cook', 'Waiter', 'Bartender', 'Host', 'Manager', 'Cashier', 'Cleaner', 'Delivery'];

const REGIONS = [
  { name: 'India', currency: '₹', symbol: 'INR', overtime: 48 },
  { name: 'USA', currency: '$', symbol: 'USD', overtime: 40 },
  { name: 'UK', currency: '£', symbol: 'GBP', overtime: 48 },
  { name: 'UAE', currency: 'AED', symbol: 'AED', overtime: 48 },
  { name: 'Qatar', currency: 'QAR', symbol: 'QAR', overtime: 48 },
];

const CURRENCIES = ['₹', '$', '£', 'AED', 'QAR'];

const DEFAULT_STAFF = [
  { id: 1, name: 'Rahul', role: 'Chef', rate: 250, currency: '₹' },
  { id: 2, name: 'Priya', role: 'Waiter', rate: 150, currency: '₹' },
  { id: 3, name: 'Amit', role: 'Manager', rate: 300, currency: '₹' },
];

// Mon–Fri morning for Chef, Mon–Thu afternoon for Waiter, Mon–Wed + Fri night for Manager
const DEFAULT_SHIFTS = {
  1: { Mon: 'morning', Tue: 'morning', Wed: 'morning', Thu: 'morning', Fri: 'morning', Sat: 'off', Sun: 'off' },
  2: { Mon: 'afternoon', Tue: 'afternoon', Wed: 'afternoon', Thu: 'afternoon', Fri: 'off', Sat: 'afternoon', Sun: 'off' },
  3: { Mon: 'split', Tue: 'night', Wed: 'night', Thu: 'off', Fri: 'night', Sat: 'morning', Sun: 'off' },
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function calcStaffStats(staff, shifts, overtimeThreshold) {
  const staffShifts = shifts[staff.id] || {};
  let regularHours = 0;
  DAYS.forEach((d) => {
    const type = staffShifts[d] || 'off';
    regularHours += SHIFT_TYPES[type].hours;
  });

  const overtimeHours = Math.max(0, regularHours - overtimeThreshold);
  const regularPay = Math.min(regularHours, overtimeThreshold) * staff.rate;
  const overtimePay = overtimeHours * staff.rate * 1.5;
  const totalPay = regularPay + overtimePay;
  const utilization = Math.round((regularHours / (7 * 8)) * 100);

  return { totalHours: regularHours, overtimeHours, regularPay, overtimePay, totalPay, utilization };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ShiftSchedulerClient() {
  const [staff, setStaff] = useState(DEFAULT_STAFF);
  const [shifts, setShifts] = useState(DEFAULT_SHIFTS);
  const [region, setRegion] = useState(REGIONS[0]);
  const [nextId, setNextId] = useState(4);

  // Add staff form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Waiter');
  const [newRate, setNewRate] = useState('');
  const [newCurrency, setNewCurrency] = useState('₹');

  // FAQ accordion
  const [openFaq, setOpenFaq] = useState(null);

  // Handle region change — update currency for new staff but don't alter existing
  const handleRegionChange = (regionName) => {
    const r = REGIONS.find((x) => x.name === regionName);
    if (r) {
      setRegion(r);
      setNewCurrency(r.currency);
    }
  };

  const addStaff = () => {
    if (!newName.trim()) return;
    const id = nextId;
    setNextId(id + 1);
    setStaff((prev) => [
      ...prev,
      { id, name: newName.trim(), role: newRole, rate: parseFloat(newRate) || 0, currency: newCurrency },
    ]);
    setShifts((prev) => ({
      ...prev,
      [id]: { Mon: 'off', Tue: 'off', Wed: 'off', Thu: 'off', Fri: 'off', Sat: 'off', Sun: 'off' },
    }));
    setNewName('');
    setNewRate('');
    setShowAddForm(false);
  };

  const removeStaff = (id) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    setShifts((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const cycleShift = (staffId, day) => {
    setShifts((prev) => {
      const current = prev[staffId]?.[day] || 'off';
      const idx = SHIFT_CYCLE.indexOf(current);
      const next = SHIFT_CYCLE[(idx + 1) % SHIFT_CYCLE.length];
      return {
        ...prev,
        [staffId]: { ...(prev[staffId] || {}), [day]: next },
      };
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Computed totals
  const allStats = staff.map((s) => ({ ...s, ...calcStaffStats(s, shifts, region.overtime) }));
  const totalLaborHours = allStats.reduce((sum, s) => sum + s.totalHours, 0);
  const totalLaborCost = allStats.reduce((sum, s) => sum + s.totalPay, 0);
  const avgCostPerDay = totalLaborCost / 7;
  const overtimeStaff = allStats.filter((s) => s.overtimeHours > 0);

  const currencySymbol = region.currency;

  // ─── Styles ────────────────────────────────────────────────────────────────

  const container = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    paddingTop: '80px',
  };

  const maxW = { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' };

  return (
    <>
      <CommonHeader />
      <div style={container}>

        {/* ── Hero ── */}
        <section
          style={{
            background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
            color: 'white',
            padding: '64px 20px',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: 'rgba(99,102,241,0.2)',
                color: '#a5b4fc',
                border: '1px solid rgba(99,102,241,0.4)',
                borderRadius: '999px',
                padding: '6px 18px',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '20px',
                letterSpacing: '0.5px',
              }}
            >
              Free Tool — No Login Required
            </span>
            <h1
              style={{
                fontSize: 'clamp(28px, 5vw, 44px)',
                fontWeight: '800',
                marginBottom: '16px',
                lineHeight: 1.2,
              }}
            >
              Restaurant Staff Shift Scheduler
            </h1>
            <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', opacity: 0.85, maxWidth: '600px', margin: '0 auto' }}>
              Plan weekly shifts, track labor costs, and manage overtime — all in one visual planner
            </p>
          </div>
        </section>

        {/* ── Tool Section ── */}
        <section style={{ padding: '48px 20px' }}>
          <div style={maxW}>

            {/* Top controls */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <FaCalendarAlt style={{ color: '#6366f1', fontSize: '20px' }} />
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>
                  Weekly Shift Schedule
                </h2>
                {/* Region selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Region:</label>
                  <select
                    value={region.name}
                    onChange={(e) => handleRegionChange(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      color: '#111827',
                      cursor: 'pointer',
                    }}
                  >
                    {REGIONS.map((r) => (
                      <option key={r.name} value={r.name}>
                        {r.name} ({r.currency}) — OT &gt;{r.overtime}h
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handlePrint}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  backgroundColor: '#111827',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                <FaPrint />
                Print Schedule
              </button>
            </div>

            {/* Grid card */}
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                overflow: 'hidden',
                marginBottom: '32px',
              }}
            >
              {/* Shift legend */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  padding: '16px 20px',
                  borderBottom: '1px solid #f3f4f6',
                  backgroundColor: '#fafafa',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginRight: '4px', alignSelf: 'center' }}>
                  CLICK CELL TO CYCLE:
                </span>
                {Object.entries(SHIFT_TYPES).map(([key, val]) => (
                  <span
                    key={key}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      backgroundColor: val.bg,
                      color: val.color,
                      border: `1px solid ${val.border}`,
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        width: '18px',
                        height: '18px',
                        backgroundColor: val.color,
                        color: 'white',
                        borderRadius: '4px',
                        textAlign: 'center',
                        lineHeight: '18px',
                        fontSize: '11px',
                        fontWeight: '700',
                      }}
                    >
                      {val.label}
                    </span>
                    {val.full}
                  </span>
                ))}
              </div>

              {/* Scrollable grid */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '660px' }}>
                  <thead>
                    <tr>
                      <th
                        style={{
                          width: '170px',
                          minWidth: '170px',
                          padding: '14px 16px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: '700',
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          borderBottom: '2px solid #e5e7eb',
                          backgroundColor: '#f9fafb',
                          position: 'sticky',
                          left: 0,
                          zIndex: 2,
                        }}
                      >
                        Staff
                      </th>
                      {DAYS.map((day) => (
                        <th
                          key={day}
                          style={{
                            minWidth: '70px',
                            padding: '14px 8px',
                            textAlign: 'center',
                            fontSize: '13px',
                            fontWeight: '700',
                            color: day === 'Sat' || day === 'Sun' ? '#6366f1' : '#374151',
                            borderBottom: '2px solid #e5e7eb',
                            backgroundColor: '#f9fafb',
                          }}
                        >
                          {day}
                        </th>
                      ))}
                      <th
                        style={{
                          minWidth: '80px',
                          padding: '14px 8px',
                          textAlign: 'center',
                          fontSize: '12px',
                          fontWeight: '700',
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          borderBottom: '2px solid #e5e7eb',
                          backgroundColor: '#f9fafb',
                        }}
                      >
                        Hrs
                      </th>
                      <th
                        style={{
                          minWidth: '100px',
                          padding: '14px 8px',
                          textAlign: 'center',
                          fontSize: '12px',
                          fontWeight: '700',
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          borderBottom: '2px solid #e5e7eb',
                          backgroundColor: '#f9fafb',
                        }}
                      >
                        Pay
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((s, rowIdx) => {
                      const stats = allStats.find((x) => x.id === s.id);
                      const staffShifts = shifts[s.id] || {};
                      const isOT = stats.overtimeHours > 0;

                      return (
                        <tr
                          key={s.id}
                          style={{
                            backgroundColor: rowIdx % 2 === 0 ? 'white' : '#fafafa',
                          }}
                        >
                          {/* Staff name cell */}
                          <td
                            style={{
                              padding: '10px 16px',
                              borderBottom: '1px solid #f3f4f6',
                              position: 'sticky',
                              left: 0,
                              backgroundColor: rowIdx % 2 === 0 ? 'white' : '#fafafa',
                              zIndex: 1,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                              <div>
                                <p style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: 0 }}>{s.name}</p>
                                <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>
                                  {s.role} · {s.currency}{s.rate}/hr
                                </p>
                              </div>
                              <button
                                onClick={() => removeStaff(s.id)}
                                title="Remove staff"
                                style={{
                                  padding: '4px 6px',
                                  backgroundColor: 'transparent',
                                  color: '#d1d5db',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  flexShrink: 0,
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = '#d1d5db')}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>

                          {/* Day cells */}
                          {DAYS.map((day) => {
                            const type = staffShifts[day] || 'off';
                            const st = SHIFT_TYPES[type];
                            // Check if this specific day contributes to overtime
                            // Simple approach: flag row if staff is in overtime
                            return (
                              <td
                                key={day}
                                style={{
                                  padding: '6px',
                                  textAlign: 'center',
                                  borderBottom: '1px solid #f3f4f6',
                                }}
                              >
                                <button
                                  onClick={() => cycleShift(s.id, day)}
                                  title={`${s.name} ${day}: ${st.full}. Click to change.`}
                                  style={{
                                    width: '100%',
                                    minWidth: '58px',
                                    height: '50px',
                                    backgroundColor: st.bg,
                                    color: st.color,
                                    border: isOT && type !== 'off'
                                      ? '2px solid #ef4444'
                                      : `1px solid ${st.border}`,
                                    borderRadius: '6px',
                                    fontSize: '15px',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'opacity 0.15s',
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                                >
                                  {st.label}
                                </button>
                              </td>
                            );
                          })}

                          {/* Hours */}
                          <td
                            style={{
                              padding: '6px 8px',
                              textAlign: 'center',
                              borderBottom: '1px solid #f3f4f6',
                              fontSize: '14px',
                              fontWeight: '700',
                              color: isOT ? '#ef4444' : '#111827',
                            }}
                          >
                            {stats.totalHours}h
                            {isOT && (
                              <span
                                style={{
                                  display: 'block',
                                  fontSize: '10px',
                                  color: '#ef4444',
                                  fontWeight: '600',
                                }}
                              >
                                +{stats.overtimeHours}h OT
                              </span>
                            )}
                          </td>

                          {/* Pay */}
                          <td
                            style={{
                              padding: '6px 8px',
                              textAlign: 'center',
                              borderBottom: '1px solid #f3f4f6',
                              fontSize: '13px',
                              fontWeight: '700',
                              color: '#059669',
                            }}
                          >
                            {s.currency}{stats.totalPay.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Add staff row */}
              <div style={{ padding: '16px 20px', borderTop: '1px solid #f3f4f6' }}>
                {!showAddForm ? (
                  <button
                    onClick={() => setShowAddForm(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      backgroundColor: '#f0fdf4',
                      color: '#16a34a',
                      border: '1px dashed #86efac',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    <FaPlus />
                    Add Staff Member
                  </button>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '10px',
                      alignItems: 'flex-end',
                      padding: '16px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '10px',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>
                        Name
                      </label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Staff name"
                        onKeyDown={(e) => e.key === 'Enter' && addStaff()}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          width: '140px',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>
                        Role
                      </label>
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          backgroundColor: 'white',
                        }}
                      >
                        {ROLES.map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>
                        Hourly Rate
                      </label>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <select
                          value={newCurrency}
                          onChange={(e) => setNewCurrency(e.target.value)}
                          style={{
                            padding: '8px 8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '13px',
                            backgroundColor: 'white',
                            width: '70px',
                          }}
                        >
                          {CURRENCIES.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={newRate}
                          onChange={(e) => setNewRate(e.target.value)}
                          placeholder="0"
                          min="0"
                          style={{
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            width: '90px',
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={addStaff}
                        style={{
                          padding: '9px 20px',
                          backgroundColor: '#16a34a',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowAddForm(false)}
                        style={{
                          padding: '9px 16px',
                          backgroundColor: '#f3f4f6',
                          color: '#374151',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Summary Panel ── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
                marginBottom: '32px',
              }}
            >
              {/* Grand totals */}
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '28px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
                }}
              >
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <FaClock style={{ color: '#6366f1' }} />
                  Weekly Summary
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Total Staff</span>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>{staff.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Total Labor Hours</span>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>{totalLaborHours}h</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 0',
                      borderTop: '1px solid #f3f4f6',
                      borderBottom: '1px solid #f3f4f6',
                    }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Total Labor Cost</span>
                    <span style={{ fontSize: '22px', fontWeight: '800', color: '#059669' }}>
                      {currencySymbol}{totalLaborCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Avg Cost / Day</span>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#374151' }}>
                      {currencySymbol}{avgCostPerDay.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Overtime Threshold</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#6366f1' }}>{region.overtime}h / week</span>
                  </div>
                </div>
              </div>

              {/* Per-staff breakdown */}
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '28px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
                }}
              >
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <FaUsers style={{ color: '#6366f1' }} />
                  Staff Breakdown
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {allStats.map((s) => (
                    <div key={s.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <div>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{s.name}</span>
                          <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '6px' }}>{s.role}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: s.overtimeHours > 0 ? '#ef4444' : '#059669' }}>
                            {s.totalHours}h · {s.currency}{s.totalPay.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </span>
                          {s.overtimeHours > 0 && (
                            <span
                              style={{
                                display: 'block',
                                fontSize: '11px',
                                color: '#ef4444',
                                fontWeight: '500',
                              }}
                            >
                              {s.overtimeHours}h OT (+{s.currency}{s.overtimePay.toLocaleString('en-IN', { maximumFractionDigits: 0 })})
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Utilization bar */}
                      <div style={{ height: '6px', backgroundColor: '#f3f4f6', borderRadius: '999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(s.utilization, 100)}%`,
                            backgroundColor: s.overtimeHours > 0 ? '#ef4444' : '#6366f1',
                            borderRadius: '999px',
                            transition: 'width 0.3s',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>{s.utilization}% utilization</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overtime alerts */}
              {overtimeStaff.length > 0 && (
                <div
                  style={{
                    backgroundColor: '#fff7ed',
                    border: '1px solid #fed7aa',
                    borderRadius: '16px',
                    padding: '28px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#c2410c',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <FaExclamationTriangle />
                    Overtime Alerts
                  </h3>
                  <p style={{ fontSize: '13px', color: '#9a3412', marginBottom: '16px' }}>
                    The following staff exceed the {region.overtime}-hour weekly threshold for {region.name}.
                    Overtime is paid at 1.5x the base rate.
                  </p>
                  {overtimeStaff.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #fed7aa',
                        marginBottom: '8px',
                      }}
                    >
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: 0 }}>{s.name}</p>
                        <p style={{ fontSize: '12px', color: '#c2410c', margin: 0 }}>
                          {s.totalHours}h total · {s.overtimeHours}h overtime
                        </p>
                      </div>
                      <span
                        style={{
                          padding: '4px 10px',
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: '700',
                        }}
                      >
                        +{s.currency}{s.overtimePay.toLocaleString('en-IN', { maximumFractionDigits: 0 })} OT
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── SEO Content ── */}
        <section style={{ padding: '16px 20px 60px' }}>
          <div style={maxW}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>

              {/* Article 1 */}
              <article
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '32px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                }}
              >
                <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '16px', lineHeight: 1.3 }}>
                  Restaurant Staff Scheduling Best Practices
                </h2>
                <div style={{ fontSize: '15px', lineHeight: 1.7, color: '#374151' }}>
                  <p>
                    Effective shift scheduling is one of the most important management skills in a restaurant. A well-built rota keeps
                    labour costs under control, ensures every service period is properly staffed, and keeps your team motivated.
                  </p>
                  <p style={{ marginTop: '14px' }}>
                    <strong>Plan around peak hours.</strong> Analyse your sales data and identify your busiest windows — typically
                    Friday and Saturday dinner service, Sunday brunch, or weekday lunch peaks. Schedule your strongest performers
                    during these slots and use lighter coverage during quiet periods.
                  </p>
                  <p style={{ marginTop: '14px' }}>
                    <strong>Prioritise consistency.</strong> Staff perform better when their schedules are predictable. Where possible,
                    give each person a consistent set of days and shift types. Erratic scheduling leads to fatigue, resentment, and
                    high turnover — all of which cost far more than a little extra overtime.
                  </p>
                  <p style={{ marginTop: '14px' }}>
                    <strong>Publish schedules early.</strong> Aim to post the weekly rota at least 7–14 days in advance. This allows
                    your team to plan their personal lives and reduces last-minute call-outs. Some regions legally require advance
                    notice; check local employment law.
                  </p>
                  <p style={{ marginTop: '14px' }}>
                    <strong>Balance fairness with operational need.</strong> Rotate unpopular shifts (late nights, double shifts)
                    fairly across the team. If certain staff are always stuck with undesirable shifts, morale suffers. Use this
                    scheduler&apos;s colour-coded grid to spot imbalances at a glance.
                  </p>
                  <p style={{ marginTop: '14px' }}>
                    <strong>Account for cross-training.</strong> Staff who can cover multiple roles give you scheduling flexibility.
                    A waiter who can also host, or a cook who can handle cashier duties during slow periods, reduces your minimum
                    required headcount and lowers overall labour cost.
                  </p>
                </div>
              </article>

              {/* Article 2 */}
              <article
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '32px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                }}
              >
                <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '16px', lineHeight: 1.3 }}>
                  How to Reduce Restaurant Labour Costs Without Cutting Staff
                </h2>
                <div style={{ fontSize: '15px', lineHeight: 1.7, color: '#374151' }}>
                  <p>
                    Labour is typically a restaurant&apos;s second-largest expense after food cost. Most full-service restaurants target
                    a labour cost percentage between 28% and 35% of revenue. Here&apos;s how to stay within that range without reducing
                    headcount or service quality.
                  </p>
                  <p style={{ marginTop: '14px' }}>
                    <strong>Eliminate unnecessary overtime.</strong> Overtime at 1.5x the base rate rapidly inflates your payroll.
                    Use a shift scheduler (like this one) to monitor weekly hours per employee before the schedule is published,
                    so you can redistribute shifts before anyone crosses the threshold.
                  </p>
                  <p style={{ marginTop: '14px' }}>
                    <strong>Match staffing to demand.</strong> Split shifts — like 11am–3pm and 6pm–11pm — allow you to have
                    coverage during lunch and dinner peaks without paying for the slow mid-afternoon hours. Use sales data from
                    your POS to identify exactly when you need more or fewer hands on deck.
                  </p>
                  <p style={{ marginTop: '14px' }}>
                    <strong>Invest in cross-training.</strong> A server who can also bartend, or a cook who can handle prep and
                    plating, reduces the minimum number of staff required per shift. Cross-training also makes your operation
                    more resilient when someone calls in sick.
                  </p>
                  <p style={{ marginTop: '14px' }}>
                    <strong>Use technology to track time accurately.</strong> Manual timesheets are prone to errors and &quot;buddy
                    punching.&quot; A digital POS with staff management features logs clock-in and clock-out times precisely,
                    helping you identify patterns like early arrivals or late departures that silently inflate payroll.
                  </p>
                </div>
              </article>

              {/* Article 3 */}
              <article
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '32px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                }}
              >
                <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '16px', lineHeight: 1.3 }}>
                  Understanding Overtime Laws for Restaurants
                </h2>
                <div style={{ fontSize: '15px', lineHeight: 1.7, color: '#374151' }}>
                  <p>
                    Overtime regulations for restaurant workers vary significantly by country. Violating these rules can result in
                    fines, back-pay orders, and reputational damage. Here&apos;s a brief overview of the key markets:
                  </p>
                  <p style={{ marginTop: '14px' }}>
                    <strong>India.</strong> Under the Shops and Establishments Act (state-specific) and the Factories Act, standard
                    working hours are 48 per week. Work beyond this threshold must be compensated at twice the ordinary rate.
                    Maximum permitted overtime is typically 50–75 hours per quarter depending on the state.
                  </p>
                  <p style={{ marginTop: '14px' }}>
                    <strong>United States.</strong> The Fair Labor Standards Act (FLSA) sets overtime at 1.5x the regular rate
                    for any hours worked beyond 40 per week. Some states (California, for example) also require daily overtime
                    after 8 hours. Tipped employees have special minimum wage rules.
                  </p>
                  <p style={{ marginTop: '14px' }}>
                    <strong>United Kingdom.</strong> Workers cannot be required to work more than 48 hours per week on average
                    (calculated over a 17-week reference period) under the Working Time Regulations 1998, unless they opt out
                    in writing. Overtime pay rates are not mandated by law but must be agreed contractually.
                  </p>
                  <p style={{ marginTop: '14px' }}>
                    <strong>UAE & Qatar.</strong> Standard hours are 8 per day / 48 per week (reduced to 6 per day during Ramadan
                    in the UAE). Overtime is paid at 1.25x for regular overtime hours, and 1.5x for work between 9pm and 4am or
                    on rest days. This scheduler uses the 48-hour threshold for these regions.
                  </p>
                </div>
              </article>

            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section style={{ padding: '0 20px 60px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '32px' }}>
              Frequently Asked Questions
            </h2>
            {[
              {
                q: 'How many staff do I need for my restaurant?',
                a: 'It depends on your seating capacity, service style, and hours. As a rough guide: full-service restaurants typically need 1 server per 4–5 tables, 1 kitchen staff per 15–20 covers, and 1 manager per shift. A 50-seat casual dining restaurant might need 3–4 servers, 2–3 kitchen staff, and 1 manager per peak shift. Use our free Staff Calculator tool for a more detailed estimate based on your specific setup.',
              },
              {
                q: 'What is a good labor cost percentage for restaurants?',
                a: 'Industry benchmarks vary by format. Fast-casual and QSR restaurants typically target 25–30% of revenue. Full-service casual dining aims for 28–35%. Fine dining can run 35–40% due to the higher skill level required. If your labour cost exceeds 40%, look for inefficiencies in scheduling, overtime, or ghost hours (clocked-in time without corresponding customer demand).',
              },
              {
                q: 'How far in advance should I schedule staff?',
                a: 'The industry gold standard is 14 days in advance. At minimum, aim for 7 days. Publishing the rota early reduces last-minute call-outs, allows staff to arrange their personal lives, and gives you time to find cover if someone is unavailable. In some US states (New York, California, Oregon, Chicago), predictive scheduling laws require advance notice of 10–14 days with penalties for last-minute changes.',
              },
              {
                q: 'How do I handle shift swaps and time-off requests?',
                a: 'Establish a clear policy before issues arise. For shift swaps, require that both employees agree in writing and that the swap is approved by a manager to ensure skill coverage is maintained. For time-off requests, use a first-come, first-served system and set a blackout period around peak trading days (e.g., no requests within 72 hours of a weekend service). Digital POS systems with staff management modules can automate these workflows.',
              },
              {
                q: 'What are the overtime rules for restaurant workers?',
                a: 'Overtime thresholds vary by country. In India, overtime applies after 48 hours/week and must be paid at 2x the regular rate. In the US, overtime kicks in after 40 hours/week at 1.5x (some states apply daily overtime too). In the UK, there is no statutory overtime rate, but the 48-hour weekly average cap applies under Working Time Regulations. In UAE and Qatar, the threshold is 48 hours/week, with overtime at 1.25x (1.5x for night hours and rest days). This free shift scheduler automatically applies the correct threshold based on your selected region.',
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  marginBottom: '12px',
                  overflow: 'hidden',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px 24px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    gap: '16px',
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827', flex: 1 }}>{item.q}</span>
                  <span style={{ color: '#6366f1', flexShrink: 0 }}>
                    {openFaq === i ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                </button>
                {openFaq === i && (
                  <div
                    style={{
                      padding: '0 24px 20px',
                      fontSize: '15px',
                      lineHeight: 1.7,
                      color: '#4b5563',
                      borderTop: '1px solid #f3f4f6',
                      paddingTop: '16px',
                    }}
                  >
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section
          style={{
            background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
            color: 'white',
            padding: '64px 20px',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px' }}>
              Ready to Automate Staff Management?
            </h2>
            <p style={{ fontSize: '16px', opacity: 0.85, marginBottom: '28px', lineHeight: 1.6 }}>
              DineOpen POS includes built-in staff scheduling, clock-in tracking, overtime alerts, and payroll reports —
              all synced with your sales data so you always schedule the right number of people at the right time.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              <Link
                href="/pricing"
                style={{
                  display: 'inline-block',
                  padding: '14px 32px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '16px',
                  textDecoration: 'none',
                }}
              >
                Start Free Trial
              </Link>
              <Link
                href="/demo"
                style={{
                  display: 'inline-block',
                  padding: '14px 32px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '16px',
                  textDecoration: 'none',
                }}
              >
                Book a Demo
              </Link>
            </div>
          </div>
        </section>

        {/* ── Related Tools ── */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '28px' }}>
              Related Free Tools
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { href: '/tools/staff-calculator', label: 'Staff Calculator', desc: 'How many staff do you need?' },
                { href: '/tools/labor-cost-calculator', label: 'Labour Cost Calculator', desc: 'Calculate your payroll cost' },
                { href: '/tools/tip-pooling-calculator', label: 'Tip Pooling Calculator', desc: 'Distribute tips fairly' },
                { href: '/tools/break-even-calculator', label: 'Break-Even Calculator', desc: 'Find your break-even point' },
              ].map((tool) => (
                <a
                  key={tool.href}
                  href={tool.href}
                  style={{
                    display: 'block',
                    padding: '20px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    transition: 'box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)')}
                >
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{tool.label}</p>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>{tool.desc}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        <InternalLinks currentPath="/tools/shift-scheduler" variant="tool" />
        <Footer />
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          table, table * { visibility: visible; }
          table { position: absolute; left: 0; top: 0; width: 100%; }
          button { display: none !important; }
        }
      `}</style>
    </>
  );
}
