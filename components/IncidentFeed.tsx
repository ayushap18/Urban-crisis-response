import React from 'react';
import { useCrisis } from '../hooks/useCrisis';
import { IncidentType } from '../types';
import { formatTime, getSeverityColor } from '../utils/formatting';
import { AlertCircle, Flame, HeartPulse, Shield, AlertTriangle, Car, ChevronRight } from 'lucide-react';

const IncidentFeed: React.FC = () => {
  const { incidents, selectedIncidentId, selectIncident } = useCrisis();
  
  const getIcon = (type: IncidentType) => {
    switch (type) {
      case 'FIRE': return <Flame className="w-5 h-5 text-orange-500" />;
      case 'MEDICAL': return <HeartPulse className="w-5 h-5 text-red-500" />;
      case 'POLICE': return <Shield className="w-5 h-5 text-blue-500" />;
      case 'HAZMAT': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'TRAFFIC': return <Car className="w-5 h-5 text-slate-400" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700 w-96">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900 sticky top-0 z-10">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          Active Incidents
        </h2>
        <span className="bg-slate-800 text-xs px-2 py-1 rounded text-slate-400">
          {incidents.length} Active
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {incidents.map((incident) => (
          <button
            key={incident.id}
            onClick={() => selectIncident(incident.id)}
            className={`w-full text-left p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors duration-200 group relative
              ${selectedIncidentId === incident.id ? 'bg-slate-800 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}
            `}
            aria-selected={selectedIncidentId === incident.id}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                {getIcon(incident.type)}
                <span className="font-semibold text-slate-200 text-sm">{incident.type}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded border ${getSeverityColor(incident.severity)}`}>
                {incident.severity}
              </span>
            </div>
            
            <h3 className="text-slate-100 font-medium mb-1 truncate pr-4">{incident.title}</h3>
            <p className="text-slate-400 text-xs truncate mb-2">{incident.address}</p>
            
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>{formatTime(incident.timestamp)}</span>
              <span className="group-hover:text-blue-400 transition-colors flex items-center gap-1">
                Details <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default IncidentFeed;
