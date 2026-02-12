# Component Reference

## Core Components

### `LiveFeed` (`components/LiveFeed.tsx`)
Displays a virtualized list of incidents.
- **Features**: 
  - `react-window` for performance with 1000+ items.
  - Debounced search (300ms).
  - Keyboard navigation (Arrow Up/Down).
  - Auto-scroll for new incoming alerts.

### `MapView` (`components/MapView.tsx`)
Wrapper around the Google Maps instance.
- **Props**: None (Consumes `CrisisContext`).
- **Behavior**: 
  - Lazy loads the Maps JS API.
  - Throttles marker updates (100ms) to maintain 60fps during data bursts.
  - Handles route rendering overlays.

### `AnalysisPanel` (`components/AnalysisPanel.tsx`)
The details view for a selected incident.
- **States**:
  1. **No Selection**: Shows "System Overview" and Pattern Analysis trigger.
  2. **Selection**: Shows Incident details + "Run Analysis" button.
  3. **Analyzed**: Displays Gemini insights (Summary, Hazards, Tactics).
- **Accessibility**: Uses `aria-live` regions to announce analysis completion.

## Utility Components

### `CacheMonitor` (`components/CacheMonitor.tsx`)
A developer tool fixed to the bottom-left corner.
- **Function**: Monitors React Query states (fetching/stale) and IndexedDB entry counts.
- **Actions**: Allows purging all caches to reset the demo state.

## Context Providers

### `CrisisContext`
Global state manager.
- **State**: `incidents`, `services`, `alerts`, `selectedIncidentId`.
- **Actions**: `selectIncident`, `runAnalysis`.
- **Source**: Syncs with `firestoreService` (Simulated WebSocket) and writes to `indexedDB`.

### `AccessibilityContext`
Manages global UI preferences.
- **State**: `highContrast` (boolean).
- **Effects**: Toggles `.high-contrast` class on `<body>`.
- **Utils**: `announce(msg)` for screen reader announcements via a hidden live region.
