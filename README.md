# Urban Crisis Response Dashboard 🚨

An AI-powered real-time command center for managing urban emergencies — built with **Google Gemini**, **Google Maps**, and the full **Firebase Suite**.

![Status](https://img.shields.io/badge/Status-Production_Ready-green) ![AI](https://img.shields.io/badge/AI-Gemini_Flash_%26_Pro-purple) ![Stack](https://img.shields.io/badge/Stack-Firebase_%2B_React-orange)

## 💎 Google Services (6 Integrations)

| Service | Usage |
|---------|-------|
| **Gemini API** | Tactical analysis (Flash) + pattern recognition (Pro) |
| **Google Maps** | Interactive map, Directions API routing & ETA |
| **Firebase Auth** | Google Sign-In, session persistence |
| **Cloud Firestore** | Real-time incident sync (sub-100ms) |
| **Cloud Storage** | Evidence upload — images, PDFs, secure URLs |
| **Google Analytics 4** | Custom event tracking & usage metrics |

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+
- Google Cloud Project with:
  - **Gemini API Key** (AI Studio)
  - **Google Maps API Key** (Maps JS, Directions)
- Firebase Project with:
  - **Auth** (Google Provider enabled)
  - **Firestore** (Database created)
  - **Storage** (Bucket created)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ayushap18/Urban-crisis-response.git
   cd Urban-crisis-response
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory:
   ```env
   # AI & Maps
   API_KEY=your_gemini_api_key
   REACT_APP_GOOGLE_MAPS_API_KEY=your_maps_key

   # Firebase Configuration
   FIREBASE_API_KEY=...
   FIREBASE_AUTH_DOMAIN=...
   FIREBASE_PROJECT_ID=...
   FIREBASE_STORAGE_BUCKET=...
   FIREBASE_MESSAGING_SENDER_ID=...
   FIREBASE_APP_ID=...
   FIREBASE_MEASUREMENT_ID=...
   ```

4. **Start Application**
   ```bash
   npm start
   ```

## 🧪 Key Workflows

### 1. Incident Ingestion
Incidents are listened to in real-time from **Firestore**. If the network goes down, the app automatically fails over to **IndexedDB**, serving cached data to ensure business continuity.

### 2. Intelligent Dispatch
When a dispatcher selects an incident:
1. **Gemini** analyzes the text description to determine severity and hazards.
2. **Google Maps** calculates the distance to all available units.
3. The UI presents the best tactical option.
4. Clicking "Dispatch" updates **Firestore**, instantly notifying other commanders.

### 3. Pattern Analysis
Clicking "Analyze Network Patterns" sends a batch of recent incidents to **Gemini Pro**. The model reasons across the dataset to find correlated events (e.g., "3 fires in sector 7 suggest arson") and returns structured JSON suggestions.

## ⌨️ Accessibility (A11y)

This dashboard is WCAG 2.1 compliant and fully navigable via keyboard:

| Shortcut | Action |
|----------|--------|
| `Ctrl + L` | Focus Live Feed |
| `Ctrl + M` | Focus Map View |
| `Ctrl + P` | Focus Analysis Panel |
| `Ctrl + S` | Search Incidents |
| `Ctrl + 1-5` | Filter Incidents by Severity |

---

## 🏆 Hackathon Impact

- **Integration Depth**: We don't just "use" APIs; we combine them. Firestore real-time data feeds directly into Gemini analysis, which visually updates Google Maps.
- **Performance**: Virtualized lists (`react-window`) and optimized re-renders ensure the dashboard remains performant even during high-volume crisis events.
- **Resilience**: Offline-first architecture guarantees utility in unstable network conditions typical of disaster zones.

---

## 📸 Application Screenshots

### Dashboard Overview
![Dashboard Overview](photos/01-dashboard-overview.png)

### Live Incident Feed
![Live Feed](photos/02-live-feed.png)

### Incident Details
![Incident Details](photos/03-incident-details.png)

### Map View with Emergency Routing
![Map View](photos/04-map-view.png)

### AI-Powered Analysis Panel
![AI Analysis](photos/05-ai-analysis.png)

---

## 📝 How to Regenerate This Project — Step-by-Step Prompts

> **Want to build this project from scratch?** Follow the prompts in [`prompts.md`](prompts.md) step by step. Each section contains the exact prompts used to generate every part of this application.

### Prompt Workflow Overview

The full prompt log is organized into **12 incremental steps**:

| Step | Prompt Section | What It Builds |
|------|---------------|----------------|
| 1 | Core System Architecture & Setup | Project scaffold, dependencies, folder structure |
| 2 | Type System & State Architecture | TypeScript interfaces, React Context, data flow |
| 3 | Live Feed (Mock → Real-Time → Virtualized) | Sidebar feed with Firestore sync, severity coding |
| 4 | Google Maps Integration | Map markers, routing, ETA, clustering |
| 5 | Gemini AI Integration | Incident summaries, dispatch recommendations, pattern analysis |
| 6 | Caching Strategy (Multi-layer) | React Query, IndexedDB, memory cache with SWR |
| 7 | Accessibility (WCAG-Level) | Keyboard nav, screen reader, high contrast, focus management |
| 8 | Testing Suite | Unit, component, integration, E2E, and a11y tests |
| 9 | Performance Optimization | Code splitting, bundle optimization, Web Vitals |
| 10 | Documentation & Deployment | README, API docs, Vercel config, seed scripts |
| 11 | Dispatch Control Enhancement | Manual service assignment, real-time sync |
| 12 | Google Services Expansion | Firebase Auth, Firestore, Cloud Storage, GA4 |

### 🔍 Code Originality — Prompt Evidence

Every line of code in this project was generated through carefully crafted prompts. Below are proof-of-originality screenshots showing the **exact AI conversations** that produced this codebase:

<table>
<tr>
<td align="center"><b>Phase 1 — Architecture & Scaffold</b></td>
<td align="center"><b>Phase 2 — Components & Integrations</b></td>
</tr>
<tr>
<td><img src="photos/06-prompt-step1.png" alt="Prompt Phase 1" width="400"/></td>
<td><img src="photos/07-prompt-step2.png" alt="Prompt Phase 2" width="400"/></td>
</tr>
<tr>
<td><em>Prompts for: project setup, folder structure, Firebase config, type system, state management</em></td>
<td><em>Prompts for: LiveFeed, MapView, Gemini service, caching layers, real-time sync</em></td>
</tr>
</table>

<table>
<tr>
<td align="center"><b>Phase 3 — Comparing Services from AlertAid</b></td>
</tr>
<tr>
<td><img src="photos/07-comapring%20services%20from%20alertaid.png" alt="Comparing services from AlertAid" width="400"/></td>
</tr>
<tr>
<td><em>Side-by-side comparison of services and capabilities vs AlertAid</em></td>
</tr>
</table>

> 📖 **Full prompt log**: Open [`prompts.md`](prompts.md) to read every prompt in detail. Follow each section sequentially to recreate the entire project from scratch.

---
