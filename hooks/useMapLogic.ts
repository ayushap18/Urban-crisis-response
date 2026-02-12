import { useEffect, useRef, useState } from 'react';
import { Incident, EmergencyService } from '../types';
import { calculateRoute, findNearestAvailableService, RouteResult } from '../services/mapService';
import { useThrottle } from './useOptimization';

declare global {
  interface Window {
    google: any;
  }
}

// --- MARKER HELPERS ---

const getIncidentIcon = (severity: string, isSelected: boolean) => {
  const scale = isSelected ? 12 : 8;
  let color = '#ef4444'; // Default Red

  switch (severity) {
    case 'CRITICAL': color = '#ef4444'; break;
    case 'HIGH': color = '#f97316'; break;
    case 'MEDIUM': color = '#eab308'; break;
    case 'LOW': color = '#22c55e'; break;
  }

  return {
    path: window.google.maps.SymbolPath.CIRCLE,
    scale,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2,
  };
};

// --- HOOKS ---

export const useIncidentMarkers = (
  map: any,
  incidents: Incident[],
  selectedIncidentId: string | null,
  onSelect: (id: string) => void
) => {
  const markersRef = useRef<any[]>([]);

  // Throttle updates to markers (100ms) to avoid performance hits on rapid updates
  // This allows the incidents to update frequently in data, but the map UI lags slightly behind for smoothness
  const throttledIncidents = useThrottle(incidents, 100);

  useEffect(() => {
    if (!map) return;

    // Cleanup old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    throttledIncidents.forEach(incident => {
      const isSelected = incident.id === selectedIncidentId;
      const marker = new window.google.maps.Marker({
        position: incident.location,
        map,
        title: `${incident.type}: ${incident.title}`,
        icon: getIncidentIcon(incident.severity, isSelected),
        animation: isSelected ? window.google.maps.Animation.BOUNCE : null,
        zIndex: isSelected ? 100 : 1, // Selected on top
      });

      marker.addListener('click', () => {
        onSelect(incident.id);
      });

      markersRef.current.push(marker);
    });

  }, [map, throttledIncidents, selectedIncidentId, onSelect]);
};

export const useServiceMarkers = (
  map: any,
  services: EmergencyService[]
) => {
  const markersRef = useRef<any[]>([]);
  // Services don't move as fast, but good to throttle just in case
  const throttledServices = useThrottle(services, 200); 

  useEffect(() => {
    if (!map) return;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    throttledServices.forEach(service => {
      const marker = new window.google.maps.Marker({
        position: service.location,
        map,
        title: `${service.name} (${service.status})`,
        icon: {
           path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
           scale: 5,
           fillColor: service.status === 'AVAILABLE' ? '#22c55e' : '#64748b', // Green or Grey
           fillOpacity: 1,
           strokeColor: '#ffffff',
           strokeWeight: 1
        },
        zIndex: 50
      });
      markersRef.current.push(marker);
    });
  }, [map, throttledServices]);
};

export const useEmergencyRouting = (
  map: any,
  selectedIncident: Incident | undefined,
  services: EmergencyService[]
) => {
  const [routeInfo, setRouteInfo] = useState<RouteResult | null>(null);
  const rendererRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    // Initialize Renderer if needed
    if (!rendererRef.current) {
      rendererRef.current = new window.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true, // We have our own markers
        polylineOptions: {
          strokeColor: '#3b82f6',
          strokeWeight: 5,
          strokeOpacity: 0.7
        }
      });
    }

    const updateRoute = async () => {
      if (!selectedIncident) {
        rendererRef.current?.setDirections({ routes: [] });
        setRouteInfo(null);
        return;
      }

      // 1. Find Nearest Available Service
      const nearestService = findNearestAvailableService(selectedIncident.location, services);
      
      if (!nearestService) {
        // No service available logic
        rendererRef.current?.setDirections({ routes: [] });
        setRouteInfo(null);
        return;
      }

      // 2. Calculate Route
      const result = await calculateRoute(nearestService.location, selectedIncident.location);
      
      if (result) {
        rendererRef.current?.setDirections(result.directions);
        setRouteInfo({ ...result, serviceId: nearestService.id });
      }
    };

    updateRoute();

  }, [map, selectedIncident, services]);

  return routeInfo;
};