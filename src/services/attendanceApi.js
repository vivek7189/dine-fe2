const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

async function fetchWithAuth(url, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

const base = (restaurantId) => `${BASE_URL}/api/attendance/${restaurantId}`;

// POST /clock-in
export function clockIn(restaurantId, { staffId, staffName, location }) {
  return fetchWithAuth(`${base(restaurantId)}/clock-in`, {
    method: 'POST',
    body: JSON.stringify({ staffId, staffName, location }),
  });
}

// POST /clock-out
export function clockOut(restaurantId, { staffId, location }) {
  return fetchWithAuth(`${base(restaurantId)}/clock-out`, {
    method: 'POST',
    body: JSON.stringify({ staffId, location }),
  });
}

// GET /today
export function getTodayAttendance(restaurantId) {
  return fetchWithAuth(`${base(restaurantId)}/today`);
}

// GET /history?startDate=&endDate=&staffId=&status=
export function getAttendanceHistory(restaurantId, { startDate, endDate, staffId, status } = {}) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (staffId) params.append('staffId', staffId);
  if (status) params.append('status', status);
  const query = params.toString();
  return fetchWithAuth(`${base(restaurantId)}/history${query ? `?${query}` : ''}`);
}

// GET /summary?month=YYYY-MM
export function getAttendanceSummary(restaurantId, month) {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  return fetchWithAuth(`${base(restaurantId)}/summary?${params}`);
}

// POST /manual-entry
export function addManualEntry(restaurantId, data) {
  return fetchWithAuth(`${base(restaurantId)}/manual-entry`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// POST /leave/apply
export function applyLeave(restaurantId, data) {
  return fetchWithAuth(`${base(restaurantId)}/leave/apply`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// PATCH /leave/:id/approve
export function approveLeave(restaurantId, leaveId) {
  return fetchWithAuth(`${base(restaurantId)}/leave/${leaveId}/approve`, {
    method: 'PATCH',
  });
}

// PATCH /leave/:id/reject
export function rejectLeave(restaurantId, leaveId, reason) {
  return fetchWithAuth(`${base(restaurantId)}/leave/${leaveId}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}

// GET /leave/requests?status=&staffId=
export function getLeaveRequests(restaurantId, { status, staffId } = {}) {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (staffId) params.append('staffId', staffId);
  const query = params.toString();
  return fetchWithAuth(`${base(restaurantId)}/leave/requests${query ? `?${query}` : ''}`);
}

// GET /leave/balances/:staffId
export function getLeaveBalances(restaurantId, staffId) {
  return fetchWithAuth(`${base(restaurantId)}/leave/balances/${staffId}`);
}

// GET /leave/config
export function getLeaveConfig(restaurantId) {
  return fetchWithAuth(`${base(restaurantId)}/leave/config`);
}

// PUT /leave/config
export function saveLeaveConfig(restaurantId, config) {
  return fetchWithAuth(`${base(restaurantId)}/leave/config`, {
    method: 'PUT',
    body: JSON.stringify(config),
  });
}

// POST /leave/config/init-balances
export function initLeaveBalances(restaurantId, year) {
  return fetchWithAuth(`${base(restaurantId)}/leave/config/init-balances`, {
    method: 'POST',
    body: JSON.stringify({ year }),
  });
}

// GET /payroll-data?month=YYYY-MM
export function getPayrollData(restaurantId, month) {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  return fetchWithAuth(`${base(restaurantId)}/payroll-data?${params}`);
}

// ── Location Tracking APIs ──────────────────────────────────

// GET /live-locations
export function getLiveLocations(restaurantId) {
  return fetchWithAuth(`${base(restaurantId)}/live-locations`);
}

// GET /location-history/:staffId?date=YYYY-MM-DD
export function getLocationHistory(restaurantId, staffId, date) {
  return fetchWithAuth(`${base(restaurantId)}/location-history/${staffId}?date=${date}`);
}

// GET /tracking-config
export function getTrackingConfig(restaurantId) {
  return fetchWithAuth(`${base(restaurantId)}/tracking-config`);
}

// PUT /tracking-config
export function saveTrackingConfig(restaurantId, config) {
  return fetchWithAuth(`${base(restaurantId)}/tracking-config`, {
    method: 'PUT',
    body: JSON.stringify(config),
  });
}
