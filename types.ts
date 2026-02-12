export type IncidentType = 'FIRE' | 'MEDICAL' | 'POLICE' | 'HAZMAT' | 'TRAFFIC';
export type IncidentStatus = 'NEW' | 'DISPATCHED' | 'ON_SCENE' | 'RESOLVED';
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type ServiceStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  type: IncidentType;
  status: IncidentStatus;
  severity: Severity;
  location: Coordinates;
  address: string;
  timestamp: string;
  reportingParty: string;
  assignedServiceIds: string[];
  aiAnalysis?: AIAnalysisResult;
}

export interface EmergencyService {
  id: string;
  name: string; // e.g., "Engine 55"
  type: IncidentType; // Primary capability
  status: ServiceStatus;
  location: Coordinates;
  assignedIncidentId?: string;
}

export interface Alert {
  id: string;
  message: string;
  severity: Severity;
  timestamp: string;
  relatedIncidentId?: string;
}

export interface AIAnalysisResult {
  summary: string;
  recommendedUnits: string[];
  hazards: string[];
  tacticalAdvice: string;
  estimatedResolutionTime: string;
}

export interface DispatchRecommendation {
  unitIds: string[];
  rationale: string;
  priority: string;
}

export interface PatternAnalysisResult {
  summary: string;
  hotspots: string[];
  predictedRisks: string[];
  operationalSuggestions: string;
}