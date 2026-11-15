'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamic import with ssr: false
const DynamicMap = dynamic(
  () => import('./leaflet-map-inner'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[350px] bg-muted/40 animate-pulse rounded-xl flex items-center justify-center text-sm text-muted-foreground border border-border">
        Loading Interactive Map...
      </div>
    ),
  }
);

interface MapViewProps {
  pickup?: { lat: number; lng: number; address?: string };
  dropoff?: { lat: number; lng: number; address?: string };
  driverLocation?: { lat: number; lng: number };
  stops?: Array<{ lat: number; lng: number; address?: string }>;
  onLocationSelect?: (lat: number, lng: number, type: 'pickup' | 'dropoff') => void;
  className?: string;
  zoom?: number;
}

export function MapView(props: MapViewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[350px] bg-muted/30 rounded-xl flex items-center justify-center text-sm text-muted-foreground border border-border">
        Initializing Map...
      </div>
    );
  }

  return <DynamicMap {...props} />;
}
