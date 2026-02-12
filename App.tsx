import React, { useRef, Suspense } from 'react';
import { useCrisis } from './hooks/useCrisis';
import LiveFeed from './components/LiveFeed'; // Keep LiveFeed eager as it is LCP (primary content)
import { Radio, Accessibility, Eye, Loader2, Database, BarChart, Cloud, Shield } from 'lucide-react';
import { AccessibilityProvider, useAccessibility } from './context/AccessibilityContext';
import { AuthProvider } from './context/AuthContext';
import { useKeyboardShortcuts } from './hooks/useAccessibility';
import AuthButton from './components/AuthButton';

// Lazy Load heavy components
const MapView = React.lazy(() => import('./components/MapView'));
const AnalysisPanel = React.lazy(() => import('./components/AnalysisPanel'));
const CacheMonitor = React.lazy(() => import('./components/CacheMonitor'));

// Loading Fallback Component
const ComponentLoader = () => (
  <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500">
    <Loader2 className="w-8 h-8 animate-spin" />
  </div>
);

// Sub-component to use the hook inside the provider
const DashboardLayout: React.FC = () => {
  const { services, alerts, loading } = useCrisis();
  const { highContrast, toggleHighContrast, announce } = useAccessibility();
  
  // Refs for Focus Management
  const liveFeedRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const analysisRef = useRef<HTMLDivElement>(null);

  // Global Shortcuts
  useKeyboardShortcuts([
    {
      key: 'L',
      ctrlKey: true,
      action: () => {
        announce("Focusing Live Feed");
        const focusTarget = liveFeedRef.current?.querySelector('input') || liveFeedRef.current;
        (focusTarget as HTMLElement)?.focus();
      }
    },
    {
      key: 'M',
      ctrlKey: true,
      action: () => {
        announce("Focusing Map View");
        mapRef.current?.focus();
      }
    },
    {
      key: 'P',
      ctrlKey: true, 
      action: () => {
        announce("Focusing Analysis Panel");
        analysisRef.current?.focus();
      }
    }
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 text-slate-400" role="alert" aria-busy="true">
        <div className="animate-pulse flex flex-col items-center gap-4">
           <Radio className="w-10 h-10 text-slate-600 animate-spin" aria-hidden="true" />
           <p>Initializing Crisis Control System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden">
      {/* Skip Link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-blue-600 focus:text-white focus:p-3 focus:rounded focus:font-bold focus:outline-none focus:ring-4 focus:ring-blue-400"
      >
        Skip to Main Content
      </a>

      {/* Header */}
      <header className="h-14 bg-slate-900 border-b border-slate-700 flex items-center px-4 justify-between z-20 shadow-lg" role="banner">
        <div className="flex items-center gap-2">
          <div className="bg-red-600 p-1.5 rounded" aria-hidden="true">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-slate-100">
            CRISIS<span className="text-red-500">RESPONSE</span>
          </h1>
          {/* Service Status Indicators */}
          <div className="hidden lg:flex items-center gap-2 ml-6 text-[10px] text-slate-500 bg-slate-950/50 p-1 rounded border border-slate-800">
             <div className="flex items-center gap-1 px-2 border-r border-slate-800" title="Firebase Firestore">
                <Database className="w-3 h-3 text-orange-400" />
                <span>DB Connected</span>
             </div>
             <div className="flex items-center gap-1 px-2 border-r border-slate-800" title="Firebase Auth">
                <Shield className="w-3 h-3 text-yellow-400" />
                <span>Auth Active</span>
             </div>
             <div className="flex items-center gap-1 px-2 border-r border-slate-800" title="Google Analytics 4">
                <BarChart className="w-3 h-3 text-blue-400" />
                <span>Analytics On</span>
             </div>
             <div className="flex items-center gap-1 px-2" title="Firebase Storage">
                <Cloud className="w-3 h-3 text-green-400" />
                <span>Cloud Storage</span>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm">
           {/* Live Alerts Ticker */}
           {alerts.length > 0 && (
             <div className="hidden md:flex items-center gap-2 text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full text-xs" role="status">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" aria-hidden="true"></span>
                <span className="font-mono">ALERT: {alerts[0].message}</span>
             </div>
           )}

          <div className="flex items-center gap-4">
            {/* Accessibility Controls */}
            <button 
              onClick={() => {
                toggleHighContrast();
                announce(highContrast ? "High contrast disabled" : "High contrast enabled");
              }}
              className={`p-2 rounded hover:bg-slate-800 focus:ring-2 focus:ring-blue-500 ${highContrast ? 'text-yellow-400' : 'text-slate-400'}`}
              aria-label={highContrast ? "Disable High Contrast Mode" : "Enable High Contrast Mode"}
              title="Toggle High Contrast"
            >
              <Eye className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2" aria-hidden="true">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
               <span className="text-slate-400">System Operational</span>
            </div>
            
            <div className="pl-4 border-l border-slate-700">
               <AuthButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex flex-1 overflow-hidden" role="main">
        {/* Left Sidebar: Live Feed */}
        <div ref={liveFeedRef} className="h-full flex-shrink-0" tabIndex={-1}>
          <LiveFeed />
        </div>

        {/* Center: Map Visualization */}
        <div 
          ref={mapRef} 
          id="map-view" 
          className="flex-1 relative bg-slate-800 outline-none focus:ring-4 focus:ring-inset focus:ring-blue-500/50" 
          tabIndex={0}
          aria-label="Map View. Press Ctrl+M to focus here. Use internal map controls or standard google maps keyboard shortcuts."
        >
          <div className="absolute inset-0">
             <Suspense fallback={<ComponentLoader />}>
                <MapView />
             </Suspense>
          </div>
          
          {/* Map Overlay Stats */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-none">
            <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-3 rounded shadow-xl pointer-events-auto">
               <span className="text-xs text-slate-400 uppercase font-bold" id="service-status-label">Services Active</span>
               <div className="text-2xl font-mono font-bold text-green-400" aria-labelledby="service-status-label">
                 {services.filter(s => s.status === 'AVAILABLE').length}/{services.length}
               </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Analysis Panel */}
        <div ref={analysisRef} className="h-full flex-shrink-0" tabIndex={-1}>
          <Suspense fallback={<ComponentLoader />}>
            <AnalysisPanel />
          </Suspense>
        </div>
      </main>

      {/* Developer Tool */}
      <Suspense fallback={null}>
        <CacheMonitor />
      </Suspense>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <DashboardLayout />
      </AccessibilityProvider>
    </AuthProvider>
  );
};

export default App;