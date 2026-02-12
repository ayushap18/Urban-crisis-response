# Master Prompt Log

Project: Urban Crisis Response Dashboard
Stack: React + TypeScript + Google Services + Gemini AI + Firebase

## 1. Core System Architecture & Setup

### Initial Architecture

Build Urban Crisis Response Dashboard using:
- Google AI Studio (Gemini)
- React

Required features:
- Emergency dispatch system
- Real-time incident tracking
- Google Maps integration
- Gemini API integration
- Accessible interface
- Smart caching

### Project Setup

Set up React + TypeScript project structure

Configure Google Maps API + Gemini API environment

Create production-ready folder structure

Configure dependencies:
- react-query
- firebase

Provide full package.json

## 2. Type System & State Architecture

Define TypeScript Interfaces:
- Incident
- EmergencyService
- Alert

State Management:
- React Context architecture

Data flow diagram:
- Firestore → UI
- Gemini → Incident processing
- Caching layer interception

Required Folder Structure:
```
/src
  /components
  /hooks
  /services
  /types
  /utils
  /context
```

## 3. Live Feed (Mock → Real-Time → Virtualized)

### Version 1:
- Sidebar (w-80)
- Mock incidents
- Auto-refresh every 3s
- Severity color coding
- ARIA live region
- Keyboard navigable
- Click to highlight on map

### Version 2:
- Firestore real-time connection
- Descending alert order
- Auto-scroll on new alerts
- Audio notification
- Unread badge
- Virtualized list (react-window)
- ARIA live announcements

### Localization:
- Adapt entire system for New Delhi, India

## 4. Google Maps Integration

### Requirements:
- Use @react-google-maps/api
- Color-coded markers
- Emergency vehicle icons
- Directions API routing
- ETA calculation
- Marker clustering
- Accessible map interactions

### Deliverables:
- MapContainer
- useIncidentMarkers hook
- useEmergencyRouting hook
- mapService.ts

## 5. Gemini AI Integration

### AI Use Cases:
- Summarize incidents
- Generate dispatch recommendations
- Provide triage guidance
- Analyze incident patterns
- Predict high-risk areas

### Required Implementation:
- GeminiService class
- Error handling
- Rate limiting
- Caching AI responses
- Loading states
- Pattern analysis mode

## 6. Caching Strategy (Multi-layer)

### Required Layers:

**React Query**
- Incidents (30s staleTime)
- Services (5m staleTime)
- Preferences (infinite staleTime)

**IndexedDB**
- Last 24h incidents
- Map tiles
- AI responses

**Memory Cache**
- Filters
- Recently viewed

### Required Features:
- SWR pattern
- Cache invalidation
- Cache metrics (dev mode)
- Clear cache functionality
- Size limits

## 7. Accessibility (WCAG-Level)

### Keyboard Navigation

Logical tab order

Shortcuts:
- Ctrl+1–5 severity filters
- Ctrl+M focus map
- Ctrl+L focus feed
- Ctrl+S search
- Escape close modal

### Screen Reader Support
- ARIA live regions
- Proper heading hierarchy
- Alt text for icons
- Status announcements
- Form labeling

### Visual Accessibility
- High contrast toggle
- 2px focus outlines
- WCAG AA compliance
- 200% text scaling

### Focus Management
- Focus trap in modals
- Focus return
- Skip links

## 8. Testing Suite

### Unit Tests (Jest + RTL)
- Utility functions
- Custom hooks
- Service classes

### Component Tests
- LiveFeed
- MapContainer
- IncidentDetailsPanel

### Integration Tests
- Dispatch workflow
- Real-time updates
- Cache hit/miss

### E2E (Cypress)
- Critical path
- Full keyboard navigation

### Accessibility Testing
- axe-core
- Keyboard automation tests

### CI/CD
- GitHub Actions workflow

## 9. Performance Optimization

### Code Splitting
- Lazy load map
- Lazy load details panel
- Dynamic heavy imports

### Bundle Optimization
- Tree shaking
- Webpack/Vite analyzer

### Runtime Optimization
- Memoization
- Debounce (300ms)
- Throttle (100ms)
- List virtualization

### Monitoring
- Core Web Vitals (LCP, FID → INP, CLS)
- Error tracking

## 10. Documentation & Deployment

### Documentation Files:
- README.md
- API.md
- COMPONENTS.md
- JUDGES_REPORT.md

### Deployment:
- Vercel config
- Environment variables
- CI/CD
- Demo data seed script

## 11. Dispatch Control Enhancement

- Manual service assignment
- Update incident assignedServiceIds
- Update service status to BUSY
- Real-time UI sync

## 12. Google Services Expansion (Score Boost Goal)

### Added Real Integrations:

**1. Firebase Authentication**
- Google Sign-In
- User preferences
- Dispatch history
- Profile dropdown
- Session persistence

**2. Firestore (Real DB)**
- Live incident collection
- Dispatch tracking
- Analytics collection
- Real-time badge
- Data source indicator

**3. Google Cloud Storage**
- Evidence upload
- Thumbnails
- Progress bar
- Metadata display
- Secure URLs

**4. Google Analytics (GA4)**

Event tracking:
- incident_viewed
- incident_dispatched
- ai_summary_generated
- map_interaction
- filter_applied

Features:
- Real-time users
- Usage heatmap
- Analytics dashboard
