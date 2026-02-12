import { onCLS, onINP, onLCP, onFCP, onTTFB, Metric } from 'web-vitals';

const reportHandler = (metric: Metric) => {
  // In a real app, send to analytics endpoint
  // navigator.sendBeacon('/analytics', JSON.stringify(metric));
  
  if (process.env.NODE_ENV === 'development') {
    console.groupCollapsed(`[Web Vitals] ${metric.name}`);
    console.log(`Value: ${Math.round(metric.value * 100) / 100}`);
    console.log(`Delta: ${Math.round(metric.delta * 100) / 100}`);
    console.log(`ID: ${metric.id}`);
    console.groupEnd();
  }
};

export const reportWebVitals = () => {
  try {
    onCLS(reportHandler);
    onINP(reportHandler);
    onLCP(reportHandler);
    onFCP(reportHandler);
    onTTFB(reportHandler);
  } catch (e) {
    console.warn("Web Vitals monitoring initialized but failed to bind observers.", e);
  }
};