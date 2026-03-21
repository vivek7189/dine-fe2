'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../lib/api';
import {
  FaCalendarAlt, FaUsers, FaClock, FaUmbrellaBeach, FaCog, FaSpinner, FaStore
} from 'react-icons/fa';
import { DEFAULT_SHIFT_SETTINGS, getWeekStart, getWeekEnd, formatDateISO } from '../../../components/shifts/constants';
import WeeklyScheduleGrid from '../../../components/shifts/WeeklyScheduleGrid';
import TeamTab from '../../../components/shifts/TeamTab';
import AvailabilityTab from '../../../components/shifts/AvailabilityTab';
import TimeOffTab from '../../../components/shifts/TimeOffTab';
import SettingsTab from '../../../components/shifts/SettingsTab';

export default function ShiftsPage() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [staff, setStaff] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [shiftSettings, setShiftSettings] = useState(DEFAULT_SHIFT_SETTINGS);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

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
      if (rid) {
        setRestaurantId(rid);
        setRestaurantName(rData?.name || '');
      }
    } catch {}
  }, []);

  // Load staff + settings
  useEffect(() => {
    if (!restaurantId) return;
    const load = async () => {
      setLoading(true);
      try {
        const [staffRes, settingsRes] = await Promise.all([
          apiClient.getStaff(restaurantId),
          apiClient.getShiftSettings(restaurantId).catch(() => null),
        ]);
        setStaff(staffRes?.staff || []);
        if (settingsRes?.success && settingsRes.settings) {
          setShiftSettings(settingsRes.settings);
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [restaurantId]);

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
    { id: 'team', label: 'Team', mobileLabel: 'Team', icon: FaUsers },
    { id: 'availability', label: 'Availability', mobileLabel: 'Avail', icon: FaClock },
    { id: 'time-off', label: 'Time Off', mobileLabel: 'Off', icon: FaUmbrellaBeach },
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
        <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 800, color: '#111827', margin: 0 }}>
          Shift Scheduling
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>{restaurantName}</span>
          <span style={{
            padding: '2px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
            backgroundColor: '#f3f4f6', color: '#374151'
          }}>{activeStaff.length} staff</span>
          <span style={{
            padding: '2px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
            backgroundColor: '#dbeafe', color: '#1e40af'
          }}>{shifts.length} shifts this week</span>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fecdd3 100%)',
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
                color: isActive ? '#ffffff' : '#881b1b',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? '0 2px 8px rgba(239,68,68,0.3)' : 'none',
              }}
            >
              <Icon size={13} />
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
            />
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
            />
          )}

          {activeTab === 'time-off' && (
            <TimeOffTab
              restaurantId={restaurantId}
              staff={staff}
              shiftSettings={shiftSettings}
              setShiftSettings={setShiftSettings}
              isMobile={isMobile}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              restaurantId={restaurantId}
              shiftSettings={shiftSettings}
              setShiftSettings={setShiftSettings}
              isMobile={isMobile}
            />
          )}
        </>
      )}
    </div>
  );
}
