import { EmergencyService, Incident } from "../types";

declare global {
  interface Window {
    google: any;
  }
}

export interface RouteResult {
  directions: any;
  eta: string;
  distance: string;
  serviceId: string;
}

export const findNearestAvailableService = (
  incidentLocation: { lat: number; lng: number },
  services: EmergencyService[]
): EmergencyService | null => {
  const availableServices = services.filter(s => s.status === 'AVAILABLE');
  
  if (availableServices.length === 0) return null;

  // Simple Euclidean distance for finding the nearest candidate
  // (Efficient enough for client-side filtering of local units)
  return availableServices.sort((a, b) => {
    const distA = Math.pow(a.location.lat - incidentLocation.lat, 2) + Math.pow(a.location.lng - incidentLocation.lng, 2);
    const distB = Math.pow(b.location.lat - incidentLocation.lat, 2) + Math.pow(b.location.lng - incidentLocation.lng, 2);
    return distA - distB;
  })[0];
};

export const calculateRoute = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<RouteResult | null> => {
  if (!window.google) return null;

  const directionsService = new window.google.maps.DirectionsService();

  return new Promise((resolve) => {
    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result: any, status: any) => {
        if (status === window.google.maps.DirectionsStatus.OK && result) {
          const leg = result.routes[0].legs[0];
          resolve({
            directions: result,
            eta: leg.duration?.text || 'Unknown',
            distance: leg.distance?.text || 'Unknown',
            serviceId: '' // Populated by caller
          });
        } else {
          console.error(`Directions request failed due to ${status}`);
          resolve(null);
        }
      }
    );
  });
};