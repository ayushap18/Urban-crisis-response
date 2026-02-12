import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Database, Trash2, RefreshCw, X } from 'lucide-react';
import { indexedDBService } from '../services/indexedDBService';

const CacheMonitor: React.FC = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState({
    fetching: 0,
    cached: 0,
    stale: 0,
    total: 0
  });
  const [idbCount, setIdbCount] = useState<number | null>(null);

  // Poll query cache stats
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      
      setStats({
        fetching: queries.filter(q => q.state.fetchStatus === 'fetching').length,
        cached: queries.length,
        stale: queries.filter(q => q.isStale()).length,
        total: queries.length
      });

      indexedDBService.getCachedIncidents().then(items => setIdbCount(items.length));

    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, queryClient]);

  const handleClear = async () => {
    queryClient.clear();
    await indexedDBService.clearCache();
    alert('Cache Cleared');
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 bg-slate-800 text-slate-400 p-2 rounded-full border border-slate-700 hover:text-white hover:border-slate-500 shadow-lg z-50 transition-all opacity-50 hover:opacity-100"
        title="Open Cache Monitor"
      >
        <Database className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 w-64 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between p-3 bg-slate-800 border-b border-slate-700">
        <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
          <Database className="w-3 h-3 text-blue-400" />
          Cache Monitor
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-3 space-y-3">
        {/* React Query Stats */}
        <div>
          <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-2">Memory (React Query)</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-800 p-2 rounded border border-slate-700">
              <span className="block text-slate-400">Total Queries</span>
              <span className="font-mono text-slate-200 font-bold">{stats.total}</span>
            </div>
            <div className="bg-slate-800 p-2 rounded border border-slate-700">
              <span className="block text-blue-400">Fetching</span>
              <span className="font-mono text-slate-200 font-bold">{stats.fetching}</span>
            </div>
            <div className="bg-slate-800 p-2 rounded border border-slate-700">
              <span className="block text-green-400">Cached</span>
              <span className="font-mono text-slate-200 font-bold">{stats.cached}</span>
            </div>
            <div className="bg-slate-800 p-2 rounded border border-slate-700">
              <span className="block text-yellow-500">Stale</span>
              <span className="font-mono text-slate-200 font-bold">{stats.stale}</span>
            </div>
          </div>
        </div>

        {/* IndexedDB Stats */}
        <div>
          <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-2">Storage (IndexedDB)</h4>
          <div className="bg-slate-800 p-2 rounded border border-slate-700 flex justify-between items-center text-xs">
             <span className="text-slate-400">Cached Incidents</span>
             <span className="font-mono text-slate-200 font-bold">
               {idbCount !== null ? idbCount : <RefreshCw className="w-3 h-3 animate-spin" />}
             </span>
          </div>
        </div>

        <button 
          onClick={handleClear}
          className="w-full flex items-center justify-center gap-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 text-xs py-2 rounded border border-red-900/50 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          Purge All Caches
        </button>
      </div>
    </div>
  );
};

export default CacheMonitor;