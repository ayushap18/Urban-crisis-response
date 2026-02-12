import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useCrisis } from '../hooks/useCrisis';
import { useAccessibility } from '../context/AccessibilityContext';
import { useKeyboardShortcuts } from '../hooks/useAccessibility';
import { useDebounce } from '../hooks/useOptimization';
import { AlertItem } from './AlertItem';
import { Severity } from '../types';
import { Filter, ChevronDown, Bell, Search } from 'lucide-react';

const LiveFeed: React.FC = () => {
  const { incidents, selectedIncidentId, selectIncident } = useCrisis();
  const { announce } = useAccessibility();
  
  const [filter, setFilter] = useState<Severity | 'ALL'>('ALL');
  const [inputValue, setInputValue] = useState('');
  
  // Debounce search input by 300ms to avoid re-filtering on every keystroke
  const debouncedSearch = useDebounce(inputValue, 300);
  
  const [autoScroll, setAutoScroll] = useState(true);
  const [lastReadCount, setLastReadCount] = useState(0);
  const listRef = useRef<List>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Derived filtered list using Memoization
  // This calculation is now protected by debouncedSearch
  const filteredIncidents = useMemo(() => {
    return incidents
      .filter(inc => {
        const matchesFilter = filter === 'ALL' || inc.severity === filter;
        const matchesSearch = inc.title.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                              inc.address.toLowerCase().includes(debouncedSearch.toLowerCase());
        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [incidents, filter, debouncedSearch]);

  // Keyboard Shortcuts for Filtering and Searching
  useKeyboardShortcuts([
    { key: '1', ctrlKey: true, action: () => { setFilter('ALL'); announce("Showing All Incidents"); } },
    { key: '2', ctrlKey: true, action: () => { setFilter('CRITICAL'); announce("Showing Critical Incidents Only"); } },
    { key: '3', ctrlKey: true, action: () => { setFilter('HIGH'); announce("Showing High Severity Incidents"); } },
    { key: '4', ctrlKey: true, action: () => { setFilter('MEDIUM'); announce("Showing Medium Severity Incidents"); } },
    { key: '5', ctrlKey: true, action: () => { setFilter('LOW'); announce("Showing Low Severity Incidents"); } },
    { key: 'S', ctrlKey: true, action: () => { searchInputRef.current?.focus(); announce("Search focused"); } },
  ]);

  // Handle new incidents (Auto-scroll + Announce)
  useEffect(() => {
    if (incidents.length > lastReadCount) {
      const newCount = incidents.length - lastReadCount;
      const latest = incidents[0];
      
      // Accessibility Announcement
      if (newCount > 0) {
        announce(`New ${latest.severity} alert: ${latest.title}`);
      }

      // Auto-scroll logic
      if (autoScroll && listRef.current) {
        listRef.current.scrollTo(0);
      }
      
      setLastReadCount(incidents.length);
    }
  }, [incidents, lastReadCount, autoScroll, announce]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedIncidentId && filteredIncidents.length > 0 && e.key === 'ArrowDown') {
      selectIncident(filteredIncidents[0].id);
      return;
    }

    const currentIndex = filteredIncidents.findIndex(i => i.id === selectedIncidentId);
    if (currentIndex === -1) return;

    if (e.key === 'ArrowDown' && currentIndex < filteredIncidents.length - 1) {
      const nextId = filteredIncidents[currentIndex + 1].id;
      selectIncident(nextId);
      listRef.current?.scrollToItem(currentIndex + 1);
    } else if (e.key === 'ArrowUp' && currentIndex > 0) {
      const prevId = filteredIncidents[currentIndex - 1].id;
      selectIncident(prevId);
      listRef.current?.scrollToItem(currentIndex - 1);
    }
  };

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const incident = filteredIncidents[index];
    const isNew = (Date.now() - new Date(incident.timestamp).getTime()) < 60000;

    return (
      <AlertItem
        incident={incident}
        style={style}
        isSelected={selectedIncidentId === incident.id}
        onClick={() => selectIncident(incident.id)}
        isNew={isNew}
      />
    );
  };

  return (
    <div 
      id="live-feed"
      className="flex flex-col h-full bg-slate-900 border-r border-slate-700 w-96 relative outline-none"
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Incident Feed"
    >
      {/* Header */}
      <div className="p-3 border-b border-slate-800 bg-slate-900 shadow-md z-10 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-slate-100 flex items-center gap-2">
            <Bell className="w-4 h-4 text-red-500" aria-hidden="true" />
            Live Dispatch
          </h2>
          <button 
            onClick={() => {
              setAutoScroll(!autoScroll);
              announce(autoScroll ? "Live feed paused" : "Live feed active");
            }}
            className={`text-xs px-2 py-1 rounded transition-colors focus:ring-2 focus:ring-blue-500 ${autoScroll ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}
            title={autoScroll ? "Pause incoming alerts" : "Resume incoming alerts"}
            aria-pressed={autoScroll}
          >
            {autoScroll ? 'Live' : 'Paused'}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-2 top-1.5 w-4 h-4 text-slate-500" aria-hidden="true" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search incidents (Ctrl+S)..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded pl-8 pr-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-600"
            aria-label="Filter incidents by text"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1" role="tablist" aria-label="Severity Filters">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((f, i) => (
            <button
              key={f}
              onClick={() => { setFilter(f as any); announce(`Filter set to ${f}`); }}
              className={`
                text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all focus:ring-2 focus:ring-blue-500
                ${filter === f 
                  ? 'bg-slate-100 text-slate-900 border-slate-100' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'}
              `}
              role="tab"
              aria-selected={filter === f}
              aria-controls="incident-list"
              title={`Ctrl+${i+1}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Virtualized List */}
      <div className="flex-1" id="incident-list" role="listbox" aria-label="List of active incidents">
        {filteredIncidents.length > 0 ? (
          <List
            ref={listRef}
            height={800} // This should ideally be dynamic
            itemCount={filteredIncidents.length}
            itemSize={90}
            width="100%"
            className="custom-scrollbar focus:outline-none"
            innerElementType="div"
          >
            {Row}
          </List>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-600">
            <Filter className="w-8 h-8 mb-2 opacity-50" aria-hidden="true" />
            <p className="text-sm">No incidents match filter</p>
          </div>
        )}
      </div>

      {/* Footer Status */}
      <div className="bg-slate-950 p-2 text-[10px] text-slate-500 text-center border-t border-slate-800" aria-hidden="true">
        {filteredIncidents.length} Events • Ctrl+1-5 to Filter • Ctrl+S to Search
      </div>
    </div>
  );
};

export default LiveFeed;