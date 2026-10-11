'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../lib/api';
import {
  FaCalendarAlt, FaUsers, FaClock, FaCog, FaSpinner, FaStore, FaInbox, FaChartBar, FaBirthdayCake, FaBolt
} from 'react-icons/fa';
import { DEFAULT_SHIFT_SETTINGS, getWeekStart, getWeekEnd, formatDateISO } from '../../../components/shifts/constants';
import WeeklyScheduleGrid from '../../../components/shifts/WeeklyScheduleGrid';
import TeamTab from '../../../components/shifts/TeamTab';
import AvailabilityTab from '../../../components/shifts/AvailabilityTab';
import RequestsTab from '../../../components/shifts/RequestsTab';
import HoursTab from '../../../components/shifts/HoursTab';
import SettingsTab from '../../../components/shifts/SettingsTab';
import UrgentNeedModal from '../../../components/shifts/UrgentNeedModal';
import CalendarTab from '../../../components/shifts/CalendarTab';

export default function ShiftsPage() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [urgentOpen, setUrgentOpen] = useState(false);
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [staff, setStaff] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [shiftSettings, setShiftSettings] = useState(DEFAULT_SHIFT_SETTINGS);
  // The saved settings really arrived. Until then the form holds defaults, and saving it would
  // overwrite the restaurant's real shift types / hours / notifications with them.
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [availability, setAvailability] = useState({}); // staffId → { availability, unavailableDates }
  const [weekDates, setWeekDates] = useState([]);        // birthdays / anniversaries / important days / leave this week

  const loadAvailability = useCallback(async () => {
    if (!restaurantId) return;
    try { const r = await apiClient.getAllStaffAvailability(restaurantId); setAvailability(r?.availability || {}); }
    catch { setAvailability({}); }
  }, [restaurantId]);
  useEffect(() => { loadAvailability(); }, [loadAvailability]);

  // Responsive
  useEffect(() => {
    // Electron is always a desktop POS terminal — never use mobile layout
    if (typeof window !== 'undefined' && window.electronAPI) {
      setIsMobile(false);
      return;
    }
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
      if (rid) {
        setRestaurantId(rid);
        setRestaurantName(rData?.name || '');
      }
    } catch {}
  }, []);

  const loadSettings = useCallback(async () => {
    if (!restaurantId) return;
    setSettingsLoaded(false);
    try {
      const settingsRes = await apiClient.getShiftSettings(restaurantId);
      if (settingsRes?.success && settingsRes.settings) {
        setShiftSettings(settingsRes.settings);
        setSettingsLoaded(true);
      }
    } catch (err) {
      console.error('Error loading shift settings:', err);
    }
  }, [restaurantId]);

  // Load staff + settings
  useEffect(() => {
    if (!restaurantId) return;
    const load = async () => {
      setLoading(true);
      try {
        const [staffRes] = await Promise.all([
          apiClient.getStaff(restaurantId),
          loadSettings(),
        ]);
        setStaff(staffRes?.staff || []);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [restaurantId, loadSettings]);

  // Load shifts for current week
  const loadShifts = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const start = formatDateISO(getWeekStart(currentWeek));
      const end = formatDateISO(getWeekEnd(currentWeek));
      const res = await apiClient.getShifts(restaurantId, start, end);
      setShifts(res?.shifts || res || []);
    } catch (err) {
      console.error('Error loading shifts:', err);
      setShifts([]);
    }
  }, [restaurantId, currentWeek]);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  // Staff dates for the rota headers (never blocks the schedule).
  useEffect(() => {
    if (!restaurantId) return;
    let alive = true;
    apiClient.getStaffDates(restaurantId, formatDateISO(getWeekStart(currentWeek)), formatDateISO(getWeekEnd(currentWeek)))
      .then(r => { if (alive) setWeekDates(r?.events || []); }).catch(() => { if (alive) setWeekDates([]); });
    return () => { alive = false; };
  }, [restaurantId, currentWeek, activeTab]);

  // Listen for restaurant changes
  useEffect(() => {
    const handler = (e) => {
      const newId = e.detail?.restaurantId;
      if (newId) setRestaurantId(newId);
    };
    window.addEventListener('restaurantChanged', handler);
    return () => window.removeEventListener('restaurantChanged', handler);
  }, []);

  const tabs = [
    { id: 'schedule', label: 'Schedule', mobileLabel: 'Schedule', icon: FaCalendarAlt },
    { id: 'calendar', label: 'Calendar', mobileLabel: 'Calendar', icon: FaBirthdayCake },
    { id: 'team', label: 'Team', mobileLabel: 'Team', icon: FaUsers },
    { id: 'availability', label: 'Availability', mobileLabel: 'Avail', icon: FaClock },
    { id: 'requests', label: 'Requests', mobileLabel: 'Requests', icon: FaInbox },
    { id: 'hours', label: 'Hours', mobileLabel: 'Hours', icon: FaChartBar },
    { id: 'settings', label: 'Settings', mobileLabel: 'Settings', icon: FaCog },
  ];

  const activeStaff = staff.filter(s => s.status === 'active');

  if (!restaurantId) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <FaStore size={40} style={{ color: '#d1d5db', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Select a Restaurant</h2>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>Go to Admin → General Settings to select your restaurant first.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? '16px' : '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: 800, color: '#111827', margin: 0 }}>
            Shift Scheduling
          </h1>
          <button type="button" onClick={() => setUrgentOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid #fecaca', background: '#fff', color: '#b91c1c', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
            <FaBolt size={11} /> Need extra staff now
          </button>
        </div>
        {urgentOpen && (
          <UrgentNeedModal restaurantId={restaurantId} staff={staff} shifts={shifts}
            onClose={() => setUrgentOpen(false)} onDone={() => loadShifts()} />
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '13px', color: '#6b7280', flexWrap: 'wrap' }}>
          {restaurantName && <><span>{restaurantName}</span><span>·</span></>}
          <span>{activeStaff.length} staff</span>
          <span>·</span>
          <span>{shifts.length} shifts this week</span>
        </div>
      </div>

      {/* Tab Bar — underline tabs, one accent for the open tab */}
      <div role="tablist" style={{
        display: 'flex', gap: isMobile ? '2px' : '6px', marginBottom: '20px', borderBottom: '1px solid #e5e7eb',
        overflowX: 'auto', WebkitOverflowScrolling: 'touch',
      }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: isMobile ? '10px 12px' : '11px 16px',
                border: 'none',
                borderBottom: `2px solid ${isActive ? '#dc2626' : 'transparent'}`,
                marginBottom: '-1px',
                background: 'transparent',
                color: isActive ? '#111827' : '#6b7280',
                fontSize: '13.5px',
                fontWeight: isActive ? 700 : 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={12} style={{ opacity: isActive ? 1 : 0.7 }} />
              {isMobile ? tab.mobileLabel : tab.label}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
          <FaSpinner size={24} className="animate-spin" style={{ marginBottom: '12px' }} />
          <p style={{ fontSize: '14px' }}>Loading shifts...</p>
        </div>
      ) : (
        <>
          {activeTab === 'schedule' && (
            <WeeklyScheduleGrid
              restaurantId={restaurantId}
              staff={staff}
              shifts={shifts}
              setShifts={setShifts}
              currentWeek={currentWeek}
              setCurrentWeek={setCurrentWeek}
              onReloadShifts={loadShifts}
              shiftSettings={shiftSettings}
              isMobile={isMobile}
              availability={availability}
              staffDates={weekDates}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarTab restaurantId={restaurantId} staff={staff} isMobile={isMobile} />
          )}

          {activeTab === 'requests' && (
            <RequestsTab restaurantId={restaurantId} onChanged={loadShifts} isMobile={isMobile} />
          )}

          {activeTab === 'hours' && (
            <HoursTab restaurantId={restaurantId} isMobile={isMobile} />
          )}

          {activeTab === 'team' && (
            <TeamTab
              restaurantId={restaurantId}
              staff={staff}
              setStaff={setStaff}
              isMobile={isMobile}
            />
          )}

          {activeTab === 'availability' && (
            <AvailabilityTab
              restaurantId={restaurantId}
              staff={staff}
              isMobile={isMobile}
              onAvailabilityChanged={loadAvailability}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              restaurantId={restaurantId}
              shiftSettings={shiftSettings}
              setShiftSettings={setShiftSettings}
              settingsLoaded={settingsLoaded}
              onRetryLoad={loadSettings}
              isMobile={isMobile}
              staff={staff}
            />
          )}
        </>
      )}
    </div>
  );
}
