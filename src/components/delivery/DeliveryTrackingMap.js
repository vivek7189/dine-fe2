'use client';
import { useEffect, useState, useRef } from 'react';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import DeliveryStatusTimeline from './DeliveryStatusTimeline';

/**
 * Real-time delivery tracking map using Leaflet.
 * Subscribes to Firebase RTDB for live location updates.
 * Falls back to status-only timeline when realtime tracking is disabled.
 */
export default function DeliveryTrackingMap({
  restaurantId,
  orderId,
  delivery,
  realtimeEnabled = false,
  restaurantLocation = null,
}) {
  const [driverLocation, setDriverLocation] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);

  // Subscribe to RTDB for live location
  useEffect(() => {
    if (!realtimeEnabled || !restaurantId || !orderId) return;

    const db = getDatabase();
    const locationRef = ref(db, `delivery/${restaurantId}/${orderId}/location`);

    const unsubscribe = onValue(locationRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.lat && data.lng) {
        setDriverLocation({ lat: data.lat, lng: data.lng, timestamp: data.timestamp });
      }
    });

    return () => off(locationRef);
  }, [realtimeEnabled, restaurantId, orderId]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!realtimeEnabled || !mapRef.current || mapInstanceRef.current) return;

    // Dynamic import for Leaflet (SSR safe)
    import('leaflet').then((L) => {
      // Fix default icon path
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current).setView(
        restaurantLocation ? [restaurantLocation.lat, restaurantLocation.lng] : [20.5937, 78.9629],
        14
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Restaurant marker
      if (restaurantLocation) {
        L.marker([restaurantLocation.lat, restaurantLocation.lng], {
          icon: L.divIcon({
            className: 'custom-marker',
            html: `<div style="background:#ef4444;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">🏪</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        }).addTo(map).bindPopup('Restaurant');
      }

      // Delivery address marker (if available)
      const addr = delivery?.deliveryAddress;
      if (addr?.lat && addr?.lng) {
        L.marker([addr.lat, addr.lng], {
          icon: L.divIcon({
            className: 'custom-marker',
            html: `<div style="background:#3b82f6;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">📍</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        }).addTo(map).bindPopup('Delivery Address');
      }

      mapInstanceRef.current = map;
      setMapLoaded(true);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [realtimeEnabled, restaurantLocation]);

  // Update driver marker on location change
  useEffect(() => {
    if (!mapInstanceRef.current || !driverLocation) return;

    import('leaflet').then((L) => {
      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLatLng([driverLocation.lat, driverLocation.lng]);
      } else {
        driverMarkerRef.current = L.marker([driverLocation.lat, driverLocation.lng], {
          icon: L.divIcon({
            className: 'custom-marker',
            html: `<div style="background:#10b981;color:white;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 2px 12px rgba(0,0,0,0.3);">🛵</div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          }),
        }).addTo(mapInstanceRef.current).bindPopup(delivery?.assignedStaff?.name || 'Driver');
      }

      // Pan map to driver
      mapInstanceRef.current.panTo([driverLocation.lat, driverLocation.lng]);
    });
  }, [driverLocation]);

  // If realtime not enabled, show status-only view
  if (!realtimeEnabled) {
    return (
      <DeliveryStatusTimeline
        deliveryStatus={delivery?.deliveryStatus}
        driverName={delivery?.assignedStaff?.name}
        timestamps={{
          deliveryAssignedAt: delivery?.deliveryAssignedAt,
          deliveryAcceptedAt: delivery?.deliveryAcceptedAt,
          deliveryPickedUpAt: delivery?.deliveryPickedUpAt,
          deliveryCompletedAt: delivery?.deliveryCompletedAt,
        }}
      />
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200">
      {/* Map */}
      <div ref={mapRef} className="w-full h-64" />

      {/* Status bar below map */}
      <div className="p-3 bg-white border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-700">
              {delivery?.assignedStaff?.name || 'Driver'}
            </span>
          </div>
          <span className="text-xs text-gray-500 capitalize">
            {delivery?.deliveryStatus?.replace('_', ' ')}
          </span>
        </div>
        {driverLocation && (
          <p className="text-xs text-gray-400 mt-1">
            Last update: {new Date(driverLocation.timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
