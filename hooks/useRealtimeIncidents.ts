import { useState, useEffect } from 'react';
import { Incident } from '../types';
import { firestoreService } from '../services/firestoreService';
import { indexedDBService } from '../services/indexedDBService';

export const useRealtimeIncidents = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        setLoading(true);
        
        // 1. Try loading from cache first (Offline-first strategy)
        const cached = await indexedDBService.getCachedIncidents();
        if (mounted && cached.length > 0) {
          console.log(`[Incidents] Loaded ${cached.length} items from IndexedDB`);
          setIncidents(cached);
          setLoading(false); // Show cached data immediately
        }

        // 2. Subscribe to live updates
        const unsubscribe = firestoreService.subscribeToIncidents((updatedIncidents) => {
          if (mounted) {
            setIncidents(updatedIncidents);
            setLoading(false);
            // 3. Persist updates to cache
            indexedDBService.cacheIncidents(updatedIncidents).catch(e => 
              console.warn("Failed to cache incidents:", e)
            );
          }
        });

        return unsubscribe;
      } catch (err) {
        if (mounted) {
          setError("Failed to load incidents stream");
          setLoading(false);
        }
        return () => {};
      }
    };

    const cleanupPromise = init();

    return () => {
      mounted = false;
      cleanupPromise.then(unsubscribe => {
        if (typeof unsubscribe === 'function') unsubscribe();
      });
    };
  }, []);

  return { incidents, loading, error };
};
