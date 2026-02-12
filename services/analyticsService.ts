import { logEvent } from 'firebase/analytics';
import { analytics } from './firebaseConfig';

export const analyticsService = {
  logEvent: (eventName: string, params?: { [key: string]: any }) => {
    if (analytics) {
      logEvent(analytics, eventName, params);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Analytics] ${eventName}`, params);
      }
    }
  },

  logIncidentView: (incidentId: string, type: string) => {
    analyticsService.logEvent('view_incident', {
      incident_id: incidentId,
      incident_type: type
    });
  },

  logDispatch: (incidentId: string, serviceId: string) => {
    analyticsService.logEvent('dispatch_unit', {
      incident_id: incidentId,
      service_id: serviceId
    });
  },

  logAIAnalysis: (incidentId: string) => {
    analyticsService.logEvent('ai_analysis_run', {
      incident_id: incidentId
    });
  }
};