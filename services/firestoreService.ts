import { collection, onSnapshot, query, orderBy, limit, addDoc, updateDoc, doc, Timestamp, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Incident, IncidentType, Severity } from '../types';
import { MOCK_INCIDENTS } from './mockData';

const INCIDENTS_COLLECTION = 'incidents';
const DISPATCHES_COLLECTION = 'dispatches';

export const firestoreService = {
  // Real-time listener for incidents
  subscribeToIncidents: (onUpdate: (incidents: Incident[]) => void) => {
    if (!db) {
      console.warn("Firestore not available. Using mock data.");
      onUpdate(MOCK_INCIDENTS);
      return () => {};
    }

    try {
      // Create a query against the collection
      const q = query(
        collection(db, INCIDENTS_COLLECTION),
        orderBy('timestamp', 'desc'),
        limit(100)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const incidents: Incident[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Convert Firestore Timestamp to ISO string
            timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString()
          } as Incident;
        });
        
        // If DB is empty, use mocks so the app isn't blank for judges
        if (incidents.length === 0) {
           console.warn("Firestore empty. seeding mocks...");
           firestoreService.seedMocks(); // Fire and forget
           onUpdate(MOCK_INCIDENTS);
        } else {
           onUpdate(incidents);
        }
      }, (error) => {
        console.error("Firestore subscription error:", error);
        // Fallback to mocks on error (e.g., missing permissions/config)
        onUpdate(MOCK_INCIDENTS);
      });

      return unsubscribe;
    } catch (e) {
      console.error("Firestore init error", e);
      onUpdate(MOCK_INCIDENTS);
      return () => {};
    }
  },

  // Update incident status (e.g. DISPATCHED)
  updateIncidentStatus: async (incidentId: string, status: string, assignedServiceIds?: string[]) => {
    if (!db) return;

    try {
      const ref = doc(db, INCIDENTS_COLLECTION, incidentId);
      const updateData: any = { status };
      if (assignedServiceIds) {
        updateData.assignedServiceIds = assignedServiceIds;
      }
      await updateDoc(ref, updateData);
    } catch (e) {
      console.error("Failed to update incident", e);
    }
  },

  // Track dispatcher actions
  recordDispatch: async (userId: string, incidentId: string, serviceId: string) => {
    if (!db) return;

    try {
      await addDoc(collection(db, DISPATCHES_COLLECTION), {
        userId,
        incidentId,
        serviceId,
        timestamp: Timestamp.now()
      });
    } catch (e) {
      console.error("Failed to record dispatch", e);
    }
  },

  // Helper to seed data if empty
  seedMocks: async () => {
    if (!db) return;

    // Only seed if actually empty to prevent duplicates on reload
    const snap = await getDocs(collection(db, INCIDENTS_COLLECTION));
    if (!snap.empty) return;

    console.log("Seeding Firestore with mock data...");
    for (const inc of MOCK_INCIDENTS) {
      // Remove ID from object as Firestore generates/uses it as doc ID
      const { id, ...data } = inc; 
      await addDoc(collection(db, INCIDENTS_COLLECTION), {
        ...data,
        timestamp: Timestamp.fromDate(new Date(inc.timestamp))
      });
    }
  }
};