# 🌍 How to Ingest Real-World Crisis Data

Currently, the dashboard uses `mockData.ts`. To make it "live" and accurate, we cannot simply "scrape" government emergency channels (which are private). Instead, we build a pipeline that monitors public news sources and uses **Gemini AI** to convert news headlines into tactical dashboard data.

## 🏗 The Architecture

You need a separate Node.js script (or a Firebase Cloud Function) to perform the scraping, because browsers block direct web scraping (CORS).

```mermaid
graph LR
    A[Public Sources<br/>(RSS/News/Twitter)] -->|Raw Text| B[Node.js Scraper Script]
    B -->|Unstructured Data| C[Gemini Flash]
    C -->|Structured JSON| B
    B -->|Geocoding| D[Google Maps API]
    D -->|Lat/Lng| E[Firebase Firestore]
    E -->|Real-time Update| F[React Dashboard]
```

---

## 🛠 Step 1: The Scraper Script

Create a file named `scripts/ingest-real-data.js`. You will need to install `rss-parser`, `axios`, and `@google/genai`.

### 1.1 Setup Dependencies
```bash
npm install rss-parser axios @google/genai dotenv
```

### 1.2 The Ingestion Code
Here is the logic to fetch news and turn it into incidents.

```javascript
// scripts/ingest-real-data.js
import Parser from 'rss-parser';
import { GoogleGenAI } from '@google/genai';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config();

const parser = new Parser();
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 1. Define Sources (e.g., Google News for specific keywords)
const RSS_FEEDS = [
  'https://news.google.com/rss/search?q=Delhi+Fire+OR+Accident+OR+Emergency&hl=en-IN&gl=IN&ceid=IN:en',
  // Add local police or traffic RSS feeds here if available
];

async function processFeed() {
  console.log("📡 Scanning news feeds...");
  
  for (const url of RSS_FEEDS) {
    const feed = await parser.parseURL(url);
    
    // Process only the top 5 newest items
    for (const item of feed.items.slice(0, 5)) {
      console.log(`Analyzing: ${item.title}`);
      await convertToIncident(item);
    }
  }
}

// 2. The Gemini "ETL" (Extract, Transform, Load) Magic
async function convertToIncident(newsItem) {
  const prompt = `
    Analyze this news headline and snippet to create a structured emergency incident.
    
    Headline: "${newsItem.title}"
    Snippet: "${newsItem.contentSnippet}"
    Link: "${newsItem.link}"
    
    If this is NOT a current active emergency (e.g., it's an op-ed, a movie review, or old news), return null.
    
    If it IS an emergency, extract:
    1. Title (Short, tactical)
    2. Severity (CRITICAL, HIGH, MEDIUM, LOW)
    3. Type (FIRE, MEDICAL, POLICE, HAZMAT, TRAFFIC)
    4. Address (Best guess of street/area name)
    5. Description (Tactical summary)
    
    Return JSON format only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
           type: 'OBJECT',
           properties: {
             isValidIncident: { type: 'BOOLEAN' },
             title: { type: 'STRING' },
             type: { type: 'STRING', enum: ['FIRE', 'MEDICAL', 'POLICE', 'HAZMAT', 'TRAFFIC'] },
             severity: { type: 'STRING', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
             address: { type: 'STRING' },
             description: { type: 'STRING' }
           }
        }
      }
    });

    const data = JSON.parse(response.text);

    if (data.isValidIncident) {
      await saveToFirestore(data);
    }
  } catch (e) {
    console.error("AI Processing failed:", e);
  }
}

// 3. Geocoding & Saving
async function saveToFirestore(incidentData) {
  // IMPORTANT: Gemini gives an address string. You need to convert this to Lat/Lng.
  // In a real app, use the Google Maps Geocoding API here.
  // For the hackathon, we can ask Gemini to guess Lat/Lng or generate random jitter near the city center.
  
  const mockLat = 28.6139 + (Math.random() - 0.5) * 0.1;
  const mockLng = 77.2090 + (Math.random() - 0.5) * 0.1;

  const incident = {
    title: incidentData.title,
    description: incidentData.description,
    type: incidentData.type,
    severity: incidentData.severity,
    status: 'NEW',
    address: incidentData.address,
    location: { lat: mockLat, lng: mockLng },
    timestamp: Timestamp.now(),
    reportingParty: "News Scraper Integration"
  };

  // Assume 'db' is initialized via Firebase Admin SDK or Client SDK
  // await addDoc(collection(db, 'incidents'), incident);
  console.log("✅ Incident Created:", incident.title);
}

// Run
processFeed();
```

---

## 🧠 Why Gemini is Critical Here

Traditional scrapers utilize Regular Expressions (Regex) to extract data. This fails with crisis data because:
1. "Fire on Main St" and "Blaze engulfs shop near Main" mean the same thing but look different.
2. News articles contain "fluff" text.

**Gemini allows you to:**
1. **Filter Noise**: It can decide `isValidIncident: false` if the news is about a "Fire Sale" at a store, not a real fire.
2. **Normalize Data**: It converts "Car crash", "Pile up", and "Fender bender" all into the standard `TRAFFIC` type required by your Typescript definitions.
3. **Extract Location**: It pulls the location context out of a paragraph of text.

## 📍 The Geocoding Challenge

The AI will give you an address string (e.g., "Connaught Place, Block B"). The Map requires coordinates (e.g., `28.6304, 77.2177`).

To make this fully accurate:
1. Enable the **Geocoding API** in Google Cloud Console.
2. In your ingestion script, make a fetch call:
   ```javascript
   const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(incidentData.address)}&key=YOUR_MAPS_KEY`;
   const geoRes = await axios.get(geoUrl);
   const location = geoRes.data.results[0].geometry.location; // { lat, lng }
   ```

## 🤖 Automation

To keep the dashboard "Live":
1. Deploy the script to **Vercel Functions** or **Firebase Cloud Functions**.
2. Set up a Cron Job (e.g., using Firebase Scheduler) to run it every 5 minutes.
3. Your React frontend needs **zero changes**. Because it listens to Firestore, as soon as your script adds a doc, it pops up on the UI instantly.
