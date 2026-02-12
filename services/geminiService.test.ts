import { geminiService } from './geminiService';
import { GoogleGenAI } from '@google/genai';
import { MOCK_INCIDENTS, MOCK_SERVICES } from './mockData';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock the GoogleGenAI SDK
jest.mock('@google/genai', () => {
  const generateContentMock = jest.fn();
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      models: {
        generateContent: generateContentMock
      }
    })),
    Type: {
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      ARRAY: 'ARRAY'
    }
  };
});

describe('GeminiService', () => {
  let mockGenerateContent: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Get the instance of the mock function
    const aiInstance = new (GoogleGenAI as any)();
    mockGenerateContent = aiInstance.models.generateContent;
  });

  it('summarizeIncident calls generateContent with correct prompt', async () => {
    const incident = MOCK_INCIDENTS[0];
    
    // Mock response
    mockGenerateContent.mockResolvedValue({
      text: 'A critical fire incident.'
    });

    const summary = await geminiService.summarizeIncident(incident);

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent).toHaveBeenCalledWith(expect.objectContaining({
      model: "gemini-3-flash-preview",
      contents: expect.stringContaining(incident.title),
    }));
    expect(summary).toBe('A critical fire incident.');
  });

  it('generateDispatchRecommendation parses JSON response', async () => {
    const incident = MOCK_INCIDENTS[0];
    const services = MOCK_SERVICES;

    const mockResponse = {
      unitIds: ['svc-101'],
      rationale: 'Closest unit',
      priority: 'High'
    };

    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify(mockResponse)
    });

    const recommendation = await geminiService.generateDispatchRecommendation(incident, services);

    expect(recommendation).toEqual(mockResponse);
    expect(mockGenerateContent).toHaveBeenCalledWith(expect.objectContaining({
      config: expect.objectContaining({
        responseMimeType: "application/json"
      })
    }));
  });

  it('handles API errors gracefully', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API Error'));
    const result = await geminiService.summarizeIncident(MOCK_INCIDENTS[0]);
    expect(result).toBe('Summary unavailable.');
  });
});