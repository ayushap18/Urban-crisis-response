import { Incident, EmergencyService, Alert } from "../types";

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'inc-001',
    title: 'Structure Fire',
    description: 'Report of smoke visible from the second floor of a commercial building. Potential trapped occupants.',
    type: 'FIRE',
    status: 'NEW',
    severity: 'CRITICAL',
    location: { lat: 28.6304, lng: 77.2177 }, // Near Connaught Place
    address: 'Block B, Connaught Place, New Delhi',
    timestamp: new Date().toISOString(),
    reportingParty: 'Shop Owner',
    assignedServiceIds: []
  },
  {
    id: 'inc-002',
    title: 'Multi-Vehicle Collision',
    description: 'Three car collision on the Ring Road. One vehicle overturned. Fluids leaking.',
    type: 'TRAFFIC',
    status: 'NEW',
    severity: 'HIGH',
    location: { lat: 28.5680, lng: 77.2100 }, // Near AIIMS/Ring Road
    address: 'Ring Road near AIIMS Flyover, New Delhi',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    reportingParty: 'Traffic Police',
    assignedServiceIds: []
  },
  {
    id: 'inc-003',
    title: 'Medical Emergency',
    description: '45-year-old male experiencing chest pains and difficulty breathing. History of heart issues.',
    type: 'MEDICAL',
    status: 'DISPATCHED',
    severity: 'HIGH',
    location: { lat: 28.5700, lng: 77.2300 }, // Defence Colony area
    address: 'A-Block, Defence Colony, New Delhi',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    reportingParty: 'Family Member',
    assignedServiceIds: ['svc-102']
  },
  {
    id: 'inc-004',
    title: 'Suspicious Package',
    description: 'Unattended bag left in metro station platform. CISF informed.',
    type: 'POLICE',
    status: 'NEW',
    severity: 'MEDIUM',
    location: { lat: 28.6328, lng: 77.2197 }, // Rajiv Chowk
    address: 'Rajiv Chowk Metro Station, Gate 4',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    reportingParty: 'Station Controller',
    assignedServiceIds: []
  }
];

export const MOCK_SERVICES: EmergencyService[] = [
  { id: 'svc-101', name: 'Fire Tender 101', type: 'FIRE', status: 'AVAILABLE', location: { lat: 28.6400, lng: 77.2100 } }, // Paharganj area
  { id: 'svc-102', name: 'Ambulance 52', type: 'MEDICAL', status: 'BUSY', location: { lat: 28.5700, lng: 77.2300 }, assignedIncidentId: 'inc-003' },
  { id: 'svc-103', name: 'PCR Van 22', type: 'POLICE', status: 'AVAILABLE', location: { lat: 28.6350, lng: 77.2250 } }, // Barakhamba
  { id: 'svc-104', name: 'Hazmat Unit 1', type: 'HAZMAT', status: 'AVAILABLE', location: { lat: 28.6100, lng: 77.2400 } }, // Near Pragati Maidan
];

export const MOCK_ALERTS: Alert[] = [
  { id: 'alt-1', message: 'New critical fire reported at Block B, Connaught Place', severity: 'CRITICAL', timestamp: new Date().toISOString(), relatedIncidentId: 'inc-001' },
  { id: 'alt-2', message: 'Traffic congestion increasing on Ring Road', severity: 'LOW', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString() }
];