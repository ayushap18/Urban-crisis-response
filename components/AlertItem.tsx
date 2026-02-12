import React, { memo } from 'react';
import { Incident, Severity, IncidentType } from '../types';
import { Flame, HeartPulse, Shield, AlertTriangle, Car, Clock, MapPin } from 'lucide-react';

interface AlertItemProps {
  incident: Incident;
  isSelected: boolean;
  style: React.CSSProperties;
  onClick: () => void;
  isNew?: boolean;
}

const getIcon = (type: IncidentType) => {
  switch (type) {
    case 'FIRE': return <Flame className="w-4 h-4 text-orange-500" />;
    case 'MEDICAL': return <HeartPulse className="w-4 h-4 text-red-500" />;
    case 'POLICE': return <Shield className="w-4 h-4 text-blue-500" />;
    case 'HAZMAT': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case 'TRAFFIC': return <Car className="w-4 h-4 text-slate-400" />;
    default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
  }
};

const getSeverityStyles = (severity: Severity) => {
  switch (severity) {
    case 'CRITICAL': return 'border-l-red-500 bg-red-500/5 hover:bg-red-500/10';
    case 'HIGH': return 'border-l-orange-500 bg-orange-500/5 hover:bg-orange-500/10';
    case 'MEDIUM': return 'border-l-yellow-500 bg-yellow-500/5 hover:bg-yellow-500/10';
    case 'LOW': return 'border-l-blue-500 bg-blue-500/5 hover:bg-blue-500/10';
    default: return 'border-l-slate-500';
  }
};

const formatTimeAgo = (isoString: string) => {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  return `${Math.floor(diff / 3600)}h`;
};

// Memoized for performance in virtualized lists
export const AlertItem = memo(({ incident, isSelected, style, onClick, isNew }: AlertItemProps) => {
  return (
    <div style={style} className="px-2 py-1">
      <button
        onClick={onClick}
        className={`
          w-full h-full text-left rounded-r border-l-4 transition-all duration-200 relative
          flex flex-col justify-center px-3
          ${getSeverityStyles(incident.severity)}
          ${isSelected ? 'bg-slate-800 ring-1 ring-inset ring-slate-600' : ''}
          focus:outline-none focus:ring-2 focus:ring-blue-500
        `}
        role="article"
        aria-selected={isSelected}
        aria-label={`${incident.severity} priority ${incident.type} incident at ${incident.address}`}
      >
        <div className="flex justify-between items-center w-full mb-1">
          <div className="flex items-center gap-2">
            {getIcon(incident.type)}
            <span className="font-bold text-slate-200 text-sm truncate max-w-[140px]">
              {incident.type}
            </span>
            {isNew && (
              <span className="animate-pulse bg-blue-500 text-white text-[9px] px-1 rounded font-bold">
                NEW
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(incident.timestamp)}
          </span>
        </div>

        <h4 className="text-xs text-slate-300 font-medium truncate w-full mb-1">
          {incident.title}
        </h4>
        
        <div className="flex items-center gap-1 text-[10px] text-slate-500 truncate">
          <MapPin className="w-3 h-3 shrink-0" />
          {incident.address}
        </div>
      </button>
    </div>
  );
});

AlertItem.displayName = 'AlertItem';
