import React, { useRef, useEffect } from 'react';
import { useCrisis } from '../hooks/useCrisis';
import { useAccessibility } from '../context/AccessibilityContext';
import { analyticsService } from '../services/analyticsService';
import EvidenceUpload from './EvidenceUpload';
import { BrainCircuit, Loader2, AlertTriangle, CheckCircle, Clock, BarChart3, Map as MapIcon, ShieldAlert, Truck } from 'lucide-react';

const AnalysisPanel: React.FC = () => {
  const { 
    incidents, 
    selectedIncidentId, 
    runAnalysis, 
    processingAnalysis, 
    error,
    patternAnalysis,
    processingPattern,
    runPatternAnalysis,
    services,
    assignService
  } = useCrisis();
  
  const { announce } = useAccessibility();
  
  const incident = incidents.find(i => i.id === selectedIncidentId);

  // Track incident views
  useEffect(() => {
    if (incident) {
      analyticsService.logIncidentView(incident.id, incident.type);
    }
  }, [incident]);

  // Announce when analysis completes
  useEffect(() => {
    if (incident?.aiAnalysis) {
      announce("AI Analysis Complete. Summary available.");
      analyticsService.logAIAnalysis(incident.id);
    }
  }, [incident?.aiAnalysis, announce, incident?.id]);

  useEffect(() => {
    if (patternAnalysis) {
        announce("Pattern Analysis Complete.");
        analyticsService.logEvent('pattern_analysis_run');
    }
  }, [patternAnalysis, announce]);

  // --- SYSTEM VIEW (No Incident Selected) ---
  if (!incident) {
    return (
      <div 
        className="h-full flex flex-col bg-slate-900 border-l border-slate-700 w-96 overflow-y-auto outline-none" 
        id="analysis-panel" 
        tabIndex={0}
        role="region"
        aria-label="System Analysis Panel"
      >
         <div className="p-6 border-b border-slate-800">
            <h2 className="text-xl font-bold text-slate-100 mb-2 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-400" aria-hidden="true" />
              System Overview
            </h2>
            <p className="text-slate-400 text-sm">
              Real-time pattern recognition and strategic forecasting.
            </p>
         </div>

         <div className="p-6 flex-1 flex flex-col">
            <div className="mb-6">
              <button
                onClick={() => runPatternAnalysis()}
                disabled={processingPattern || incidents.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                aria-busy={processingPattern}
              >
                {processingPattern ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <BrainCircuit className="w-5 h-5" aria-hidden="true" />}
                {processingPattern ? 'Analyzing Patterns...' : 'Analyze Network Patterns'}
              </button>
            </div>

            {patternAnalysis ? (
              <div className="space-y-4 animate-in fade-in duration-500">
                <section className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <h3 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">Trend Summary</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{patternAnalysis.summary}</p>
                </section>

                <section className="bg-slate-800/30 p-4 rounded border border-slate-700/50">
                  <h3 className="text-red-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                    <MapIcon className="w-3 h-3" aria-hidden="true" /> Identified Hotspots
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {patternAnalysis.hotspots.map((h, i) => (
                      <span key={i} className="text-xs bg-red-500/10 text-red-300 px-2 py-1 rounded border border-red-500/20">
                        {h}
                      </span>
                    ))}
                  </div>
                </section>

                <section className="bg-slate-800/30 p-4 rounded border border-slate-700/50">
                   <h3 className="text-yellow-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" aria-hidden="true" /> Predicted Risks (24h)
                   </h3>
                   <ul className="text-sm text-slate-300 space-y-2">
                      {patternAnalysis.predictedRisks.map((r, i) => (
                         <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" aria-hidden="true" />
                            {r}
                         </li>
                      ))}
                   </ul>
                </section>

                <section className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <h3 className="text-green-400 text-xs font-bold uppercase tracking-wider mb-2">Operational Suggestions</h3>
                  <p className="text-slate-300 text-sm italic border-l-2 border-green-500/30 pl-3">
                    "{patternAnalysis.operationalSuggestions}"
                  </p>
                </section>
              </div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                 <BrainCircuit className="w-12 h-12 mb-3 opacity-20" aria-hidden="true" />
                 <p className="text-sm text-center px-6">
                   Run pattern analysis to detect emerging trends across {incidents.length} active incidents.
                 </p>
               </div>
            )}
         </div>
      </div>
    );
  }

  // --- INCIDENT DETAIL VIEW ---
  const handleRunAnalysis = () => {
    runAnalysis(incident);
    announce("Analyzing incident...");
  };

  const assignedServicesList = services.filter(s => incident.assignedServiceIds?.includes(s.id));
  const availableServices = services.filter(s => s.status === 'AVAILABLE');

  return (
    <div 
      className="h-full flex flex-col bg-slate-900 border-l border-slate-700 w-96 overflow-y-auto outline-none"
      id="analysis-panel"
      tabIndex={0}
      role="region"
      aria-label={`Analysis for ${incident.title}`}
    >
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold text-slate-100 mb-2">{incident.title}</h2>
        <p className="text-slate-400 text-sm mb-4">{incident.description}</p>
        
        <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
          <div>
            <span className="block text-slate-500 uppercase tracking-wider mb-1">Status</span>
            <span className="text-slate-200 bg-slate-800 px-2 py-1 rounded">{incident.status}</span>
          </div>
          <div>
            <span className="block text-slate-500 uppercase tracking-wider mb-1">Reporter</span>
            <span className="text-slate-200">{incident.reportingParty}</span>
          </div>
        </div>
      </div>

      <div className="p-6 flex-1">
        
        {/* Evidence Upload Section */}
        <EvidenceUpload incidentId={incident.id} />

        <div className="flex items-center justify-between mb-4 mt-6">
          <h3 className="font-bold text-slate-200 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-400" aria-hidden="true" />
            Gemini Tactical AI
          </h3>
          {!incident.aiAnalysis && (
            <button
              onClick={handleRunAnalysis}
              disabled={processingAnalysis}
              className="text-xs bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 text-white px-3 py-1.5 rounded-full flex items-center gap-2 transition-all focus:ring-2 focus:ring-purple-400 focus:outline-none"
              aria-busy={processingAnalysis}
            >
              {processingAnalysis ? <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" /> : null}
              {processingAnalysis ? 'Analyzing...' : 'Run Analysis'}
            </button>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm mb-4" role="alert">
            {error}
          </div>
        )}

        {incident.aiAnalysis ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <h4 className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">Executive Summary</h4>
              <p className="text-slate-300 text-sm leading-relaxed">{incident.aiAnalysis.summary}</p>
            </section>

            <div className="grid grid-cols-1 gap-3">
               <section className="bg-slate-800/30 p-3 rounded border border-slate-700/50">
                <h4 className="text-yellow-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" aria-hidden="true" /> Potential Hazards
                </h4>
                <ul className="text-sm text-slate-300 space-y-1">
                  {incident.aiAnalysis.hazards.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-yellow-500 mt-2" aria-hidden="true" />
                      {h}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="bg-slate-800/30 p-3 rounded border border-slate-700/50">
                <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" aria-hidden="true" /> Recommended Units
                </h4>
                <div className="flex flex-wrap gap-2">
                  {incident.aiAnalysis.recommendedUnits.map((u, i) => (
                    <span key={i} className="text-xs bg-blue-500/10 text-blue-300 px-2 py-1 rounded border border-blue-500/20">
                      {u}
                    </span>
                  ))}
                </div>
              </section>
            </div>

            <section className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <h4 className="text-green-400 text-xs font-bold uppercase tracking-wider mb-2">Tactical Advice</h4>
              <p className="text-slate-300 text-sm italic border-l-2 border-green-500/30 pl-3">
                "{incident.aiAnalysis.tacticalAdvice}"
              </p>
            </section>

            <div className="flex items-center gap-2 text-xs text-slate-500 justify-end">
              <Clock className="w-3 h-3" aria-hidden="true" />
              Est. Resolution: <span className="text-slate-300">{incident.aiAnalysis.estimatedResolutionTime}</span>
            </div>
          </div>
        ) : (
          !processingAnalysis && (
            <div className="text-center py-6 text-slate-600 border-b border-slate-800/50 mb-4">
              <p className="text-sm">Run AI analysis to get tactical support insights.</p>
            </div>
          )
        )}

        {/* --- DISPATCH CONTROL SECTION --- */}
        <div className="mt-6 border-t border-slate-800 pt-6">
          <div className="flex items-center justify-between mb-4">
             <h3 className="font-bold text-slate-200 flex items-center gap-2">
               <Truck className="w-5 h-5 text-blue-400" aria-hidden="true" />
               Dispatch Control
             </h3>
          </div>

          <section className="space-y-4">
            {/* Assigned Units */}
            {assignedServicesList.length > 0 && (
                <div className="space-y-2">
                   <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Assigned Units</h4>
                   <div className="flex flex-col gap-2">
                       {assignedServicesList.map(svc => (
                           <div key={svc.id} className="flex justify-between items-center bg-blue-900/10 border border-blue-500/20 p-2.5 rounded-md">
                               <div>
                                 <span className="text-xs font-bold text-blue-200 block">{svc.name}</span>
                                 <span className="text-[10px] text-blue-400 block">{svc.type} Unit</span>
                               </div>
                               <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                                 En Route
                               </span>
                           </div>
                       ))}
                   </div>
                </div>
            )}

            {/* Available Units */}
            <div className="space-y-2">
                <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Available For Dispatch</h4>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {availableServices.length === 0 ? (
                        <div className="text-xs text-slate-500 italic p-2 text-center border border-slate-800 border-dashed rounded">
                           No active units available
                        </div>
                    ) : (
                        availableServices.map(svc => (
                            <div key={svc.id} className="flex justify-between items-center bg-slate-800/50 p-2 rounded border border-slate-700 hover:border-slate-600 transition-colors">
                                <div>
                                    <span className="text-xs text-slate-200 font-medium block">{svc.name}</span>
                                    <span className="text-[10px] text-slate-500">{svc.type}</span>
                                </div>
                                <button 
                                    onClick={() => {
                                        assignService(incident.id, svc.id);
                                        analyticsService.logDispatch(incident.id, svc.id);
                                        announce(`${svc.name} dispatched to incident`);
                                    }}
                                    className="text-[10px] bg-slate-700 hover:bg-green-600 text-slate-200 hover:text-white px-3 py-1.5 rounded transition-all font-medium border border-slate-600 hover:border-green-500"
                                    aria-label={`Dispatch ${svc.name} to this incident`}
                                >
                                    Dispatch
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPanel;