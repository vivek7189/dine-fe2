'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import apiClient from '../../../lib/api';
import * as attendanceApi from '../../../services/attendanceApi';
// import Pusher from 'pusher-js'; // COMMENTED OUT — replaced by Firebase RTDB
import { ref, onChildAdded, off, query, orderByChild, startAt } from 'firebase/database';
import { database } from '../../../../firebase';
import {
  FaCalendarAlt, FaClock, FaUmbrellaBeach, FaCog, FaSpinner, FaStore,
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaPlus, FaChevronLeft,
  FaChevronRight, FaSave, FaTrash, FaEdit, FaUserClock, FaMapMarkerAlt
} from 'react-icons/fa';

// Leaflet doesn't support SSR — dynamic import
const StaffTrackingMap = dynamic(() => import('../../../components/StaffTrackingMap'), { ssr: false });

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(d) {
  if (!d) return '-';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '-';
  return dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatMonthYear(d) {
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function toISODate(d) {
  const dt = new Date(d);
  return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
}

function toMonthStr(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

function diffHours(clockIn, clockOut) {
  if (!clockIn || !clockOut) return '-';
  const cin = new Date(clockIn);
  const cout = new Date(clockOut);
  if (isNaN(cin.getTime()) || isNaN(cout.getTime())) return '-';
  const ms = cout - cin;
  if (ms <= 0) return '-';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function lateBy(clockIn, expectedStart) {
  if (!clockIn || !expectedStart) return '-';
  const parts = expectedStart.split(':');
  const eh = parseInt(parts[0], 10);
  const em = parseInt(parts[1], 10);
  if (isNaN(eh) || isNaN(em)) return '-';
  const ci = new Date(clockIn);
  if (isNaN(ci.getTime())) return '-';
  const expected = new Date(ci);
  expected.setHours(eh, em, 0, 0);
  const diff = ci - expected;
  if (diff <= 0) return '-';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function getCalendarDays(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDay = (first.getDay() + 6) % 7; // Monday=0
  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

const STATUS_COLORS = {
  present: { bg: '#dcfce7', color: '#166534', label: 'Present' },
  absent: { bg: '#fee2e2', color: '#991b1b', label: 'Absent' },
  late: { bg: '#fef9c3', color: '#854d0e', label: 'Late' },
  'on-leave': { bg: '#dbeafe', color: '#1e40af', label: 'On Leave' },
  'half-day': { bg: '#fef3c7', color: '#92400e', label: 'Half Day' },
  'week-off': { bg: '#f3f4f6', color: '#6b7280', label: 'Week Off' },
  holiday: { bg: '#f3f4f6', color: '#6b7280', label: 'Holiday' },
};

const DOT_COLORS = {
  present: '#22c55e',
  absent: '#ef4444',
  late: '#eab308',
  'half-day': '#f59e0b',
  'on-leave': '#3b82f6',
  'week-off': '#9ca3af',
  holiday: '#9ca3af',
};

const LEAVE_STATUS_COLORS = {
  pending: { bg: '#fef9c3', color: '#854d0e' },
  approved: { bg: '#dcfce7', color: '#166534' },
  rejected: { bg: '#fee2e2', color: '#991b1b' },
};

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ── Shared Styles ────────────────────────────────────────────────────────────

const cardStyle = {
  background: '#fff',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  padding: '20px',
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
};

const selectStyle = { ...inputStyle, cursor: 'pointer' };

const btnPrimary = {
  padding: '10px 20px',
  background: '#ef4444',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
};

const btnSecondary = {
  ...btnPrimary,
  background: '#f3f4f6',
  color: '#374151',
};

const btnDanger = {
  ...btnPrimary,
  background: '#ef4444',
};

const btnSuccess = {
  ...btnPrimary,
  background: '#22c55e',
};

const labelStyle = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '4px',
  display: 'block',
};

// ── Main Component ───────────────────────────────────────────────────────────

export default function AttendancePage() {
  // Core state
  const [activeTab, setActiveTab] = useState('today');
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Toast notification
  const [toast, setToast] = useState(null);

  function showToast(message, type = 'info') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  // Today tab
  const [todayData, setTodayData] = useState({ attendance: [], staffCount: 0, presentCount: 0, absentCount: 0, lateCount: 0, onLeaveCount: 0 });
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualForm, setManualForm] = useState({ staffId: '', date: toISODate(new Date()), status: 'present', clockIn: '', clockOut: '', notes: '' });

  // Calendar tab
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState([]);
  const [selectedStaffFilter, setSelectedStaffFilter] = useState('all');
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayDetails, setDayDetails] = useState([]);

  // Leave tab
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ staffId: '', leaveType: '', startDate: '', endDate: '', halfDay: false, reason: '' });

  // Reject leave inline flow
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Settings tab
  const [leaveConfig, setLeaveConfig] = useState(null);
  const [settingsForm, setSettingsForm] = useState({
    workingHours: { start: '09:00', end: '22:00', lateGrace: 15 },
    leaveTypes: [],
    geoFence: { enabled: false, radius: 100, lat: '', lng: '', address: '' },
    weeklyOff: [],
    holidays: [],
    overtime: { enabled: false, thresholdHours: 10 },
    autoClockOut: { enabled: false, time: '23:00' },
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [newLeaveType, setNewLeaveType] = useState({ name: '', shortName: '', paidDays: 12, carryForward: false, color: '#ef4444' });
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '' });
  const [editingLeaveTypeIdx, setEditingLeaveTypeIdx] = useState(null);

  // Tracking tab
  const [liveLocations, setLiveLocations] = useState([]);
  const [trackingConfig, setTrackingConfig] = useState({ enabledStaffIds: [], enabledRoles: [] });
  const [routeHistory, setRouteHistory] = useState([]);
  const [selectedTrackingStaff, setSelectedTrackingStaff] = useState(null);
  const [trackingDate, setTrackingDate] = useState(toISODate(new Date()));
  const [trackingMapMode, setTrackingMapMode] = useState('live'); // 'live' | 'route'
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [savingTrackingConfig, setSavingTrackingConfig] = useState(false);
  const liveRefreshRef = useRef(null);

  // Responsive
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Load restaurant from localStorage
  useEffect(() => {
    try {
      const rid = localStorage.getItem('selectedRestaurantId');
      const rData = JSON.parse(localStorage.getItem('selectedRestaurant') || 'null');
      const uData = JSON.parse(localStorage.getItem('user') || 'null');
      if (rid) {
        setRestaurantId(rid);
        setRestaurantName(rData?.name || '');
      }
      if (uData) {
        setUserRole(uData.role || '');
        setUserId(uData.staffId || uData._id || '');
      }
    } catch {}
  }, []);

  // Listen for restaurant changes
  useEffect(() => {
    const handler = (e) => {
      const newId = e.detail?.restaurantId;
      if (newId) setRestaurantId(newId);
    };
    window.addEventListener('restaurantChanged', handler);
    return () => window.removeEventListener('restaurantChanged', handler);
  }, []);

  const isAdmin = ['admin', 'owner', 'manager'].includes(userRole);

  // Load staff
  useEffect(() => {
    if (!restaurantId) return;
    apiClient.getStaff(restaurantId).then(res => {
      // Normalize: API returns `id` but some code uses `_id` — ensure both exist
      const staff = (res?.staff || []).filter(s => s.status === 'active').map(s => ({
        ...s,
        _id: s._id || s.id,
        id: s.id || s._id,
      }));
      setStaffList(staff);
    }).catch(() => {});
  }, [restaurantId]);

  // ── Data Loading ─────────────────────────────────────────────────────────

  const loadToday = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const res = await attendanceApi.getTodayAttendance(restaurantId);
      const attendance = res?.attendance || [];
      const presentCount = attendance.filter(a => a.status === 'present').length;
      const absentCount = attendance.filter(a => a.status === 'absent').length;
      const lateCount = attendance.filter(a => a.status === 'late').length;
      const onLeaveCount = attendance.filter(a => a.status === 'on-leave').length;
      setTodayData({
        attendance,
        staffCount: staffList.length,
        presentCount,
        absentCount,
        lateCount,
        onLeaveCount,
      });
    } catch (err) {
      console.error('Error loading today attendance:', err);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, staffList.length]);

  const loadCalendar = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const y = calendarMonth.getFullYear();
      const m = calendarMonth.getMonth();
      const startDate = toISODate(new Date(y, m, 1));
      const endDate = toISODate(new Date(y, m + 1, 0));
      const params = { startDate, endDate };
      if (selectedStaffFilter !== 'all') params.staffId = selectedStaffFilter;
      const res = await attendanceApi.getAttendanceHistory(restaurantId, params);
      setCalendarData(res?.history || res?.attendance || []);
    } catch (err) {
      console.error('Error loading calendar:', err);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, calendarMonth, selectedStaffFilter]);

  const loadLeave = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const [pendingRes, historyRes] = await Promise.all([
        attendanceApi.getLeaveRequests(restaurantId, { status: 'pending' }).catch(() => ({ requests: [] })),
        attendanceApi.getLeaveRequests(restaurantId, {}).catch(() => ({ requests: [] })),
      ]);
      setLeaveRequests(pendingRes?.requests || []);
      setLeaveHistory((historyRes?.requests || []).filter(r => r.status !== 'pending'));

      // Load balances for all staff (admin) or just current user
      const balancesArr = [];
      const staffToLoad = isAdmin ? staffList : staffList.filter(s => s._id === userId);
      for (const s of staffToLoad.slice(0, 50)) {
        try {
          const bal = await attendanceApi.getLeaveBalances(restaurantId, s._id);
          balancesArr.push({ staffId: s._id, staffName: s.name, balances: bal?.balances || {} });
        } catch {}
      }
      setLeaveBalances(balancesArr);
    } catch (err) {
      console.error('Error loading leave:', err);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, staffList, isAdmin, userId]);

  const loadSettings = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const res = await attendanceApi.getLeaveConfig(restaurantId);
      const config = res?.config || res || {};
      setLeaveConfig(config);
      setSettingsForm({
        workingHours: {
          start: config.workStartTime || config.workingHours?.start || '09:00',
          end: config.workEndTime || config.workingHours?.end || '18:00',
          lateGrace: config.lateGracePeriod ?? config.workingHours?.lateGrace ?? 15,
        },
        leaveTypes: (config.leaveTypes || []).map(lt => ({
          id: lt.id,
          name: lt.name,
          shortName: lt.shortName,
          paidDays: lt.paidLeaves || lt.paidDays || 0,
          carryForward: lt.carryForward || false,
          maxCarryForward: lt.maxCarryForward || 0,
          color: lt.color || '#ef4444',
        })),
        geoFence: {
          enabled: config.geoFenceEnabled || config.geoFence?.enabled || false,
          radius: config.geoFenceRadius || config.geoFence?.radius || 150,
          lat: config.geoFenceLocation?.lat || config.geoFence?.lat || '',
          lng: config.geoFenceLocation?.lng || config.geoFence?.lng || '',
          address: config.geoFenceLocation?.address || config.geoFence?.address || '',
        },
        weeklyOff: config.weeklyOff || [0],
        holidays: config.holidays || [],
        overtime: {
          enabled: config.overtimeEnabled || config.overtime?.enabled || false,
          thresholdHours: config.overtimeAfterHours || config.overtime?.thresholdHours || 9,
        },
        autoClockOut: {
          enabled: config.autoClockOutEnabled || config.autoClockOut?.enabled || false,
          time: config.autoClockOutTime || config.autoClockOut?.time || '23:59',
        },
      });
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  // ── Tracking Tab Loaders ──────────────────────────────────────────────

  const loadTrackingData = useCallback(async () => {
    if (!restaurantId) return;
    setLoadingTracking(true);
    try {
      const [liveRes, configRes] = await Promise.all([
        attendanceApi.getLiveLocations(restaurantId),
        attendanceApi.getTrackingConfig(restaurantId),
      ]);
      setLiveLocations(liveRes?.locations || []);
      setTrackingConfig(configRes || { enabledStaffIds: [], enabledRoles: [] });
    } catch (err) {
      console.error('Error loading tracking data:', err);
    } finally {
      setLoadingTracking(false);
    }
  }, [restaurantId]);

  const loadRouteHistory = useCallback(async (staffId, date) => {
    if (!restaurantId || !staffId || !date) return;
    try {
      const res = await attendanceApi.getLocationHistory(restaurantId, staffId, date);
      setRouteHistory(res?.locations || []);
    } catch (err) {
      console.error('Error loading route history:', err);
      setRouteHistory([]);
    }
  }, [restaurantId]);

  // Load data on mount and tab change
  useEffect(() => {
    if (!restaurantId) return;
    if (activeTab === 'today') loadToday();
    if (activeTab === 'calendar') loadCalendar();
    if (activeTab === 'leave') loadLeave();
    if (activeTab === 'settings') loadSettings();
    if (activeTab === 'tracking') loadTrackingData();
  }, [activeTab, restaurantId, loadToday, loadCalendar, loadLeave, loadSettings, loadTrackingData]);

  // Auto-refresh live locations every 30s when on tracking tab
  useEffect(() => {
    if (activeTab === 'tracking' && restaurantId) {
      liveRefreshRef.current = setInterval(() => {
        attendanceApi.getLiveLocations(restaurantId).then(res => {
          setLiveLocations(res?.locations || []);
        }).catch(() => {});
      }, 300000); // 5-minute fallback (real-time updates come via Firebase RTDB)
      return () => clearInterval(liveRefreshRef.current);
    }
    return () => clearInterval(liveRefreshRef.current);
  }, [activeTab, restaurantId]);

  // Firebase RTDB real-time location updates
  useEffect(() => {
    if (activeTab !== 'tracking' || !restaurantId || !database) return;

    const now = Date.now();
    const eventsRef = query(
      ref(database, `events/${restaurantId}/tables`),
      orderByChild('ts'),
      startAt(now)
    );

    const handler = (snapshot) => {
      const event = snapshot.val();
      if (!event) return;
      if (event.type !== 'staff-location-updated') return;
      const data = event;
      setLiveLocations(prev => {
        const idx = prev.findIndex(l => l.staffId === data.staffId);
        const updated = {
          staffId: data.staffId,
          staffName: data.staffName,
          lat: data.lat,
          lng: data.lng,
          speed: data.speed,
          heading: data.heading,
          timestamp: data.timestamp,
        };
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], ...updated };
          return copy;
        }
        return [...prev, updated];
      });
    };

    onChildAdded(eventsRef, handler);

    return () => {
      off(eventsRef, 'child_added', handler);
    };
  }, [activeTab, restaurantId]);

  // ── Tracking Handlers ────────────────────────────────────────────────────

  const handleToggleStaffTracking = (staffId) => {
    setTrackingConfig(prev => {
      const ids = [...(prev.enabledStaffIds || [])];
      const idx = ids.indexOf(staffId);
      if (idx >= 0) ids.splice(idx, 1);
      else ids.push(staffId);
      return { ...prev, enabledStaffIds: ids };
    });
  };

  const handleSaveTrackingConfig = async () => {
    if (!restaurantId) return;
    setSavingTrackingConfig(true);
    try {
      await attendanceApi.saveTrackingConfig(restaurantId, trackingConfig);
      showToast('Tracking config saved', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save tracking config', 'error');
    } finally {
      setSavingTrackingConfig(false);
    }
  };

  const handleViewRoute = (staffId) => {
    setSelectedTrackingStaff(staffId);
    setTrackingMapMode('route');
    loadRouteHistory(staffId, trackingDate);
  };

  const handleBackToLive = () => {
    setSelectedTrackingStaff(null);
    setTrackingMapMode('live');
    setRouteHistory([]);
  };

  // ── Action Handlers ──────────────────────────────────────────────────────

  const handleManualEntry = async () => {
    if (!manualForm.staffId || !manualForm.date) return showToast('Staff and date are required', 'error');
    try {
      const staff = staffList.find(s => s._id === manualForm.staffId);
      // Convert time strings (e.g., "11:34") to full ISO datetime using the selected date
      let clockInISO = null;
      let clockOutISO = null;
      if (manualForm.clockIn) {
        const [h, m] = manualForm.clockIn.split(':').map(Number);
        const d = new Date(manualForm.date + 'T00:00:00');
        d.setHours(h, m, 0, 0);
        clockInISO = d.toISOString();
      }
      if (manualForm.clockOut) {
        const [h, m] = manualForm.clockOut.split(':').map(Number);
        const d = new Date(manualForm.date + 'T00:00:00');
        d.setHours(h, m, 0, 0);
        clockOutISO = d.toISOString();
      }
      await attendanceApi.addManualEntry(restaurantId, {
        staffId: manualForm.staffId,
        date: manualForm.date,
        status: manualForm.status,
        clockIn: clockInISO,
        clockOut: clockOutISO,
        notes: manualForm.notes,
        staffName: staff?.name || '',
        role: staff?.role || '',
      });
      showToast('Manual entry added successfully', 'success');
      setShowManualEntry(false);
      setManualForm({ staffId: '', date: toISODate(new Date()), status: 'present', clockIn: '', clockOut: '', notes: '' });
      loadToday();
    } catch (err) {
      showToast(err.message || 'Failed to add manual entry', 'error');
    }
  };

  const handleApplyLeave = async () => {
    if (!leaveForm.staffId || !leaveForm.leaveType || !leaveForm.startDate || !leaveForm.endDate) {
      return showToast('Please fill all required fields', 'error');
    }
    try {
      const staff = staffList.find(s => s._id === leaveForm.staffId);
      await attendanceApi.applyLeave(restaurantId, {
        ...leaveForm,
        staffName: staff?.name || '',
      });
      showToast('Leave application submitted successfully', 'success');
      setShowLeaveForm(false);
      setLeaveForm({ staffId: '', leaveType: '', startDate: '', endDate: '', halfDay: false, reason: '' });
      loadLeave();
    } catch (err) {
      showToast(err.message || 'Failed to apply leave', 'error');
    }
  };

  const handleApproveLeave = async (leaveId) => {
    try {
      await attendanceApi.approveLeave(restaurantId, leaveId);
      showToast('Leave approved successfully', 'success');
      loadLeave();
    } catch (err) {
      showToast(err.message || 'Failed to approve leave', 'error');
    }
  };

  const handleRejectLeave = async (leaveId, reason) => {
    try {
      await attendanceApi.rejectLeave(restaurantId, leaveId, reason || '');
      showToast('Leave rejected', 'success');
      setRejectingId(null);
      setRejectReason('');
      loadLeave();
    } catch (err) {
      showToast(err.message || 'Failed to reject leave', 'error');
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const config = {
        workStartTime: settingsForm.workingHours.start,
        workEndTime: settingsForm.workingHours.end,
        lateGracePeriod: settingsForm.workingHours.lateGrace,
        leaveTypes: settingsForm.leaveTypes.map(lt => ({
          id: lt.shortName?.toLowerCase() || lt.id,
          name: lt.name,
          shortName: lt.shortName,
          paidLeaves: lt.paidDays || lt.paidLeaves || 0,
          carryForward: lt.carryForward || false,
          maxCarryForward: lt.maxCarryForward || 0,
          color: lt.color || '#ef4444',
        })),
        geoFenceEnabled: settingsForm.geoFence.enabled,
        geoFenceRadius: parseInt(settingsForm.geoFence.radius) || 150,
        geoFenceLocation: settingsForm.geoFence.enabled ? {
          lat: parseFloat(settingsForm.geoFence.lat) || 0,
          lng: parseFloat(settingsForm.geoFence.lng) || 0,
          address: settingsForm.geoFence.address || '',
        } : null,
        weeklyOff: settingsForm.weeklyOff,
        holidays: settingsForm.holidays,
        overtimeEnabled: settingsForm.overtime.enabled,
        overtimeAfterHours: settingsForm.overtime.thresholdHours || 9,
        autoClockOutEnabled: settingsForm.autoClockOut.enabled,
        autoClockOutTime: settingsForm.autoClockOut.time || '23:59',
      };
      await attendanceApi.saveLeaveConfig(restaurantId, config);
      showToast('Settings saved successfully', 'success');
      loadSettings();
    } catch (err) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const addLeaveType = () => {
    if (!newLeaveType.name || !newLeaveType.shortName) return showToast('Name and short name required', 'error');
    setSettingsForm(prev => ({
      ...prev,
      leaveTypes: [...prev.leaveTypes, { ...newLeaveType }],
    }));
    setNewLeaveType({ name: '', shortName: '', paidDays: 12, carryForward: false, color: '#ef4444' });
  };

  const removeLeaveType = (idx) => {
    setSettingsForm(prev => ({
      ...prev,
      leaveTypes: prev.leaveTypes.filter((_, i) => i !== idx),
    }));
  };

  const addHoliday = () => {
    if (!newHoliday.date || !newHoliday.name) return showToast('Date and name required', 'error');
    setSettingsForm(prev => ({
      ...prev,
      holidays: [...prev.holidays, { ...newHoliday }].sort((a, b) => a.date.localeCompare(b.date)),
    }));
    setNewHoliday({ date: '', name: '' });
  };

  const removeHoliday = (idx) => {
    setSettingsForm(prev => ({
      ...prev,
      holidays: prev.holidays.filter((_, i) => i !== idx),
    }));
  };

  // Calendar day click
  const handleDayClick = (day) => {
    if (!day) return;
    const y = calendarMonth.getFullYear();
    const m = calendarMonth.getMonth();
    const dateStr = toISODate(new Date(y, m, day));
    setSelectedDay(dateStr);
    const details = calendarData.filter(a => {
      const aDate = toISODate(new Date(a.date));
      return aDate === dateStr;
    });
    setDayDetails(details);
  };

  // Calendar helpers
  const getDayStatuses = (day) => {
    if (!day) return [];
    const y = calendarMonth.getFullYear();
    const m = calendarMonth.getMonth();
    const dateStr = toISODate(new Date(y, m, day));
    return calendarData.filter(a => toISODate(new Date(a.date)) === dateStr);
  };

  // ── Tab Config ───────────────────────────────────────────────────────────

  const allTabs = [
    { id: 'today', label: "Today's Attendance", mobileLabel: 'Today', icon: FaUserClock },
    { id: 'calendar', label: 'Calendar', mobileLabel: 'Calendar', icon: FaCalendarAlt },
    { id: 'leave', label: 'Leave', mobileLabel: 'Leave', icon: FaUmbrellaBeach },
    ...(isAdmin ? [{ id: 'tracking', label: 'Live Tracking', mobileLabel: 'Tracking', icon: FaMapMarkerAlt }] : []),
    { id: 'settings', label: 'Settings', mobileLabel: 'Settings', icon: FaCog },
  ];
  const tabs = allTabs;

  // ── No Restaurant ────────────────────────────────────────────────────────

  if (!restaurantId) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <FaStore size={40} style={{ color: '#d1d5db', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Select a Restaurant</h2>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>Go to Admin &rarr; General Settings to select your restaurant first.</p>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: isMobile ? '16px' : '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 10000,
          padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          animation: 'slideIn 0.3s ease',
          backgroundColor: toast.type === 'success' ? '#dcfce7' : toast.type === 'error' ? '#fee2e2' : '#fef2f2',
          color: toast.type === 'success' ? '#166534' : toast.type === 'error' ? '#991b1b' : '#991b1b',
          border: `1px solid ${toast.type === 'success' ? '#bbf7d0' : toast.type === 'error' ? '#fecaca' : '#fecaca'}`,
        }}>
          {toast.type === 'success' ? <FaCheckCircle /> : toast.type === 'error' ? <FaTimesCircle /> : <FaExclamationTriangle />}
          {toast.message}
          <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '8px', opacity: 0.6 }}>&times;</button>
        </div>
      )}
      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 800, color: '#111827', margin: 0 }}>
          Attendance
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>{restaurantName}</span>
          <span style={{
            padding: '2px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
            backgroundColor: '#f3f4f6', color: '#374151'
          }}>{staffList.length} staff</span>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 50%, #fecaca 100%)',
        borderRadius: '16px',
        padding: '6px',
        display: 'flex',
        gap: '4px',
        marginBottom: '24px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: isMobile ? 'none' : 1,
                padding: isMobile ? '10px 14px' : '12px 20px',
                borderRadius: '12px',
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'transparent',
                color: isActive ? '#ffffff' : '#991b1b',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? '0 2px 8px rgba(239, 68, 68, 0.3)' : 'none',
              }}
            >
              <Icon size={13} />
              {isMobile ? tab.mobileLabel : tab.label}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <FaSpinner size={24} style={{ color: '#ef4444', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Tab Content */}
      {!loading && activeTab === 'today' && renderTodayTab()}
      {!loading && activeTab === 'calendar' && renderCalendarTab()}
      {!loading && activeTab === 'leave' && renderLeaveTab()}
      {!loading && activeTab === 'tracking' && isAdmin && renderTrackingTab()}
      {!loading && activeTab === 'settings' && renderSettingsTab()}
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  //  TAB 1: TODAY
  // ══════════════════════════════════════════════════════════════════════════

  function renderTodayTab() {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const attendance = isAdmin ? todayData.attendance : todayData.attendance.filter(a => a.staffId === userId);

    return (
      <div>
        {/* Date & Summary */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '15px', color: '#6b7280', margin: '0 0 16px 0' }}>{dateStr}</p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px' }}>
            {[
              { label: 'Present', count: todayData.presentCount, color: '#22c55e', bg: '#f0fdf4' },
              { label: 'Absent', count: todayData.absentCount, color: '#ef4444', bg: '#fef2f2' },
              { label: 'Late', count: todayData.lateCount, color: '#eab308', bg: '#fefce8' },
              { label: 'On Leave', count: todayData.onLeaveCount, color: '#3b82f6', bg: '#eff6ff' },
            ].map(card => (
              <div key={card.label} style={{ ...cardStyle, background: card.bg, textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: card.color }}>{card.count}</div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{card.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action button */}
        {isAdmin && (
          <div style={{ marginBottom: '16px' }}>
            <button style={btnPrimary} onClick={() => setShowManualEntry(!showManualEntry)}>
              <FaPlus size={12} /> Add Manual Entry
            </button>
          </div>
        )}

        {/* Manual Entry Form */}
        {showManualEntry && (
          <div style={{ ...cardStyle, marginBottom: '20px', border: '1px solid #fecaca' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 16px 0' }}>Manual Attendance Entry</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Staff *</label>
                <select style={selectStyle} value={manualForm.staffId} onChange={e => setManualForm(p => ({ ...p, staffId: e.target.value }))}>
                  <option value="">Select Staff</option>
                  {staffList.map(s => <option key={s._id} value={s._id}>{s.name} ({s.role})</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Date *</label>
                <input type="date" style={inputStyle} value={manualForm.date} onChange={e => setManualForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select style={selectStyle} value={manualForm.status} onChange={e => setManualForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="half-day">Half Day</option>
                  <option value="on-leave">On Leave</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Clock In</label>
                <input type="time" style={inputStyle} value={manualForm.clockIn} onChange={e => setManualForm(p => ({ ...p, clockIn: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Clock Out</label>
                <input type="time" style={inputStyle} value={manualForm.clockOut} onChange={e => setManualForm(p => ({ ...p, clockOut: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Notes</label>
                <input type="text" style={inputStyle} placeholder="Optional notes" value={manualForm.notes} onChange={e => setManualForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <button style={btnPrimary} onClick={handleManualEntry}>Save Entry</button>
              <button style={btnSecondary} onClick={() => setShowManualEntry(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Staff Attendance Table */}
        <div style={{ ...cardStyle, overflowX: 'auto' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 16px 0' }}>Staff Attendance</h3>
          {attendance.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9ca3af', padding: '30px 0', fontSize: '14px' }}>No attendance records for today</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  {['Staff Name', 'Role', 'Clock In', 'Clock Out', 'Status', 'Hours', 'Late By'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attendance.map((a, i) => {
                  const sc = STATUS_COLORS[a.status] || STATUS_COLORS.present;
                  // Resolve name/role from staffList if not in attendance record
                  const staff = staffList.find(s => s._id === a.staffId || s.id === a.staffId);
                  const displayName = a.staffName || staff?.name || '-';
                  const displayRole = a.role || staff?.role || '-';
                  return (
                    <tr key={a._id || a.id || i} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px' }}>{displayName}</td>
                      <td style={{ padding: '12px', color: '#6b7280' }}>{displayRole}</td>
                      <td style={{ padding: '12px' }}>{formatTime(a.clockIn)}</td>
                      <td style={{ padding: '12px' }}>{formatTime(a.clockOut)}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                          backgroundColor: sc.bg, color: sc.color,
                        }}>{sc.label}</span>
                      </td>
                      <td style={{ padding: '12px' }}>{diffHours(a.clockIn, a.clockOut)}</td>
                      <td style={{ padding: '12px', color: a.status === 'late' ? '#854d0e' : '#6b7280' }}>
                        {lateBy(a.clockIn, settingsForm.workingHours?.start || '09:00')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TAB 2: CALENDAR
  // ══════════════════════════════════════════════════════════════════════════

  function renderCalendarTab() {
    const y = calendarMonth.getFullYear();
    const m = calendarMonth.getMonth();
    const days = getCalendarDays(y, m);
    const todayStr = toISODate(new Date());

    return (
      <div>
        {/* Month Navigation & Staff Filter */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={{ ...btnSecondary, padding: '8px 12px' }} onClick={() => setCalendarMonth(new Date(y, m - 1, 1))}>
              <FaChevronLeft size={12} />
            </button>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#111827', minWidth: '160px', textAlign: 'center' }}>
              {formatMonthYear(calendarMonth)}
            </span>
            <button style={{ ...btnSecondary, padding: '8px 12px' }} onClick={() => setCalendarMonth(new Date(y, m + 1, 1))}>
              <FaChevronRight size={12} />
            </button>
          </div>
          <div>
            <select style={{ ...selectStyle, width: 'auto', minWidth: '180px' }} value={selectedStaffFilter} onChange={e => setSelectedStaffFilter(e.target.value)}>
              <option value="all">All Staff</option>
              {staffList.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        {/* Calendar Grid */}
        <div style={cardStyle}>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', marginBottom: '8px' }}>
            {SHORT_DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#6b7280', padding: '8px 0' }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {days.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} style={{ minHeight: '70px' }} />;
              const dateStr = toISODate(new Date(y, m, day));
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDay;
              const statuses = getDayStatuses(day);

              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick(day)}
                  style={{
                    minHeight: '70px',
                    padding: '6px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: isSelected ? '2px solid #ef4444' : isToday ? '2px solid #fca5a5' : '1px solid #f3f4f6',
                    background: isSelected ? '#fef2f2' : isToday ? '#fff5f5' : '#fff',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f9fafb'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isToday ? '#fff5f5' : '#fff'; }}
                >
                  <div style={{
                    fontSize: '13px', fontWeight: isToday ? 700 : 500,
                    color: isToday ? '#ef4444' : '#374151', marginBottom: '4px'
                  }}>{day}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                    {statuses.slice(0, 6).map((s, si) => (
                      <div key={si} style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        backgroundColor: DOT_COLORS[s.status] || '#9ca3af',
                      }} title={`${s.staffName}: ${s.status}`} />
                    ))}
                    {statuses.length > 6 && (
                      <span style={{ fontSize: '9px', color: '#9ca3af' }}>+{statuses.length - 6}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
          {Object.entries(DOT_COLORS).map(([status, color]) => (
            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color }} />
              {STATUS_COLORS[status]?.label || status}
            </div>
          ))}
        </div>

        {/* Selected Day Details */}
        {selectedDay && (
          <div style={{ ...cardStyle, marginTop: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 16px 0' }}>
              Attendance for {formatDate(selectedDay)}
            </h3>
            {dayDetails.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '14px' }}>No records for this day</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    {['Staff Name', 'Status', 'Clock In', 'Clock Out', 'Hours'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dayDetails.map((a, i) => {
                    const sc = STATUS_COLORS[a.status] || STATUS_COLORS.present;
                    const calStaff = staffList.find(s => s._id === a.staffId || s.id === a.staffId);
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '10px 12px' }}>{a.staffName || calStaff?.name || '-'}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, backgroundColor: sc.bg, color: sc.color }}>{sc.label}</span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>{formatTime(a.clockIn)}</td>
                        <td style={{ padding: '10px 12px' }}>{formatTime(a.clockOut)}</td>
                        <td style={{ padding: '10px 12px' }}>{diffHours(a.clockIn, a.clockOut)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TAB 3: LEAVE
  // ══════════════════════════════════════════════════════════════════════════

  function renderLeaveTab() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Apply Leave Button */}
        <div>
          <button style={btnPrimary} onClick={() => setShowLeaveForm(!showLeaveForm)}>
            <FaPlus size={12} /> Apply Leave
          </button>
        </div>

        {/* Leave Application Form */}
        {showLeaveForm && (
          <div style={{ ...cardStyle, border: '1px solid #fecaca' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 16px 0' }}>Apply for Leave</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Staff *</label>
                <select style={selectStyle} value={leaveForm.staffId} onChange={e => setLeaveForm(p => ({ ...p, staffId: e.target.value }))}>
                  <option value="">Select Staff</option>
                  {(isAdmin ? staffList : staffList.filter(s => s._id === userId)).map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Leave Type *</label>
                <select style={selectStyle} value={leaveForm.leaveType} onChange={e => setLeaveForm(p => ({ ...p, leaveType: e.target.value }))}>
                  <option value="">Select Type</option>
                  {(settingsForm.leaveTypes || []).map(lt => (
                    <option key={lt.shortName} value={lt.shortName}>{lt.name} ({lt.shortName})</option>
                  ))}
                  <option value="CL">Casual Leave</option>
                  <option value="SL">Sick Leave</option>
                  <option value="EL">Earned Leave</option>
                  <option value="LWP">Leave Without Pay</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Start Date *</label>
                <input type="date" style={inputStyle} value={leaveForm.startDate} onChange={e => setLeaveForm(p => ({ ...p, startDate: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>End Date *</label>
                <input type="date" style={inputStyle} value={leaveForm.endDate} onChange={e => setLeaveForm(p => ({ ...p, endDate: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '24px' }}>
                <input type="checkbox" id="halfDay" checked={leaveForm.halfDay} onChange={e => setLeaveForm(p => ({ ...p, halfDay: e.target.checked }))} />
                <label htmlFor="halfDay" style={{ fontSize: '14px', color: '#374151', cursor: 'pointer' }}>Half Day</label>
              </div>
              <div>
                <label style={labelStyle}>Reason</label>
                <input type="text" style={inputStyle} placeholder="Reason for leave" value={leaveForm.reason} onChange={e => setLeaveForm(p => ({ ...p, reason: e.target.value }))} />
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <button style={btnPrimary} onClick={handleApplyLeave}>Submit</button>
              <button style={btnSecondary} onClick={() => setShowLeaveForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Pending Requests */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 12px 0' }}>Pending Requests</h3>
          {leaveRequests.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', color: '#9ca3af', fontSize: '14px', padding: '30px' }}>
              No pending leave requests
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '12px' }}>
              {leaveRequests.map(req => (
                <div key={req.id} style={{ ...cardStyle, border: '1px solid #fef3c7' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{req.staffName}</div>
                      <span style={{
                        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                        backgroundColor: '#fee2e2', color: '#991b1b', marginTop: '4px', display: 'inline-block'
                      }}>{req.leaveType}</span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>{formatDate(req.appliedOn || req.createdAt)}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0' }}>
                    {formatDate(req.startDate)} - {formatDate(req.endDate)}
                    {req.halfDay && <span style={{ marginLeft: '8px', fontSize: '11px', color: '#f59e0b' }}>(Half Day)</span>}
                  </p>
                  {req.reason && <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0' }}>Reason: {req.reason}</p>}
                  {isAdmin && (
                    <div style={{ marginTop: '12px' }}>
                      {rejectingId === req.id ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <input
                            type="text"
                            style={{ ...inputStyle, width: 'auto', flex: 1, minWidth: '150px' }}
                            placeholder="Rejection reason (optional)"
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                          />
                          <button style={{ ...btnDanger, padding: '6px 16px', fontSize: '13px' }} onClick={() => handleRejectLeave(req.id, rejectReason)}>
                            Confirm Reject
                          </button>
                          <button style={{ ...btnSecondary, padding: '6px 16px', fontSize: '13px' }} onClick={() => { setRejectingId(null); setRejectReason(''); }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button style={{ ...btnSuccess, padding: '6px 16px', fontSize: '13px' }} onClick={() => handleApproveLeave(req.id)}>
                            <FaCheckCircle size={12} /> Approve
                          </button>
                          <button style={{ ...btnDanger, padding: '6px 16px', fontSize: '13px' }} onClick={() => setRejectingId(req.id)}>
                            <FaTimesCircle size={12} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leave History */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 16px 0' }}>Leave History</h3>
          {leaveHistory.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px 0', fontSize: '14px' }}>No leave history</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    {['Staff', 'Type', 'Dates', 'Days', 'Status', 'Applied On'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leaveHistory.map((req, i) => {
                    const sc = LEAVE_STATUS_COLORS[req.status] || LEAVE_STATUS_COLORS.pending;
                    const startD = new Date(req.startDate);
                    const endD = new Date(req.endDate);
                    const days = Math.max(1, Math.ceil((endD - startD) / 86400000) + 1);
                    return (
                      <tr key={req.id || i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '10px 12px' }}>{req.staffName}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, backgroundColor: '#fee2e2', color: '#991b1b' }}>
                            {req.leaveType}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: '13px' }}>
                          {formatDate(req.startDate)} - {formatDate(req.endDate)}
                        </td>
                        <td style={{ padding: '10px 12px' }}>{req.halfDay ? '0.5' : days}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, backgroundColor: sc.bg, color: sc.color }}>
                            {req.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: '13px', color: '#6b7280' }}>{formatDate(req.appliedOn || req.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Balance Overview */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 12px 0' }}>Balance Overview</h3>
          {leaveBalances.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', color: '#9ca3af', fontSize: '14px', padding: '30px' }}>
              No balance data available. Configure leave types in Settings and initialize balances.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr) ', gap: '12px' }}>
              {leaveBalances.map(staff => (
                <div key={staff.staffId} style={cardStyle}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>{staff.staffName}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {Object.entries(staff.balances).map(([type, bal]) => {
                      const used = (bal.total || 0) - (bal.remaining || 0);
                      return (
                        <div key={type} style={{
                          padding: '8px 14px', borderRadius: '10px', background: '#fef2f2',
                          textAlign: 'center', minWidth: '80px'
                        }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444', marginBottom: '2px' }}>{type}</div>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>
                            {bal.remaining ?? '-'}<span style={{ fontSize: '12px', color: '#9ca3af' }}>/{bal.total ?? '-'}</span>
                          </div>
                          <div style={{ fontSize: '10px', color: '#6b7280' }}>{used} used</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TAB 4: SETTINGS
  // ══════════════════════════════════════════════════════════════════════════

  function renderSettingsTab() {
    if (!isAdmin) {
      return (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '40px' }}>
          <FaCog size={32} style={{ color: '#d1d5db', marginBottom: '12px' }} />
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Only admins, managers, and owners can access settings.</p>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Working Hours */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 16px 0' }}>Working Hours</h3>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Start Time</label>
              <input type="time" style={inputStyle} value={settingsForm.workingHours.start}
                onChange={e => setSettingsForm(p => ({ ...p, workingHours: { ...p.workingHours, start: e.target.value } }))} />
            </div>
            <div>
              <label style={labelStyle}>End Time</label>
              <input type="time" style={inputStyle} value={settingsForm.workingHours.end}
                onChange={e => setSettingsForm(p => ({ ...p, workingHours: { ...p.workingHours, end: e.target.value } }))} />
            </div>
            <div>
              <label style={labelStyle}>Late Grace Period (minutes)</label>
              <input type="number" style={inputStyle} min="0" max="120" value={settingsForm.workingHours.lateGrace}
                onChange={e => setSettingsForm(p => ({ ...p, workingHours: { ...p.workingHours, lateGrace: parseInt(e.target.value) || 0 } }))} />
            </div>
          </div>
        </div>

        {/* Leave Types */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 16px 0' }}>Leave Types</h3>
          {settingsForm.leaveTypes.length > 0 && (
            <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {settingsForm.leaveTypes.map((lt, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px',
                  borderRadius: '8px', background: '#f9fafb', border: '1px solid #e5e7eb', flexWrap: 'wrap',
                }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: lt.color || '#ef4444', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{lt.name}</span>
                    <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '6px' }}>({lt.shortName})</span>
                  </div>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>{lt.paidDays} days/yr</span>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                    backgroundColor: lt.carryForward ? '#dcfce7' : '#f3f4f6',
                    color: lt.carryForward ? '#166534' : '#6b7280',
                  }}>
                    {lt.carryForward ? 'Carry Forward' : 'No Carry'}
                  </span>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                    onClick={() => removeLeaveType(idx)} title="Delete">
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* Add new leave type */}
          <div style={{ padding: '14px', borderRadius: '8px', border: '1px dashed #d1d5db', background: '#fafafa' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', marginBottom: '10px' }}>Add Leave Type</div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(5, 1fr)', gap: '10px', alignItems: 'end' }}>
              <div>
                <label style={labelStyle}>Name</label>
                <input style={inputStyle} placeholder="Casual Leave" value={newLeaveType.name}
                  onChange={e => setNewLeaveType(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Short Name</label>
                <input style={inputStyle} placeholder="CL" value={newLeaveType.shortName}
                  onChange={e => setNewLeaveType(p => ({ ...p, shortName: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Paid Days/Year</label>
                <input type="number" style={inputStyle} min="0" value={newLeaveType.paidDays}
                  onChange={e => setNewLeaveType(p => ({ ...p, paidDays: parseInt(e.target.value) || 0 }))} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="carryFwd" checked={newLeaveType.carryForward}
                  onChange={e => setNewLeaveType(p => ({ ...p, carryForward: e.target.checked }))} />
                <label htmlFor="carryFwd" style={{ fontSize: '13px', color: '#374151', cursor: 'pointer' }}>Carry Forward</label>
                <input type="color" value={newLeaveType.color} style={{ width: '30px', height: '30px', border: 'none', cursor: 'pointer' }}
                  onChange={e => setNewLeaveType(p => ({ ...p, color: e.target.value }))} />
              </div>
              <button style={{ ...btnPrimary, justifyContent: 'center' }} onClick={addLeaveType}>
                <FaPlus size={11} /> Add
              </button>
            </div>
          </div>
        </div>

        {/* Geo-Fence */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>Geo-Fence</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={settingsForm.geoFence.enabled}
                onChange={e => setSettingsForm(p => ({ ...p, geoFence: { ...p.geoFence, enabled: e.target.checked } }))} />
              <span style={{ fontSize: '13px', color: '#374151' }}>Enable</span>
            </label>
          </div>
          {settingsForm.geoFence.enabled && (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Radius (meters)</label>
                <input type="number" style={inputStyle} min="10" value={settingsForm.geoFence.radius}
                  onChange={e => setSettingsForm(p => ({ ...p, geoFence: { ...p.geoFence, radius: parseInt(e.target.value) || 100 } }))} />
              </div>
              <div>
                <label style={labelStyle}>Latitude</label>
                <input style={inputStyle} placeholder="19.0760" value={settingsForm.geoFence.lat}
                  onChange={e => setSettingsForm(p => ({ ...p, geoFence: { ...p.geoFence, lat: e.target.value } }))} />
              </div>
              <div>
                <label style={labelStyle}>Longitude</label>
                <input style={inputStyle} placeholder="72.8777" value={settingsForm.geoFence.lng}
                  onChange={e => setSettingsForm(p => ({ ...p, geoFence: { ...p.geoFence, lng: e.target.value } }))} />
              </div>
              <div>
                <label style={labelStyle}>Address</label>
                <input style={inputStyle} placeholder="Restaurant address" value={settingsForm.geoFence.address}
                  onChange={e => setSettingsForm(p => ({ ...p, geoFence: { ...p.geoFence, address: e.target.value } }))} />
              </div>
            </div>
          )}
        </div>

        {/* Weekly Off */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 16px 0' }}>Weekly Off</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {DAYS_OF_WEEK.map((day, idx) => (
              <label key={day} style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
                borderRadius: '8px', cursor: 'pointer',
                border: settingsForm.weeklyOff.includes(idx) ? '2px solid #ef4444' : '1px solid #e5e7eb',
                background: settingsForm.weeklyOff.includes(idx) ? '#fef2f2' : '#fff',
              }}>
                <input type="checkbox" checked={settingsForm.weeklyOff.includes(idx)}
                  onChange={e => {
                    setSettingsForm(p => ({
                      ...p,
                      weeklyOff: e.target.checked
                        ? [...p.weeklyOff, idx]
                        : p.weeklyOff.filter(d => d !== idx),
                    }));
                  }} />
                <span style={{ fontSize: '13px', fontWeight: settingsForm.weeklyOff.includes(idx) ? 600 : 400, color: '#374151' }}>{day}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Holidays */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 16px 0' }}>Holidays</h3>
          {settingsForm.holidays.length > 0 && (
            <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {settingsForm.holidays.map((h, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 14px', borderRadius: '8px', background: '#f9fafb', border: '1px solid #e5e7eb',
                }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '14px', marginRight: '12px' }}>{formatDate(h.date)}</span>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>{h.name}</span>
                  </div>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                    onClick={() => removeHoliday(idx)} title="Delete">
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'end', flexWrap: 'wrap' }}>
            <div>
              <label style={labelStyle}>Date</label>
              <input type="date" style={{ ...inputStyle, width: 'auto' }} value={newHoliday.date}
                onChange={e => setNewHoliday(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={labelStyle}>Holiday Name</label>
              <input style={inputStyle} placeholder="e.g. Diwali" value={newHoliday.name}
                onChange={e => setNewHoliday(p => ({ ...p, name: e.target.value }))} />
            </div>
            <button style={btnPrimary} onClick={addHoliday}>
              <FaPlus size={11} /> Add Holiday
            </button>
          </div>
        </div>

        {/* Overtime */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>Overtime</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={settingsForm.overtime.enabled}
                onChange={e => setSettingsForm(p => ({ ...p, overtime: { ...p.overtime, enabled: e.target.checked } }))} />
              <span style={{ fontSize: '13px', color: '#374151' }}>Enable</span>
            </label>
          </div>
          {settingsForm.overtime.enabled && (
            <div style={{ maxWidth: '300px' }}>
              <label style={labelStyle}>Threshold Hours (daily)</label>
              <input type="number" style={inputStyle} min="1" max="24" value={settingsForm.overtime.thresholdHours}
                onChange={e => setSettingsForm(p => ({ ...p, overtime: { ...p.overtime, thresholdHours: parseInt(e.target.value) || 10 } }))} />
              <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Hours worked beyond this count as overtime</p>
            </div>
          )}
        </div>

        {/* Auto Clock-Out */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>Auto Clock-Out</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={settingsForm.autoClockOut.enabled}
                onChange={e => setSettingsForm(p => ({ ...p, autoClockOut: { ...p.autoClockOut, enabled: e.target.checked } }))} />
              <span style={{ fontSize: '13px', color: '#374151' }}>Enable</span>
            </label>
          </div>
          {settingsForm.autoClockOut.enabled && (
            <div style={{ maxWidth: '300px' }}>
              <label style={labelStyle}>Auto Clock-Out Time</label>
              <input type="time" style={inputStyle} value={settingsForm.autoClockOut.time}
                onChange={e => setSettingsForm(p => ({ ...p, autoClockOut: { ...p.autoClockOut, time: e.target.value } }))} />
              <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Staff will be automatically clocked out at this time</p>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button style={{ ...btnPrimary, padding: '12px 32px', fontSize: '15px' }} onClick={handleSaveSettings} disabled={savingSettings}>
            {savingSettings ? <FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <FaSave size={14} />}
            {savingSettings ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TAB 5: LIVE TRACKING
  // ══════════════════════════════════════════════════════════════════════════

  function renderTrackingTab() {
    const restaurantLoc = settingsForm.geoFence.lat && settingsForm.geoFence.lng
      ? { lat: parseFloat(settingsForm.geoFence.lat), lng: parseFloat(settingsForm.geoFence.lng) }
      : null;
    const geoRadius = parseInt(settingsForm.geoFence.radius) || 150;

    // Load geofence from config if not in settingsForm yet
    if (!restaurantLoc && leaveConfig) {
      const gf = leaveConfig.geoFenceLocation || leaveConfig.geoFence;
      if (gf?.lat && gf?.lng) {
        // will use leaveConfig values
      }
    }
    const effectiveLoc = restaurantLoc || (leaveConfig?.geoFenceLocation?.lat ? {
      lat: leaveConfig.geoFenceLocation.lat,
      lng: leaveConfig.geoFenceLocation.lng,
    } : null);

    const selectedStaffName = staffList.find(s => s._id === selectedTrackingStaff)?.name || '';

    return (
      <div style={{ display: 'flex', gap: '16px', flexDirection: isMobile ? 'column' : 'row', minHeight: '500px' }}>
        {/* Left Panel — Staff List & Config */}
        <div style={{ width: isMobile ? '100%' : '340px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Mode Toggle */}
          <div style={{ ...cardStyle, padding: '12px 16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                style={{
                  ...btnPrimary,
                  flex: 1,
                  background: trackingMapMode === 'live' ? '#3b82f6' : '#f3f4f6',
                  color: trackingMapMode === 'live' ? '#fff' : '#374151',
                  padding: '8px 12px', fontSize: '13px', justifyContent: 'center',
                }}
                onClick={handleBackToLive}
              >
                <FaMapMarkerAlt size={12} /> Live Map
              </button>
              <button
                style={{
                  ...btnPrimary,
                  flex: 1,
                  background: trackingMapMode === 'route' ? '#3b82f6' : '#f3f4f6',
                  color: trackingMapMode === 'route' ? '#fff' : '#374151',
                  padding: '8px 12px', fontSize: '13px', justifyContent: 'center',
                }}
                onClick={() => setTrackingMapMode('route')}
              >
                <FaClock size={12} /> Route Replay
              </button>
            </div>
          </div>

          {/* Route Replay Controls */}
          {trackingMapMode === 'route' && (
            <div style={cardStyle}>
              <label style={labelStyle}>Select Staff</label>
              <select
                style={{ ...selectStyle, marginBottom: '10px' }}
                value={selectedTrackingStaff || ''}
                onChange={(e) => {
                  setSelectedTrackingStaff(e.target.value);
                  if (e.target.value && trackingDate) {
                    loadRouteHistory(e.target.value, trackingDate);
                  }
                }}
              >
                <option value="">Choose staff...</option>
                {staffList.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.role})</option>
                ))}
              </select>
              <label style={labelStyle}>Date</label>
              <input
                type="date"
                style={inputStyle}
                value={trackingDate}
                onChange={(e) => {
                  setTrackingDate(e.target.value);
                  if (selectedTrackingStaff && e.target.value) {
                    loadRouteHistory(selectedTrackingStaff, e.target.value);
                  }
                }}
              />
              {selectedTrackingStaff && (
                <div style={{ marginTop: '10px', fontSize: '13px', color: '#6b7280' }}>
                  Showing route for <strong>{selectedStaffName}</strong> on {trackingDate}
                </div>
              )}
            </div>
          )}

          {/* Tracking Config — Enable/Disable per staff */}
          <div style={{ ...cardStyle, flex: 1, overflow: 'auto', maxHeight: isMobile ? '300px' : '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>Staff Tracking</h3>
              <button
                style={{ ...btnPrimary, padding: '6px 12px', fontSize: '12px' }}
                onClick={handleSaveTrackingConfig}
                disabled={savingTrackingConfig}
              >
                {savingTrackingConfig ? <FaSpinner size={10} style={{ animation: 'spin 1s linear infinite' }} /> : <FaSave size={10} />}
                Save
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {staffList.map(staff => {
                const isEnabled = (trackingConfig.enabledStaffIds || []).includes(staff._id);
                const isOnline = liveLocations.some(l => l.staffId === staff._id);
                const isClockedIn = todayData.attendance.some(a => a.staffId === staff._id && a.clockIn && !a.clockOut);
                return (
                  <div key={staff._id} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 10px', borderRadius: '8px',
                    background: isOnline ? '#f0fdf4' : '#fff',
                    cursor: 'pointer',
                  }} onClick={() => {
                    if (trackingMapMode === 'route') {
                      handleViewRoute(staff._id);
                    }
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: isOnline ? '#d1fae5' : '#f3f4f6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 700,
                      color: isOnline ? '#059669' : '#9ca3af',
                      position: 'relative',
                    }}>
                      {(staff.name || 'S').charAt(0).toUpperCase()}
                      {isOnline && (
                        <div style={{
                          position: 'absolute', bottom: '-1px', right: '-1px',
                          width: '10px', height: '10px', borderRadius: '50%',
                          background: '#10b981', border: '2px solid #fff',
                        }} />
                      )}
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {staff.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                        {staff.role}
                        {isClockedIn && <span style={{ color: '#10b981', marginLeft: '6px' }}>Clocked in</span>}
                        {isOnline && <span style={{ color: '#3b82f6', marginLeft: '6px' }}>Live</span>}
                      </div>
                    </div>
                    {/* Toggle */}
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => handleToggleStaffTracking(staff._id)}
                        style={{ width: '16px', height: '16px', accentColor: '#3b82f6', cursor: 'pointer' }}
                      />
                    </label>
                  </div>
                );
              })}
              {staffList.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: '13px' }}>
                  No staff found
                </div>
              )}
            </div>
          </div>

          {/* Live count indicator */}
          {trackingMapMode === 'live' && (
            <div style={{
              ...cardStyle, padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: '8px',
              background: liveLocations.length > 0 ? '#f0fdf4' : '#f8fafc',
            }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: liveLocations.length > 0 ? '#10b981' : '#d1d5db',
              }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                {liveLocations.length} staff tracked live
              </span>
              <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: 'auto' }}>
                Updates every 30s
              </span>
            </div>
          )}
        </div>

        {/* Right Panel — Map */}
        <div style={{
          flex: 1, minHeight: isMobile ? '350px' : '500px',
          borderRadius: '12px', overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
          />
          {loadingTracking ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#f8fafc' }}>
              <FaSpinner size={24} style={{ color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <StaffTrackingMap
              mode={trackingMapMode}
              liveLocations={liveLocations}
              routeHistory={routeHistory}
              selectedStaff={selectedTrackingStaff}
              restaurantLocation={effectiveLoc}
              geoFenceRadius={geoRadius}
            />
          )}
        </div>
      </div>
    );
  }
}
