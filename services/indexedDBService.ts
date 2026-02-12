import { Incident, AIAnalysisResult, PatternAnalysisResult } from '../types';

const DB_NAME = 'UrbanCrisisDB';
const DB_VERSION = 1;
const STORES = {
  INCIDENTS: 'incidents',
  AI_RESPONSES: 'ai_responses',
  PATTERN_ANALYSIS: 'pattern_analysis'
};

interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: number;
}

class IndexedDBService {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        resolve(request.result);
        this.pruneOldEntries(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Store for Incidents
        if (!db.objectStoreNames.contains(STORES.INCIDENTS)) {
          db.createObjectStore(STORES.INCIDENTS, { keyPath: 'id' });
        }

        // Store for AI Analysis (key: incidentId)
        if (!db.objectStoreNames.contains(STORES.AI_RESPONSES)) {
          db.createObjectStore(STORES.AI_RESPONSES, { keyPath: 'key' });
        }

        // Store for Pattern Analysis
        if (!db.objectStoreNames.contains(STORES.PATTERN_ANALYSIS)) {
          db.createObjectStore(STORES.PATTERN_ANALYSIS, { keyPath: 'key' });
        }
      };
    });
  }

  // --- GENERIC METHODS ---

  private async getStore(storeName: string, mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const db = await this.dbPromise;
    return db.transaction(storeName, mode).objectStore(storeName);
  }

  async saveItem<T>(storeName: string, item: T): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getItem<T>(storeName: string, key: string): Promise<T | undefined> {
    const store = await this.getStore(storeName, 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllItems<T>(storeName: string): Promise<T[]> {
    const store = await this.getStore(storeName, 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // --- SPECIFIC METHODS ---

  async cacheIncidents(incidents: Incident[]): Promise<void> {
    const store = await this.getStore(STORES.INCIDENTS, 'readwrite');
    const promises = incidents.map(incident => {
      return new Promise<void>((resolve, reject) => {
        const req = store.put(incident);
        req.onsuccess = () => resolve();
        req.onerror = () => reject();
      });
    });
    await Promise.all(promises);
  }

  async getCachedIncidents(): Promise<Incident[]> {
    return this.getAllItems<Incident>(STORES.INCIDENTS);
  }

  async cacheAIAnalysis(incidentId: string, analysis: AIAnalysisResult): Promise<void> {
    const entry: CacheEntry<AIAnalysisResult> = {
      key: incidentId,
      data: analysis,
      timestamp: Date.now()
    };
    return this.saveItem(STORES.AI_RESPONSES, entry);
  }

  async getCachedAIAnalysis(incidentId: string): Promise<AIAnalysisResult | null> {
    const entry = await this.getItem<CacheEntry<AIAnalysisResult>>(STORES.AI_RESPONSES, incidentId);
    // Cache valid for 24 hours
    if (entry && (Date.now() - entry.timestamp < 24 * 60 * 60 * 1000)) {
      return entry.data;
    }
    return null;
  }

  async clearCache(): Promise<void> {
    const db = await this.dbPromise;
    const promises = Object.values(STORES).map(storeName => {
      return new Promise<void>((resolve) => {
        const tx = db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).clear();
        tx.oncomplete = () => resolve();
      });
    });
    await Promise.all(promises);
  }

  // --- MAINTENANCE ---

  private async pruneOldEntries(db: IDBDatabase) {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    
    // Prune AI Responses
    const tx = db.transaction([STORES.AI_RESPONSES, STORES.INCIDENTS], 'readwrite');
    const aiStore = tx.objectStore(STORES.AI_RESPONSES);
    const aiReq = aiStore.getAll();
    
    aiReq.onsuccess = () => {
      aiReq.result.forEach((entry: CacheEntry<any>) => {
        if (entry.timestamp < cutoff) {
          aiStore.delete(entry.key);
        }
      });
    };

    // Prune Incidents based on timestamp
    const incStore = tx.objectStore(STORES.INCIDENTS);
    const incReq = incStore.getAll();
    incReq.onsuccess = () => {
       incReq.result.forEach((inc: Incident) => {
         if (new Date(inc.timestamp).getTime() < cutoff) {
            incStore.delete(inc.id);
         }
       });
    };
  }
}

export const indexedDBService = new IndexedDBService();
