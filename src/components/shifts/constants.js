// Role colors for shift blocks and badges
export const ROLE_COLORS = {
  owner:      { bg: '#fef3c7', text: '#92400e', border: '#fde68a', block: '#f59e0b' },
  admin:      { bg: '#ede9fe', text: '#5b21b6', border: '#ddd6fe', block: '#8b5cf6' },
  manager:    { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe', block: '#3b82f6' },
  supervisor: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0', block: '#10b981' },
  chef:       { bg: '#fee2e2', text: '#991b1b', border: '#fecaca', block: '#ef4444' },
  cook:       { bg: '#ffedd5', text: '#9a3412', border: '#fed7aa', block: '#f97316' },
  waiter:     { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe', block: '#6366f1' },
  cashier:    { bg: '#cffafe', text: '#155e75', border: '#a5f3fc', block: '#06b6d4' },
  employee:   { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb', block: '#6b7280' },
};

export const getRoleColor = (role) => ROLE_COLORS[role] || ROLE_COLORS.employee;

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DAYS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const DEFAULT_SHIFT_SETTINGS = {
  shiftTypes: [
    { name: 'Breakfast', startTime: '06:00', endTime: '11:00', requiredEmployees: 3, requiredRoles: { cook: 1, server: 2 }, color: '#FFCC00' },
    { name: 'Lunch', startTime: '11:00', endTime: '15:00', requiredEmployees: 5, requiredRoles: { cook: 2, server: 2, bartender: 1 }, color: '#00CCFF' },
    { name: 'Dinner', startTime: '17:00', endTime: '23:00', requiredEmployees: 6, requiredRoles: { cook: 2, server: 3, bartender: 1 }, color: '#FF6B6B' },
  ],
  operatingHours: { start: '06:00', end: '23:00' },
  peakHours: { lunch: { start: '12:00', end: '14:00' }, dinner: { start: '19:00', end: '21:00' } },
  minRestHours: 8,
  maxHoursPerWeek: 40,
  maxHoursPerDay: 8,
  timeOff: [],
  timeOffRequests: [],
};

export const BREAK_OPTIONS = [
  { value: 0, label: 'No break' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
];

export const ALL_ROLES = [
  'owner', 'admin', 'manager', 'supervisor', 'chef', 'cook', 'waiter', 'cashier', 'employee'
];

// Format time for display (24h → 12h short)
export const formatTime = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'p' : 'a';
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m === 0 ? `${hour}${period}` : `${hour}:${m.toString().padStart(2, '0')}${period}`;
};

// Get Monday of the week for a given date
export const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

// Get Sunday of the week for a given date
export const getWeekEnd = (date) => {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
};

// Format date as YYYY-MM-DD
export const formatDateISO = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Get array of 7 dates for the week
export const getWeekDates = (weekStart) => {
  const start = getWeekStart(weekStart);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
};

// Check if two dates are the same day
export const isSameDay = (d1, d2) => {
  return formatDateISO(d1) === formatDateISO(d2);
};
