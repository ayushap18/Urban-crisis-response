import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Incident, EmergencyService, Alert, AIAnalysisResult, PatternAnalysisResult } from '../types';
import { MOCK_SERVICES, MOCK_ALERTS } from '../services/mockData';
import { geminiService } from '../services/geminiService';
import { useRealtimeIncidents } from '../hooks/useRealtimeIncidents';

interface CrisisState {
  incidents: Incident[];
  services: EmergencyService[];
  alerts: Alert[];
  selectedIncidentId: string | null;
  loading: boolean;
  error: string | null;
  processingAnalysis: boolean;
  patternAnalysis: PatternAnalysisResult | null;
  processingPattern: boolean;
}

const initialState: CrisisState = {
  incidents: [],
  services: [],
  alerts: [],
  selectedIncidentId: null,
  loading: true,
  error: null,
  processingAnalysis: false,
  patternAnalysis: null,
  processingPattern: false,
};

type CrisisAction = 
  | { type: 'SYNC_INCIDENTS'; payload: Incident[] }
  | { type: 'LOAD_STATIC_DATA'; payload: { services: EmergencyService[]; alerts: Alert[] } }
  | { type: 'SELECT_INCIDENT'; payload: string }
  | { type: 'UPDATE_INCIDENT_ANALYSIS'; payload: { id: string; analysis: AIAnalysisResult } }
  | { type: 'SET_PROCESSING_ANALYSIS'; payload: boolean }
  | { type: 'SET_PATTERN_ANALYSIS'; payload: PatternAnalysisResult }
  | { type: 'SET_PROCESSING_PATTERN'; payload: boolean }
  | { type: 'ASSIGN_SERVICE'; payload: { incidentId: string; serviceId: string } }
  | { type: 'ERROR'; payload: string };

function crisisReducer(state: CrisisState, action: CrisisAction): CrisisState {
  switch (action.type) {
    case 'SYNC_INCIDENTS':
      return { ...state, incidents: action.payload, loading: false };
    case 'LOAD_STATIC_DATA':
      return { ...state, services: action.payload.services, alerts: action.payload.alerts };
    case 'SELECT_INCIDENT':
      return { ...state, selectedIncidentId: action.payload };
    case 'SET_PROCESSING_ANALYSIS':
        return { ...state, processingAnalysis: action.payload }
    case 'UPDATE_INCIDENT_ANALYSIS':
      return {
        ...state,
        incidents: state.incidents.map(inc => 
          inc.id === action.payload.id 
            ? { ...inc, aiAnalysis: action.payload.analysis } 
            : inc
        ),
        processingAnalysis: false
      };
    case 'SET_PATTERN_ANALYSIS':
      return { ...state, patternAnalysis: action.payload, processingPattern: false };
    case 'SET_PROCESSING_PATTERN':
      return { ...state, processingPattern: action.payload };
    case 'ASSIGN_SERVICE': {
      const { incidentId, serviceId } = action.payload;
      return {
        ...state,
        incidents: state.incidents.map(inc => 
          inc.id === incidentId 
            ? { 
                ...inc, 
                assignedServiceIds: [...(inc.assignedServiceIds || []), serviceId], 
                status: 'DISPATCHED' 
              } 
            : inc
        ),
        services: state.services.map(svc => 
          svc.id === serviceId
            ? { ...svc, status: 'BUSY', assignedIncidentId: incidentId }
            : svc
        )
      };
    }
    case 'ERROR':
      return { ...state, error: action.payload, loading: false, processingAnalysis: false, processingPattern: false };
    default:
      return state;
  }
}

interface CrisisContextType extends CrisisState {
  selectIncident: (id: string) => void;
  runAnalysis: (incident: Incident) => Promise<void>;
  runPatternAnalysis: () => Promise<void>;
  assignService: (incidentId: string, serviceId: string) => void;
}

export const CrisisContext = createContext<CrisisContextType | undefined>(undefined);

export const CrisisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(crisisReducer, initialState);
  
  // Use the real-time hook to subscribe to data
  const { incidents: realtimeIncidents, loading: incidentsLoading } = useRealtimeIncidents();

  // Sync real-time incidents to global state
  useEffect(() => {
    if (!incidentsLoading) {
      dispatch({ type: 'SYNC_INCIDENTS', payload: realtimeIncidents });
    }
  }, [realtimeIncidents, incidentsLoading]);

  // Load static mock data (Services/Alerts)
  useEffect(() => {
    dispatch({
      type: 'LOAD_STATIC_DATA',
      payload: { services: MOCK_SERVICES, alerts: MOCK_ALERTS }
    });
  }, []);

  const selectIncident = (id: string) => {
    dispatch({ type: 'SELECT_INCIDENT', payload: id });
  };

  const runAnalysis = async (incident: Incident) => {
    dispatch({ type: 'SET_PROCESSING_ANALYSIS', payload: true });
    try {
      // Use the comprehensive method for the detail view
      const analysis = await geminiService.analyzeIncidentComprehensive(incident);
      dispatch({ 
        type: 'UPDATE_INCIDENT_ANALYSIS', 
        payload: { id: incident.id, analysis } 
      });
    } catch (error) {
      console.error(error);
      dispatch({ type: 'ERROR', payload: 'AI Analysis Failed' });
    }
  };

  const runPatternAnalysis = async () => {
    if (state.incidents.length === 0) return;
    
    dispatch({ type: 'SET_PROCESSING_PATTERN', payload: true });
    try {
      const result = await geminiService.analyzeIncidentPattern(state.incidents);
      dispatch({ type: 'SET_PATTERN_ANALYSIS', payload: result });
    } catch (error) {
      console.error(error);
      dispatch({ type: 'ERROR', payload: 'Pattern Analysis Failed' });
    }
  };

  const assignService = (incidentId: string, serviceId: string) => {
    dispatch({ type: 'ASSIGN_SERVICE', payload: { incidentId, serviceId } });
  };

  const value = { ...state, selectIncident, runAnalysis, runPatternAnalysis, assignService };

  return (
    <CrisisContext.Provider value={value}>
      {children}
    </CrisisContext.Provider>
  );
};