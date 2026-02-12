import React, { useEffect, useRef, useState } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { useCrisis } from '../hooks/useCrisis';
import { Incident, EmergencyService } from '../types';
import { useIncidentMarkers, useServiceMarkers, useEmergencyRouting } from '../hooks/useMapLogic';
import { Clock, Navigation } from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}

interface MapComponentProps {
  incidents: Incident[];
  services: EmergencyService[];
  selectedIncidentId: string | null;
  onIncidentSelect: (id: string) => void;
}

// --- INTERNAL MAP LOGIC ---
const MapComponent: React.FC<MapComponentProps> = ({ 
  incidents, 
  services, 
  selectedIncidentId, 
  onIncidentSelect 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>();

  // 1. Initialize Map
  useEffect(() => {
    if (mapRef.current && !map) {
      const initialMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: 28.6139, lng: 77.2090 }, // New Delhi, India
        zoom: 13,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
          { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
        ],
        disableDefaultUI: true,
      });
      setMap(initialMap);
    }
  }, [mapRef, map]);

  // 2. Markers Hooks
  useIncidentMarkers(map, incidents, selectedIncidentId, onIncidentSelect);
  useServiceMarkers(map, services);

  // 3. Routing Hook
  const selectedIncident = incidents.find(i => i.id === selectedIncidentId);
  const routeInfo = useEmergencyRouting(map, selectedIncident, services);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapRef} 
        className="w-full h-full" 
        role="application" 
        aria-label="Interactive Map of New Delhi. Contains pins for incidents and emergency services. Use standard Google Maps keyboard controls." 
      />
      
      {/* Route ETA Overlay */}
      {routeInfo && selectedIncident && (
        <div 
          className="absolute top-4 left-4 bg-slate-900/95 border border-slate-700 p-4 rounded shadow-xl backdrop-blur max-w-xs animate-in slide-in-from-left duration-300"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-slate-200">Dispatch Route</h4>
            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-mono">
              ACTIVE
            </span>
          </div>
          
          <div className="flex items-center gap-3 mb-3">
             <div className="p-2 bg-slate-800 rounded-lg" aria-hidden="true">
               <Navigation className="w-5 h-5 text-blue-400" />
             </div>
             <div>
               <div className="text-xs text-slate-400">Target</div>
               <div className="text-sm font-medium text-slate-200 truncate w-32">{selectedIncident.title}</div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-800/50 p-2 rounded border border-slate-700">
               <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">ETA</span>
               <span className="text-xl font-mono text-green-400 font-bold flex items-center gap-1">
                 <Clock className="w-4 h-4" aria-hidden="true" />
                 {routeInfo.eta}
               </span>
            </div>
            <div className="bg-slate-800/50 p-2 rounded border border-slate-700">
               <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Distance</span>
               <span className="text-xl font-mono text-blue-400 font-bold">
                 {routeInfo.distance}
               </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- CONTAINER COMPONENT ---
const MapView: React.FC = () => {
  const { incidents, services, selectedIncidentId, selectIncident } = useCrisis();
  // Using the provided API key as a fallback to ensure the map loads
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "AIzaSyAm21p9WAVwht99U4MmqlfAEiksEyG_aQo";

  if (!apiKey) {
      return (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center flex-col p-6 text-center">
              <h3 className="text-xl font-bold text-slate-300 mb-2">Map Unavailable</h3>
              <p className="text-slate-500 max-w-md">
                  Google Maps API Key is missing.
              </p>
          </div>
      )
  }

  // Cast Wrapper to any to suppress the type error for apiKey
  const MapWrapper = Wrapper as any;

  return (
    <MapWrapper apiKey={apiKey} render={(status: any) => {
        if (status === "LOADING") return <div className="w-full h-full bg-slate-900 animate-pulse flex items-center justify-center text-slate-500">Loading Map...</div>;
        if (status === "FAILURE") return <div className="w-full h-full bg-red-900/20 flex items-center justify-center text-red-400">Map Failed to Load</div>;
        return (
          <MapComponent 
            incidents={incidents} 
            services={services} 
            selectedIncidentId={selectedIncidentId} 
            onIncidentSelect={selectIncident} 
          />
        );
    }} />
  );
};

export default MapView;