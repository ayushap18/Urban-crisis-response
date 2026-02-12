import { GoogleGenAI, Type } from "@google/genai";
import { Incident, AIAnalysisResult, EmergencyService, PatternAnalysisResult, DispatchRecommendation } from "../types";
import { indexedDBService } from "./indexedDBService";

class GeminiService {
  private ai: GoogleGenAI;
  private requestQueue: Promise<void> = Promise.resolve();

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  // Rate limiting helper
  private async throttle<T>(fn: () => Promise<T>): Promise<T> {
    const res = this.requestQueue.then(async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay between requests
      return fn();
    });
    this.requestQueue = res.then(() => {});
    return res;
  }

  // Simple in-memory fallback if needed, but primarily relying on IDB now
  
  async summarizeIncident(incident: Incident): Promise<string> {
    return this.throttle(async () => {
      try {
        const response = await this.ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Summarize this incident in one concise sentence for a dashboard feed: ${incident.title} - ${incident.description}`,
          config: { 
            maxOutputTokens: 50,
            thinkingConfig: { thinkingBudget: 0 }
          }
        });
        return response.text || "No summary available.";
      } catch (error) {
        console.error("Summarization failed:", error);
        return "Summary unavailable.";
      }
    });
  }

  async generateDispatchRecommendation(incident: Incident, availableServices: EmergencyService[]): Promise<DispatchRecommendation> {
    // Note: Dispatch logic is highly situational, we might not want to cache this too aggressively if unit status changes,
    // but for the hackathon context, we assume a snapshot.
    
    return this.throttle(async () => {
      const servicesContext = availableServices
        .map(s => `- ID: ${s.id}, Name: ${s.name}, Type: ${s.type}, Dist: [Assume nearby]`)
        .join('\n');

      const prompt = `
        Incident: ${incident.type} at ${incident.address} (Severity: ${incident.severity})
        Description: ${incident.description}
        
        Available Units:
        ${servicesContext}
        
        Recommend the specific Unit IDs to dispatch.
      `;

      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              unitIds: { type: Type.ARRAY, items: { type: Type.STRING } },
              rationale: { type: Type.STRING },
              priority: { type: Type.STRING }
            }
          }
        }
      });

      return JSON.parse(response.text || "{}") as DispatchRecommendation;
    });
  }

  async analyzeIncidentPattern(incidents: Incident[]): Promise<PatternAnalysisResult> {
    // Use the strongest model for complex reasoning
    return this.throttle(async () => {
      const incidentList = incidents.slice(0, 20).map(i => 
        `- [${i.timestamp}] ${i.type} (${i.severity}) at ${i.address}: ${i.title}`
      ).join('\n');

      const prompt = `
        Analyze these recent urban incidents to identify patterns for a crisis commander.
        
        Incidents:
        ${incidentList}
        
        Provide:
        1. A trend summary.
        2. Hotspot locations (streets/areas).
        3. Predicted risks for the next 24 hours.
        4. Operational suggestions.
      `;

      const response = await this.ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              hotspots: { type: Type.ARRAY, items: { type: Type.STRING } },
              predictedRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
              operationalSuggestions: { type: Type.STRING }
            }
          }
        }
      });

      return JSON.parse(response.text || "{}") as PatternAnalysisResult;
    });
  }

  async analyzeIncidentComprehensive(incident: Incident): Promise<AIAnalysisResult> {
    // 1. Check IndexedDB Cache first
    const cached = await indexedDBService.getCachedAIAnalysis(incident.id);
    if (cached) {
      console.log(`[GeminiService] Cache Hit for ${incident.id}`);
      return cached;
    }

    console.log(`[GeminiService] Cache Miss for ${incident.id}. Calling API...`);
    
    // 2. Fetch from API if missing
    return this.throttle(async () => {
      const prompt = `
        Analyze this emergency incident report for a dispatch commander.
        
        Incident Details:
        Title: ${incident.title}
        Type: ${incident.type}
        Description: ${incident.description}
        Severity: ${incident.severity}
        Location: ${incident.address}
        
        Provide a tactical analysis including:
        1. Executive summary.
        2. Recommended unit types.
        3. Potential hazards.
        4. Tactical advice.
        5. Estimated resolution time.
      `;

      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            systemInstruction: "You are an expert emergency response coordinator AI.",
            responseMimeType: "application/json",
            responseSchema: {
            type: Type.OBJECT,
            properties: {
                summary: { type: Type.STRING },
                recommendedUnits: { type: Type.ARRAY, items: { type: Type.STRING } },
                hazards: { type: Type.ARRAY, items: { type: Type.STRING } },
                tacticalAdvice: { type: Type.STRING },
                estimatedResolutionTime: { type: Type.STRING }
            },
            required: ["summary", "recommendedUnits", "hazards", "tacticalAdvice", "estimatedResolutionTime"]
            }
        }
      });

      const result = JSON.parse(response.text || "{}") as AIAnalysisResult;
      
      // 3. Save to IndexedDB
      await indexedDBService.cacheAIAnalysis(incident.id, result);
      
      return result;
    });
  }
}

export const geminiService = new GeminiService();
export const analyzeIncidentWithGemini = (incident: Incident) => geminiService.analyzeIncidentComprehensive(incident);