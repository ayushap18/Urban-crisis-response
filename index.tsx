import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { CrisisProvider } from './context/CrisisContext';
import { reportWebVitals } from './utils/performance';

// Configure Cache Strategy
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds default freshness
      gcTime: 1000 * 60 * 60 * 24, // Garbage collect after 24 hours (renamed from cacheTime in v5)
      refetchOnWindowFocus: false, // Don't refetch on window focus to save API calls
      retry: 1,
    },
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <CrisisProvider>
        <App />
      </CrisisProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

// Initialize Performance Monitoring
reportWebVitals();