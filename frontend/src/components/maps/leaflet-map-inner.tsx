'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { DEFAULT_MAP_CENTER } from '@/lib/constants';

// Create custom SVG markers
const createCustomIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 11px;
      ">
        ${label}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const pickupIcon = createCustomIcon('#2563EB', 'P');
const dropoffIcon = createCustomIcon('#10B981', 'D');
const stopIcon = createCustomIcon('#F59E0B', 'S');

const driverCarIcon = L.divIcon({
  className: 'driver-car-marker',
  html: `
    <div style="
      background-color: #111827;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid #FACC15;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 16px;
    ">
      🚕
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Component to adjust bounds automatically
function MapBoundsUpdater({
  pickup,
  dropoff,
  driverLocation,
}: {
  pickup?: { lat: number; lng: number };
  dropoff?: { lat: number; lng: number };
  driverLocation?: { lat: number; lng: number };
}) {
  const map = useMap();

  useEffect(() => {
    const points: [number, number][] = [];
    if (pickup) points.push([pickup.lat, pickup.lng]);
    if (dropoff) points.push([dropoff.lat, dropoff.lng]);
    if (driverLocation) points.push([driverLocation.lat, driverLocation.lng]);

    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (points.length === 1) {
      map.setView(points[0], 14);
    }
  }, [map, pickup, dropoff, driverLocation]);

  return null;
}

interface InnerProps {
  pickup?: { lat: number; lng: number; address?: string };
  dropoff?: { lat: number; lng: number; address?: string };
  driverLocation?: { lat: number; lng: number };
  stops?: Array<{ lat: number; lng: number; address?: string }>;
  onLocationSelect?: (lat: number, lng: number, type: 'pickup' | 'dropoff') => void;
  className?: string;
  zoom?: number;
}

export default function LeafletMapInner({
  pickup,
  dropoff,
  driverLocation,
  stops = [],
  className = 'w-full h-full min-h-[400px]',
  zoom = 13,
}: InnerProps) {
  const center: [number, number] = pickup
    ? [pickup.lat, pickup.lng]
    : driverLocation
    ? [driverLocation.lat, driverLocation.lng]
    : DEFAULT_MAP_CENTER;

  // Path coordinates
  const polylineCoords: [number, number][] = [];
  if (pickup) polylineCoords.push([pickup.lat, pickup.lng]);
  stops.forEach((s) => polylineCoords.push([s.lat, s.lng]));
  if (dropoff) polylineCoords.push([dropoff.lat, dropoff.lng]);

  return (
    <div className={`relative overflow-hidden rounded-xl border border-border shadow-sm ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ minHeight: '380px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsUpdater pickup={pickup} dropoff={dropoff} driverLocation={driverLocation} />

        {/* Pickup Marker */}
        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
            <Popup>
              <div className="text-xs">
                <strong>Pickup Location</strong>
                <p className="mt-0.5">{pickup.address || 'Selected Pickup'}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Intermediate Stops */}
        {stops.map((stop, index) => (
          <Marker key={index} position={[stop.lat, stop.lng]} icon={stopIcon}>
            <Popup>
              <div className="text-xs">
                <strong>Stop #{index + 1}</strong>
                <p className="mt-0.5">{stop.address || 'Waypoint'}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Dropoff Marker */}
        {dropoff && (
          <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffIcon}>
            <Popup>
              <div className="text-xs">
                <strong>Destination</strong>
                <p className="mt-0.5">{dropoff.address || 'Selected Destination'}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Moving Driver Marker */}
        {driverLocation && (
          <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverCarIcon}>
            <Popup>
              <div className="text-xs">
                <strong>Driver Active Location</strong>
                <p className="mt-0.5">Moving to target destination</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route visualization */}
        {polylineCoords.length > 1 && (
          <Polyline
            positions={polylineCoords}
            pathOptions={{
              color: '#2563EB',
              weight: 5,
              opacity: 0.8,
              dashArray: '8, 8',
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
