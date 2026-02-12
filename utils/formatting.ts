import { Severity } from "../types";

export const formatTime = (isoString: string): string => {
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const getSeverityColor = (severity: Severity) => {
  switch (severity) {
    case 'CRITICAL': return 'text-red-500 bg-red-500/10 border-red-500/20';
    case 'HIGH': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    case 'LOW': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'NEW': return 'text-red-400';
    case 'DISPATCHED': return 'text-yellow-400';
    case 'ON_SCENE': return 'text-blue-400';
    case 'RESOLVED': return 'text-green-400';
    default: return 'text-slate-400';
  }
};
