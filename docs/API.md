# API & Data Model Documentation

## 1. Google Gemini AI Integration (`services/geminiService.ts`)

We utilize the `@google/genai` SDK for multimodal reasoning.

### Models
- **`gemini-3-flash-preview`**: Optimized for latency (<500ms). Used for individual incident summaries and immediate tactical advice.
- **`gemini-3-pro-preview`**: Optimized for reasoning depth. Used for batch pattern analysis and strategic forecasting.

### Structured Output
All AI responses are forced into strict JSON schemas using the `responseSchema` configuration, ensuring predictable UI rendering without regex parsing.

---

## 2. Firebase Integration

### Cloud Firestore (Database)
The application uses a NoSQL document structure optimized for real-time reads.

**Collection: `incidents`**
```typescript
interface Incident {
  id: string;          // Auto-generated or UUID
  title: string;       // "Structure Fire"
  description: string; // "Smoke visible from..."
  type: 'FIRE' | 'MEDICAL' | 'POLICE' | 'HAZMAT';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'NEW' | 'DISPATCHED' | 'RESOLVED';
  timestamp: Timestamp;// Firestore Timestamp
  location: { 
    lat: number; 
    lng: number; 
  };
  address: string;
  assignedServiceIds: string[]; // Array of Unit IDs
}
```

**Collection: `dispatches`**
Used for audit logging and performance analytics.
```typescript
interface DispatchLog {
  userId: string;      // UID of the dispatcher
  incidentId: string;
  serviceId: string;   // "Unit-101"
  timestamp: Timestamp;
}
```

### Cloud Storage
Used for evidence management.

**Path Structure**: `incidents/{incidentId}/{timestamp}_{filename}`
- **Security Rules**: Authenticated users can read/write.
- **Metadata**: Custom metadata stored for audit trails (uploader ID, location).

---

## 3. Google Maps Integration

- **Markers**: Custom SVG vector markers colored by severity.
- **Routing**: `DirectionsService` used to calculate accurate ETAs based on current traffic conditions, not just straight-line distance.

## 4. Caching & Offline Strategy

To ensure reliability during network interruptions:

1. **React Query**: In-memory caching for UI state (stale time: 30s).
2. **IndexedDB**: Persistent browser storage.
   - Every Firestore update is mirrored to IndexedDB.
   - On app launch, if offline, data is hydrated immediately from IndexedDB.
   - Gemini analysis results are cached for 24 hours to reduce API costs.

---

## 5. Analytics Events

We track the following custom events in **Google Analytics 4**:

| Event Name | Parameter | Description |
|------------|-----------|-------------|
| `view_incident` | `incident_id` | When a user clicks an incident card. |
| `ai_analysis_run` | `incident_id` | When Gemini is invoked. |
| `dispatch_unit` | `service_id` | When a unit is assigned. |
| `evidence_uploaded` | `file_type` | When a user uploads a file. |
| `login` | `method` | Successful auth (always 'google'). |