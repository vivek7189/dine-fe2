'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet default icon path issue in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker with staff initial
function createStaffIcon(initial, color) {
  return L.divIcon({
    className: 'staff-marker',
    html: `<div style="
      width:32px;height:32px;border-radius:50%;
      background:${color};color:#fff;
      display:flex;align-items:center;justify-content:center;
      font-weight:700;font-size:14px;
      border:3px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
    ">${initial}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

// Restaurant marker
function createRestaurantIcon() {
  return L.divIcon({
    className: 'restaurant-marker',
    html: `<div style="
      width:36px;height:36px;border-radius:50%;
      background:#ef4444;color:#fff;
      display:flex;align-items:center;justify-content:center;
      font-size:18px;
      border:3px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
    ">🏪</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

// Start marker (green)
function createStartIcon() {
  return L.divIcon({
    className: 'start-marker',
    html: `<div style="
      width:24px;height:24px;border-radius:50%;
      background:#10b981;color:#fff;
      display:flex;align-items:center;justify-content:center;
      font-size:12px;font-weight:700;
      border:2px solid #fff;
      box-shadow:0 2px 4px rgba(0,0,0,0.3);
    ">S</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
}

// End marker (red)
function createEndIcon() {
  return L.divIcon({
    className: 'end-marker',
    html: `<div style="
      width:24px;height:24px;border-radius:50%;
      background:#ef4444;color:#fff;
      display:flex;align-items:center;justify-content:center;
      font-size:12px;font-weight:700;
      border:2px solid #fff;
      box-shadow:0 2px 4px rgba(0,0,0,0.3);
    ">E</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
}

// Auto-fit map bounds
function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [bounds, map]);
  return null;
}

const STAFF_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

function formatTimeShort(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function StaffTrackingMap({
  mode = 'live', // 'live' | 'route'
  liveLocations = [],
  routeHistory = [],
  selectedStaff = null,
  restaurantLocation = null, // { lat, lng }
  geoFenceRadius = 150,
}) {
  const mapRef = useRef(null);

  // Calculate bounds
  let bounds = [];
  if (mode === 'live') {
    liveLocations.forEach(loc => bounds.push([loc.lat, loc.lng]));
    if (restaurantLocation) bounds.push([restaurantLocation.lat, restaurantLocation.lng]);
  } else if (mode === 'route' && routeHistory.length > 0) {
    routeHistory.forEach(loc => bounds.push([loc.lat, loc.lng]));
    if (restaurantLocation) bounds.push([restaurantLocation.lat, restaurantLocation.lng]);
  }

  // Default center (Mumbai if nothing else)
  const defaultCenter = restaurantLocation
    ? [restaurantLocation.lat, restaurantLocation.lng]
    : bounds.length > 0
      ? bounds[0]
      : [19.076, 72.8777];

  // Route polyline positions
  const routePositions = routeHistory.map(loc => [loc.lat, loc.lng]);

  // Calculate route stats
  let totalDistance = 0;
  if (routeHistory.length > 1) {
    for (let i = 1; i < routeHistory.length; i++) {
      const R = 6371000;
      const dLat = ((routeHistory[i].lat - routeHistory[i - 1].lat) * Math.PI) / 180;
      const dLng = ((routeHistory[i].lng - routeHistory[i - 1].lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((routeHistory[i - 1].lat * Math.PI) / 180) *
        Math.cos((routeHistory[i].lat * Math.PI) / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      totalDistance += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
      <MapContainer
        ref={mapRef}
        center={defaultCenter}
        zoom={15}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {bounds.length > 0 && <FitBounds bounds={bounds} />}

        {/* Restaurant marker + geofence circle */}
        {restaurantLocation && (
          <>
            <Marker position={[restaurantLocation.lat, restaurantLocation.lng]} icon={createRestaurantIcon()}>
              <Popup>Restaurant Location</Popup>
            </Marker>
            <Circle
              center={[restaurantLocation.lat, restaurantLocation.lng]}
              radius={geoFenceRadius}
              pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.08, weight: 2, dashArray: '6 4' }}
            />
          </>
        )}

        {/* Live mode: staff markers */}
        {mode === 'live' && liveLocations.map((loc, i) => {
          const initial = (loc.staffName || 'S').charAt(0).toUpperCase();
          const color = STAFF_COLORS[i % STAFF_COLORS.length];
          const timeSince = loc.timestamp
            ? Math.round((Date.now() - new Date(loc.timestamp).getTime()) / 60000)
            : null;
          return (
            <Marker key={loc.staffId} position={[loc.lat, loc.lng]} icon={createStaffIcon(initial, color)}>
              <Popup>
                <div style={{ minWidth: '140px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{loc.staffName || 'Staff'}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Last update: {timeSince != null ? `${timeSince} min ago` : 'Unknown'}
                  </div>
                  {loc.speed != null && loc.speed > 0 && (
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      Speed: {(loc.speed * 3.6).toFixed(1)} km/h
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Route mode: polyline + start/end markers */}
        {mode === 'route' && routeHistory.length > 0 && (
          <>
            <Polyline
              positions={routePositions}
              pathOptions={{ color: '#3b82f6', weight: 3, opacity: 0.8 }}
            />
            <Marker position={routePositions[0]} icon={createStartIcon()}>
              <Popup>
                <div style={{ fontWeight: 600 }}>Start</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {formatTimeShort(routeHistory[0].timestamp)}
                </div>
              </Popup>
            </Marker>
            <Marker position={routePositions[routePositions.length - 1]} icon={createEndIcon()}>
              <Popup>
                <div style={{ fontWeight: 600 }}>End</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {formatTimeShort(routeHistory[routeHistory.length - 1].timestamp)}
                </div>
              </Popup>
            </Marker>
          </>
        )}
      </MapContainer>

      {/* Route stats overlay */}
      {mode === 'route' && routeHistory.length > 0 && (
        <div style={{
          position: 'absolute', bottom: '12px', left: '12px', zIndex: 1000,
          background: '#fff', borderRadius: '10px', padding: '10px 14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          display: 'flex', gap: '16px', fontSize: '12px',
        }}>
          <div>
            <div style={{ color: '#9ca3af', fontWeight: 500 }}>Distance</div>
            <div style={{ fontWeight: 700, color: '#111827' }}>
              {totalDistance > 1000 ? `${(totalDistance / 1000).toFixed(1)} km` : `${Math.round(totalDistance)} m`}
            </div>
          </div>
          <div>
            <div style={{ color: '#9ca3af', fontWeight: 500 }}>Points</div>
            <div style={{ fontWeight: 700, color: '#111827' }}>{routeHistory.length}</div>
          </div>
          <div>
            <div style={{ color: '#9ca3af', fontWeight: 500 }}>Duration</div>
            <div style={{ fontWeight: 700, color: '#111827' }}>
              {routeHistory.length > 1
                ? (() => {
                    const mins = Math.round((new Date(routeHistory[routeHistory.length - 1].timestamp) - new Date(routeHistory[0].timestamp)) / 60000);
                    return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
                  })()
                : '--'}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {mode === 'live' && liveLocations.length === 0 && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          zIndex: 1000, background: 'rgba(255,255,255,0.95)', borderRadius: '12px',
          padding: '24px 32px', textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📍</div>
          <div style={{ fontWeight: 600, color: '#374151', marginBottom: '4px' }}>No Active Tracking</div>
          <div style={{ fontSize: '13px', color: '#9ca3af' }}>Staff locations will appear here when they clock in with tracking enabled</div>
        </div>
      )}

      {mode === 'route' && routeHistory.length === 0 && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          zIndex: 1000, background: 'rgba(255,255,255,0.95)', borderRadius: '12px',
          padding: '24px 32px', textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🗺️</div>
          <div style={{ fontWeight: 600, color: '#374151', marginBottom: '4px' }}>No Route Data</div>
          <div style={{ fontSize: '13px', color: '#9ca3af' }}>No location history found for this date</div>
        </div>
      )}
    </div>
  );
}
