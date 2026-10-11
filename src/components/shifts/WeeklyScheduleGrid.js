'use client';

import { useState, useMemo } from 'react';
import {
  FaChevronLeft, FaChevronRight, FaCopy, FaPaperPlane, FaRobot, FaPlus,
  FaTrash, FaEdit, FaSpinner, FaCalendarAlt, FaClock, FaUserPlus, FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa';
import apiClient from '../../lib/api';
import { getRoleColor, DAYS_OF_WEEK, formatTime, getWeekStart, getWeekEnd, getWeekDates, formatDateISO, isSameDay, shiftMatchesType, availabilityOn, titleCase, slotsLabel, datesByDay, dateIcon, dateText } from './constants';
import CoveragePanel from './CoveragePanel';
import { useCurrency } from '../../contexts/CurrencyContext';
import ShiftFormModal from './ShiftFormModal';

export default function WeeklyScheduleGrid({
  restaurantId, staff, shifts, setShifts, currentWeek, setCurrentWeek,
  onReloadShifts, shiftSettings, isMobile, availability = {}, staffDates = []
}) {
  const [notice, setNotice] = useState(null); // { type, text }
  const { getCurrencySymbol } = useCurrency();
  const currencySymbol = getCurrencySymbol() || '';
  const [prefill, setPrefill] = useState(null);
  const showNotice = (type, text) => { setNotice({ type, text }); setTimeout(() => setNotice(null), type === 'warning' ? 15000 : 6000); };
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [modalDate, setModalDate] = useState(null);
  const [modalStaffId, setModalStaffId] = useState(null);
  const [copying, setCopying] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [hoveredShift, setHoveredShift] = useState(null);
  const [mobileDay, setMobileDay] = useState(0); // 0-6 for mobile day nav

  const weekDates = useMemo(() => getWeekDates(currentWeek), [currentWeek]);
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];
  const today = new Date();

  const activeStaff = (staff || []).filter(s => s.status === 'active');
  // Birthdays / anniversaries / important personal dates / leave this week → per day and per person.
  const dayDates = useMemo(() => datesByDay(staffDates), [staffDates]);
  const personDates = (staffId, dk) => (dayDates[dk] || []).filter(e => e.staffId === staffId);

  // Group shifts by staffId + date
  const shiftMap = useMemo(() => {
    const map = {};
    (shifts || []).forEach(s => {
      const dateKey = formatDateISO(s.date);
      const key = `${s.staffId || 'OPEN'}_${dateKey}`;
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
    return map;
  }, [shifts]);

  const draftCount = (shifts || []).filter(s => s.status === 'draft').length;
  const totalHours = (shifts || []).filter(s => s.staffId).reduce((sum, s) => {
    if (!s.startTime || !s.endTime) return sum;
    const [sh, sm] = s.startTime.split(':').map(Number);
    const [eh, em] = s.endTime.split(':').map(Number);
    let h = (eh + em / 60) - (sh + sm / 60);
    if (h <= 0) h += 24; // past midnight
    return sum + h - ((s.breakMinutes || 0) / 60);
  }, 0);
  const pendingRequests = (shifts || []).reduce((n, s) => n + (s.claims || []).filter(c => c.status === 'pending').length + (s.swapRequest?.status === 'pending_approval' ? 1 : 0), 0);

  // Coverage: for every shift type × day, staff needed per role vs assigned (drafts included).
  const shiftTypes = (shiftSettings?.shiftTypes || []).filter(t => t && t.name);
  const coverageFor = (dateKey, type) => {
    // Shifts of staff who were deleted / deactivated don't cover anything (they stay on the rota until removed).
    const onType = (shifts || []).filter(s => formatDateISO(s.date) === dateKey && s.staffId && shiftMatchesType(s, type)
      && !['deleted', 'inactive', 'disabled'].includes(String(s.staffStatus || '').toLowerCase()));
    const normRole = (x) => String(x || '').trim().replace(/\s+/g, ' ').toLowerCase();
    const req = type.requiredRoles || {};
    const roles = Object.keys(req).filter(r => req[r] > 0);
    const rows = roles.map(r => {
      const mine = onType.filter(s => normRole(s.role) === normRole(r)); // s.role = the person's current role
      const have = mine.length;
      return { role: r, need: req[r], have, short: Math.max(0, req[r] - have), drafts: mine.filter(s => s.status === 'draft').length };
    });
    const needTotal = Number(type.requiredEmployees) || rows.reduce((a, x) => a + x.need, 0);
    return { rows, needTotal, haveTotal: onType.length, draftTotal: onType.filter(s => s.status === 'draft').length, short: rows.reduce((a, x) => a + x.short, 0) + (roles.length ? 0 : Math.max(0, needTotal - onType.length)) };
  };
  const weekShort = shiftTypes.length ? weekDates.reduce((n, d) => n + shiftTypes.reduce((m, t) => m + coverageFor(formatDateISO(d), t).short, 0), 0) : 0;
  const openGap = (date, type, role) => {
    setEditingShift(null); setModalStaffId(null); setModalDate(date);
    setPrefill({ shiftType: type, role, isOpen: false });
    setShowAddModal(true);
  };

  // Navigate week
  const navigateWeek = (dir) => {
    const d = new Date(currentWeek);
    d.setDate(d.getDate() + dir * 7);
    setCurrentWeek(d);
  };

  const goToToday = () => setCurrentWeek(new Date());

  // Add shift
  const handleCellClick = (staffId, date) => {
    setPrefill(null);
    setEditingShift(null);
    setModalStaffId(staffId);
    setModalDate(date);
    setShowAddModal(true);
  };

  const handleAddClick = () => {
    setPrefill(null);
    setEditingShift(null);
    setModalStaffId(null);
    setModalDate(weekDates[0]);
    setShowAddModal(true);
  };

  const handleEditShift = (shift) => {
    setEditingShift(shift);
    setModalStaffId(null);
    setModalDate(null);
    setShowAddModal(true);
  };

  const handleSaveShift = async (formData) => {
    // One call: the server updates in place when `id` is set (was delete + create, which lost the
    // history and would notify staff twice). Errors (e.g. overlapping shift) surface in the form.
    await apiClient.createShift(restaurantId, {
      id: formData.id || undefined,
      staffId: formData.isOpen ? null : formData.staffId,
      isOpen: !!formData.isOpen,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      breakMinutes: formData.breakMinutes,
      role: formData.role,
      notes: formData.notes,
      status: formData.status,
      shiftName: formData.shiftName || null,
      color: formData.color || null,
      ...(formData.incentive !== undefined && { incentive: formData.incentive }),
    });
    setPrefill(null);
    onReloadShifts();
  };

  const handleDeleteShift = async (shiftId) => {
    const sh = (shifts || []).find(x => (x.id || x._id) === shiftId);
    if (sh && sh.staffId && sh.status !== 'draft' && !confirm(`Delete this shift? ${sh.staffName || 'The staff member'} will be told it's cancelled.`)) return;
    try {
      await apiClient.deleteShift(shiftId);
      onReloadShifts();
    } catch (err) {
      console.error('Error deleting shift:', err);
    }
  };

  // Copy Previous Week
  const handleCopyWeek = async () => {
    setCopying(true);
    try {
      const prevStart = new Date(weekStart);
      prevStart.setDate(prevStart.getDate() - 7);
      const prevEnd = new Date(prevStart);
      prevEnd.setDate(prevEnd.getDate() + 6);
      const res = await apiClient.getShifts(restaurantId, formatDateISO(prevStart), formatDateISO(prevEnd));
      const prevShifts = res.shifts || res || [];
      if (prevShifts.length === 0) {
        alert('No shifts found in the previous week to copy.');
        return;
      }
      const mapped = prevShifts.map(s => {
        const [yy, mm, dd] = formatDateISO(s.date).split('-').map(Number);
        const oldDate = new Date(yy, mm - 1, dd + 7);
        return {
          staffId: s.isOpen ? null : s.staffId,
          isOpen: !!s.isOpen && !s.staffId,
          date: formatDateISO(oldDate),
          startTime: s.startTime,
          endTime: s.endTime,
          breakMinutes: s.breakMinutes || 0,
          role: s.role,
          notes: s.notes || '',
          shiftName: s.shiftName || null,
          color: s.color || null,
          status: 'draft',
        };
      });
      const r = await apiClient.bulkCreateShifts(restaurantId, mapped);
      showNotice('success', `Copied ${r?.count ?? mapped.length} shift(s) as drafts${r?.skipped ? ` · ${r.skipped} skipped (already on a shift then)` : ''}. Review, then Publish.`);
      onReloadShifts();
    } catch (err) {
      console.error('Error copying week:', err);
      alert('Failed to copy previous week');
    } finally {
      setCopying(false);
    }
  };

  // Publish Week: drafts → published on the server, and each staff member gets their schedule.
  const handlePublish = async () => {
    if (weekShort > 0 && !confirm(`${weekShort} role slot(s) are still unfilled this week. Publish anyway?`)) return;
    setPublishing(true);
    try {
      const r = await apiClient.publishShifts(restaurantId, formatDateISO(weekStart), formatDateISO(weekEnd));
      const n = r?.notified || {};
      const ch = [n.push ? `${n.push} by app notification` : null, n.whatsapp ? `${n.whatsapp} on WhatsApp` : null].filter(Boolean).join(', ');
      // WhatsApp details: sent in English (template not approved in the chosen language), sent as a
      // plain message (24 h window only), or not sent and why.
      const wa = [
        n.whatsappEnglish ? `${n.whatsappEnglish} WhatsApp sent in English — the template isn't approved in your chosen language yet` : null,
        n.whatsappText ? `${n.whatsappText} WhatsApp sent as a plain message (delivered only if they messaged you in the last 24 hours)` : null,
        n.whatsappFailed ? `${n.whatsappFailed} WhatsApp not sent: ${n.whatsappError || 'see Settings'}` : null,
      ].filter(Boolean).join('. ');
      showNotice(n.whatsappFailed || n.whatsappEnglish ? 'warning' : 'success', `Published ${r?.published || 0} shift(s). ${n.staff || 0} staff sent their schedule${ch ? ` (${ch})` : ''}.` + (wa ? ` ${wa}.` : '') + (n.staff && !n.push && !n.whatsapp ? ' Staff will see it in the DineOpen app → My Shifts (notifications reach phones once they open the updated app).' : ''));
      onReloadShifts();
    } catch (err) {
      showNotice('error', err?.message || 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  // AI Auto-Generate
  const handleAutoGenerate = async () => {
    setAutoGenerating(true);
    try {
      await apiClient.autoGenerateShifts(
        restaurantId,
        formatDateISO(weekStart),
        formatDateISO(weekEnd),
        { maxHoursPerWeek: shiftSettings?.maxHoursPerWeek || 40, maxHoursPerDay: shiftSettings?.maxHoursPerDay || 8 },
        shiftSettings?.shiftTypes || []
      );
      showNotice('success', 'AI created a draft schedule. Check it, then press Publish.');
      onReloadShifts();
    } catch (err) {
      console.error('AI generate error:', err);
      alert('AI auto-generate failed: ' + (err.message || 'Unknown error'));
    } finally {
      setAutoGenerating(false);
    }
  };

  // Format week range
  const weekLabel = (() => {
    const opts = { month: 'short', day: 'numeric' };
    const startStr = weekStart.toLocaleDateString('en-US', opts);
    const endStr = weekEnd.toLocaleDateString('en-US', { ...opts, year: 'numeric' });
    return `${startStr} – ${endStr}`;
  })();

  // Render shift block
  const renderShiftBlock = (shift) => {
    const rc = getRoleColor(shift.role);
    const isDraft = shift.status === 'draft';
    const isHovered = hoveredShift === (shift.id || shift._id);
    return (
      <div
        key={shift.id || shift._id}
        onMouseEnter={() => setHoveredShift(shift.id || shift._id)}
        onMouseLeave={() => setHoveredShift(null)}
        onClick={(e) => { e.stopPropagation(); handleEditShift(shift); }}
        style={{
          backgroundColor: rc.bg,
          borderLeft: `3px solid ${rc.block}`,
          borderRadius: '8px',
          padding: '6px 8px',
          marginBottom: '4px',
          cursor: 'pointer',
          opacity: isDraft ? 0.7 : 1,
          borderStyle: isDraft ? 'dashed' : 'solid',
          borderWidth: isDraft ? '1px' : '0 0 0 3px',
          borderColor: isDraft ? rc.border : undefined,
          position: 'relative',
          transition: 'all 0.15s',
          transform: isHovered ? 'scale(1.02)' : 'none',
          boxShadow: isHovered ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 600, color: rc.text }}>
          {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
        </div>
        {(shift.shiftName || shift.isOpen) && (
          <div style={{ fontSize: '10px', color: rc.text, opacity: 0.85 }}>{shift.isOpen ? `Open · ${titleCase(shift.role)}` : shift.shiftName}</div>
        )}
        {Number(shift.incentive?.amount) > 0 && (
          <div title={shift.incentive.note || 'Incentive for whoever takes this shift'} style={{ fontSize: '10px', fontWeight: 700, color: '#b45309' }}>
            +{currencySymbol}{shift.incentive.amount}{shift.incentive.note ? ` · ${shift.incentive.note}` : ''}
          </div>
        )}
        {(shift.claims || []).some(c => c.status === 'pending') && (
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#1d4ed8' }}>{(shift.claims || []).filter(c => c.status === 'pending').length} request(s)</div>
        )}
        {['pending_colleague', 'pending_approval'].includes(shift.swapRequest?.status) && (
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#7c3aed' }}>Swap → {shift.swapRequest.toName}{shift.swapRequest.status === 'pending_approval' ? ' (approve)' : ''}</div>
        )}
        {shift.breakMinutes > 0 && (
          <div style={{ fontSize: '10px', color: rc.text, opacity: 0.7 }}>{shift.breakMinutes}m break</div>
        )}
        {isDraft && (
          <span style={{
            fontSize: '9px', fontWeight: 700, color: '#f59e0b', backgroundColor: '#fef3c7',
            padding: '1px 5px', borderRadius: '4px', position: 'absolute', top: '2px', right: '2px'
          }}>DRAFT</span>
        )}
        {isHovered && (
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteShift(shift.id || shift._id); }}
            style={{
              position: 'absolute', bottom: '2px', right: '2px', padding: '2px 4px',
              borderRadius: '4px', border: 'none', backgroundColor: '#fee2e2',
              color: '#dc2626', cursor: 'pointer', fontSize: '10px'
            }}
          ><FaTrash size={8} /></button>
        )}
      </div>
    );
  };

  const noticeBar = notice && (
    <div style={{ marginBottom: '14px', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', lineHeight: 1.5,
      background: notice.type === 'error' ? '#fef2f2' : notice.type === 'warning' ? '#fffbeb' : '#f0fdf4',
      color: notice.type === 'error' ? '#b91c1c' : notice.type === 'warning' ? '#92400e' : '#166534',
      border: `1px solid ${notice.type === 'error' ? '#fecaca' : notice.type === 'warning' ? '#fde68a' : '#bbf7d0'}` }}>{notice.text}</div>
  );

  const hasCoverageTargets = shiftTypes.some(t => Object.values(t.requiredRoles || {}).some(v => v > 0) || Number(t.requiredEmployees) > 0);
  const coveragePanel = hasCoverageTargets && (
    <CoveragePanel shiftTypes={shiftTypes} weekDates={weekDates} coverageFor={coverageFor} onAdd={openGap}
      isMobile={isMobile} mobileDate={isMobile ? weekDates[mobileDay] : null} />
  );
  // Small icons for a day / a person's day: 🎂 birthday, 🎉 / 💍 anniversary, 🙏 👶 📌 personal dates, 🌴 leave.
  const dateIcons = (events, max = 4) => events.length > 0 && (
    <span title={events.map(dateText).join('\n')} style={{ display: 'inline-flex', gap: 1, fontSize: 12, lineHeight: 1, cursor: 'help' }}>
      {events.slice(0, max).map(e => <span key={e.id}>{dateIcon(e)}</span>)}
      {events.length > max && <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 700, alignSelf: 'center' }}>+{events.length - max}</span>}
    </span>
  );

  const openCell = (date) => {
    const list = shiftMap[`OPEN_${formatDateISO(date)}`] || [];
    return list.map(sh => renderShiftBlock(sh));
  };
  const hasOpenShifts = (shifts || []).some(sh => sh.isOpen && !sh.staffId);

  // ─── MOBILE VIEW ───────────────────────────────────────
  if (isMobile) {
    const currentDate = weekDates[mobileDay];
    const dateKey = formatDateISO(currentDate);
    const isToday = isSameDay(currentDate, today);

    return (
      <div>
        {/* Action bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <button onClick={handleCopyWeek} disabled={copying} style={{
            padding: '8px 14px', borderRadius: '10px', border: 'none', backgroundColor: '#f3f4f6',
            color: '#374151', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '4px'
          }}>{copying ? <FaSpinner size={10} className="animate-spin" /> : <FaCopy size={10} />} Copy Week</button>
          {draftCount > 0 && (
            <button onClick={handlePublish} disabled={publishing} style={{
              padding: '8px 14px', borderRadius: '10px', border: 'none', backgroundColor: '#dcfce7',
              color: '#166534', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}>{publishing ? <FaSpinner size={10} className="animate-spin" /> : <FaPaperPlane size={10} />} Publish ({draftCount})</button>
          )}
          <button onClick={handleAddClick} style={{
            padding: '8px 14px', borderRadius: '10px', border: 'none',
            background: '#dc2626', color: 'white',
            fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '4px'
          }}><FaPlus size={10} /> Add</button>
        </div>

        {noticeBar}
        {/* Day nav */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '16px', padding: '12px 16px', backgroundColor: 'white',
          borderRadius: '14px', border: '1px solid #f1f5f9'
        }}>
          <button onClick={() => setMobileDay(Math.max(0, mobileDay - 1))} disabled={mobileDay === 0}
            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', color: '#6b7280' }}>
            <FaChevronLeft size={16} />
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: isToday ? '#ef4444' : '#111827' }}>
              {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>
              {currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
          <button onClick={() => setMobileDay(Math.min(6, mobileDay + 1))} disabled={mobileDay === 6}
            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', color: '#6b7280' }}>
            <FaChevronRight size={16} />
          </button>
        </div>

        {/* Day dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '16px' }}>
          {DAYS_OF_WEEK.map((d, i) => (
            <button key={d} onClick={() => setMobileDay(i)} style={{
              width: '32px', height: '32px', borderRadius: '16px', border: 'none',
              backgroundColor: i === mobileDay ? '#ef4444' : isSameDay(weekDates[i], today) ? '#fef2f2' : '#f3f4f6',
              color: i === mobileDay ? 'white' : isSameDay(weekDates[i], today) ? '#ef4444' : '#6b7280',
              fontSize: '11px', fontWeight: 600, cursor: 'pointer'
            }}>{d[0]}</button>
          ))}
        </div>

        {coveragePanel}
        {(dayDates[dateKey] || []).length > 0 && (
          <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '10px 14px', border: '1px solid #f1f5f9', marginBottom: '12px', fontSize: '12.5px', color: '#374151', display: 'grid', gap: '4px' }}>
            {(dayDates[dateKey] || []).map(e => <div key={e.id}>{dateIcon(e)} {dateText(e)}</div>)}
          </div>
        )}
        {(shiftMap[`OPEN_${dateKey}`] || []).length > 0 && (
          <div style={{ backgroundColor: '#eff6ff', borderRadius: '14px', padding: '12px 14px', marginBottom: '12px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e40af', marginBottom: '6px' }}>Open shifts</div>
            {openCell(currentDate)}
          </div>
        )}
        {/* Shifts for the day */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activeStaff.map(member => {
            const key = `${member.id}_${dateKey}`;
            const memberShifts = shiftMap[key] || [];
            if (memberShifts.length === 0) return null;
            const rc = getRoleColor(member.role);
            return (
              <div key={member.id} style={{
                backgroundColor: 'white', borderRadius: '14px', padding: '14px',
                border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px', backgroundColor: rc.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 700, color: rc.text
                  }}>{(member.name || '?')[0].toUpperCase()}</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{member.name}</div>
                    <span style={{
                      fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '6px',
                      backgroundColor: rc.bg, color: rc.text, textTransform: 'capitalize'
                    }}>{member.role}</span>
                        {Array.isArray(member.extraRoles) && member.extraRoles.length > 0 && (
                          <span title={`Also works as ${member.extraRoles.join(', ')}`} style={{ fontSize: '10px', color: '#6b7280', marginLeft: '4px' }}>+{member.extraRoles.map(titleCase).join(', ')}</span>
                        )}
                        <span style={{ marginLeft: '6px' }}>{dateIcons(personDates(member.id, dateKey))}</span>
                  </div>
                </div>
                {memberShifts.map(s => renderShiftBlock(s))}
              </div>
            );
          })}
          {/* Show empty message if no shifts today */}
          {activeStaff.every(m => !(shiftMap[`${m.id}_${dateKey}`]?.length)) && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
              <FaCalendarAlt size={24} style={{ marginBottom: '8px', opacity: 0.3 }} />
              <p style={{ fontSize: '13px', fontWeight: 600 }}>No shifts scheduled</p>
            </div>
          )}
        </div>

        {/* Add shift for this day */}
        <button onClick={() => handleCellClick(null, currentDate)} style={{
          width: '100%', marginTop: '12px', padding: '12px', borderRadius: '12px',
          border: '2px dashed #e5e7eb', backgroundColor: '#fafafa', color: '#9ca3af',
          fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
        }}><FaPlus size={11} /> Add shift for {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}</button>

        {/* Week nav */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: '20px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '12px'
        }}>
          <button onClick={() => { navigateWeek(-1); setMobileDay(0); }} style={{
            border: 'none', background: 'none', cursor: 'pointer', padding: '8px',
            color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600
          }}><FaChevronLeft size={12} /> Prev Week</button>
          <button onClick={() => { goToToday(); setMobileDay(today.getDay() === 0 ? 6 : today.getDay() - 1); }} style={{
            padding: '6px 14px', borderRadius: '20px', border: 'none',
            backgroundColor: '#ef4444', color: 'white', fontSize: '12px', fontWeight: 600, cursor: 'pointer'
          }}>Today</button>
          <button onClick={() => { navigateWeek(1); setMobileDay(0); }} style={{
            border: 'none', background: 'none', cursor: 'pointer', padding: '8px',
            color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600
          }}>Next Week <FaChevronRight size={12} /></button>
        </div>

        <ShiftFormModal
          isOpen={showAddModal}
          onClose={() => { setShowAddModal(false); setEditingShift(null); setPrefill(null); }}
          onSave={handleSaveShift}
          shift={editingShift}
          staff={staff}
          date={modalDate || currentDate}
          staffId={modalStaffId}
          isMobile={isMobile}
          shiftTypes={shiftTypes}
          extraRoles={shiftSettings?.extraRoles || []}
          availability={availability}
          prefill={prefill}
          dayDates={dayDates}
        />
      </div>
    );
  }

  // ─── DESKTOP VIEW ──────────────────────────────────────
  return (
    <div>
      {/* Action bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '20px', flexWrap: 'wrap', gap: '12px'
      }}>
        {/* Week navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => navigateWeek(-1)} style={{
            padding: '8px 12px', borderRadius: '10px', border: '1px solid #e5e7eb',
            backgroundColor: 'white', cursor: 'pointer', color: '#374151',
            display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600
          }}><FaChevronLeft size={11} /> Prev</button>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', padding: '0 8px' }}>{weekLabel}</div>
          <button onClick={() => navigateWeek(1)} style={{
            padding: '8px 12px', borderRadius: '10px', border: '1px solid #e5e7eb',
            backgroundColor: 'white', cursor: 'pointer', color: '#374151',
            display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600
          }}>Next <FaChevronRight size={11} /></button>
          <button onClick={goToToday} style={{
            padding: '7px 14px', borderRadius: '10px', border: '1px solid #e5e7eb',
            backgroundColor: 'white', color: '#374151', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer'
          }}>Today</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#6b7280' }}>
          <span><b style={{ color: '#111827' }}>{(shifts || []).length}</b> shifts</span>
          <span>·</span>
          <span><b style={{ color: '#111827' }}>{totalHours.toFixed(1)}</b> h</span>
          {draftCount > 0 && (<>
            <span>·</span>
            <span style={{ color: '#92400e' }}><b>{draftCount}</b> not published</span>
          </>)}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleAutoGenerate} disabled={autoGenerating} style={{
            padding: '8px 14px', borderRadius: '10px', border: '1px solid #e5e7eb',
            backgroundColor: 'white', color: '#374151', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
          }}>{autoGenerating ? <FaSpinner size={11} className="animate-spin" /> : <FaRobot size={11} />} AI Generate</button>
          <button onClick={handleCopyWeek} disabled={copying} style={{
            padding: '8px 14px', borderRadius: '10px', border: '1px solid #e5e7eb',
            backgroundColor: 'white', color: '#374151', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
          }}>{copying ? <FaSpinner size={11} className="animate-spin" /> : <FaCopy size={11} />} Copy Week</button>
          {draftCount > 0 && (
            <button onClick={handlePublish} disabled={publishing} style={{
              padding: '8px 14px', borderRadius: '10px', border: 'none',
              backgroundColor: '#16a34a', color: 'white', fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}>{publishing ? <FaSpinner size={11} className="animate-spin" /> : <FaPaperPlane size={11} />} Publish ({draftCount})</button>
          )}
          <button onClick={handleAddClick} style={{
            padding: '8px 14px', borderRadius: '10px', border: 'none',
            background: '#dc2626', color: 'white',
            fontSize: '13px', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}><FaPlus size={11} /> Add Shift</button>
        </div>
      </div>

      {noticeBar}
      {pendingRequests > 0 && (
        <div style={{ marginBottom: '14px', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}>
          {pendingRequests} staff request(s) waiting — open the <b>Requests</b> tab to approve.
        </div>
      )}
      {coveragePanel}
      {/* Schedule Grid */}
      <div style={{
        backgroundColor: 'white', borderRadius: '16px', border: '1px solid #f1f5f9',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'auto'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{
                position: 'sticky', left: 0, zIndex: 3, backgroundColor: '#fafafa',
                padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 700,
                color: '#374151', borderBottom: '2px solid #f1f5f9', width: '180px', minWidth: '180px'
              }}>
                Team ({activeStaff.length})
              </th>
              {weekDates.map((date, i) => {
                const isCurrentDay = isSameDay(date, today);
                return (
                  <th key={i} style={{
                    padding: '10px 8px', textAlign: 'center', borderBottom: '2px solid #f1f5f9',
                    backgroundColor: '#fafafa', verticalAlign: 'top',
                    borderBottomColor: isCurrentDay ? '#dc2626' : '#f1f5f9'
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: isCurrentDay ? '#dc2626' : '#6b7280' }}>{DAYS_OF_WEEK[i]}{isCurrentDay ? ' · Today' : ''}</div>
                    <div style={{
                      fontSize: '20px', fontWeight: 700, color: '#111827',
                      lineHeight: 1.2
                    }}>{date.getDate()}</div>
                    <div style={{ minHeight: '14px', marginTop: '2px' }}>{dateIcons(dayDates[formatDateISO(date)] || [])}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {hasOpenShifts && (
              <tr>
                <td style={{ position: 'sticky', left: 0, zIndex: 1, backgroundColor: '#eff6ff', padding: '10px 12px', borderBottom: '1px solid #dbeafe', width: '180px', minWidth: '180px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#1e40af' }}><FaUserPlus size={12} /> Open shifts</div>
                  <div style={{ fontSize: '10.5px', color: '#3b82f6' }}>Staff can ask for these</div>
                </td>
                {weekDates.map((date, i) => (
                  <td key={i} style={{ padding: '6px', borderBottom: '1px solid #dbeafe', backgroundColor: '#f8fbff', verticalAlign: 'top' }}>{openCell(date)}</td>
                ))}
              </tr>
            )}
            {activeStaff.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
                  <FaCalendarAlt size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                  <p style={{ fontSize: '14px', fontWeight: 600 }}>No team members</p>
                  <p style={{ fontSize: '13px' }}>Add staff from the Team tab to start scheduling</p>
                </td>
              </tr>
            ) : activeStaff.map(member => {
              const rc = getRoleColor(member.role);
              return (
                <tr key={member.id}>
                  {/* Staff column */}
                  <td style={{
                    position: 'sticky', left: 0, zIndex: 1, backgroundColor: 'white',
                    padding: '10px 12px', borderBottom: '1px solid #f9fafb',
                    width: '180px', minWidth: '180px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '10px', backgroundColor: rc.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: 700, color: rc.text, flexShrink: 0
                      }}>{(member.name || '?')[0].toUpperCase()}</div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{
                          fontSize: '13px', fontWeight: 600, color: '#111827',
                          whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden'
                        }}>{member.name}</div>
                        <span style={{
                          fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '6px',
                          backgroundColor: rc.bg, color: rc.text, textTransform: 'capitalize'
                        }}>{member.role}</span>
                        {Array.isArray(member.extraRoles) && member.extraRoles.length > 0 && (
                          <span title={`Also works as ${member.extraRoles.join(', ')}`} style={{ fontSize: '10px', color: '#6b7280', marginLeft: '4px' }}>+{member.extraRoles.map(titleCase).join(', ')}</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Day cells */}
                  {weekDates.map((date, i) => {
                    const dateKey = formatDateISO(date);
                    const key = `${member.id}_${dateKey}`;
                    const cellShifts = shiftMap[key] || [];
                    const isCurrentDay = isSameDay(date, today);
                    const av = availabilityOn(availability[member.id], dateKey);
                    const mine = personDates(member.id, dateKey);
                    const onLeave = mine.some(e => e.kind === 'leave');
                    const cellBg = !av.available || onLeave ? '#f8fafc' : isCurrentDay ? '#fcfcfd' : 'white';
                    return (
                      <td
                        key={i}
                        title={!av.available ? av.reason : (av.slots?.length ? `Available ${slotsLabel(av.slots)}` : undefined)}
                        onClick={() => handleCellClick(member.id, date)}
                        style={{
                          padding: '6px', borderBottom: '1px solid #f9fafb',
                          backgroundColor: cellBg, position: 'relative',
                          cursor: 'pointer', verticalAlign: 'top',
                          transition: 'background-color 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = cellBg}
                      >
                        {mine.length > 0 && <div style={{ position: 'absolute', top: '3px', right: '5px', zIndex: 1 }}>{dateIcons(mine, 3)}</div>}
                        {onLeave && cellShifts.length === 0 && (
                          <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'center', paddingTop: '12px' }}>On leave</div>
                        )}
                        {!onLeave && !av.available && cellShifts.length === 0 && (
                          <div style={{ fontSize: '10px', color: '#9ca3af', textAlign: 'center', paddingTop: '12px' }}>Unavailable</div>
                        )}
                        {(!av.available || onLeave) && cellShifts.length === 0 ? null : cellShifts.length > 0 ? (
                          cellShifts.map(s => renderShiftBlock(s))
                        ) : (
                          <div style={{
                            height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: '8px', border: '1px dashed transparent',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.backgroundColor = '#fafafa'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                          >
                            <FaPlus size={10} style={{ color: '#d1d5db' }} />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ShiftFormModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingShift(null); setPrefill(null); }}
        onSave={handleSaveShift}
        shift={editingShift}
        staff={staff}
        date={modalDate}
        staffId={modalStaffId}
        isMobile={isMobile}
        shiftTypes={shiftTypes}
        extraRoles={shiftSettings?.extraRoles || []}
        availability={availability}
        prefill={prefill}
        dayDates={dayDates}
      />
    </div>
  );
}
