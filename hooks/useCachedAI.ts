import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Incident, AIAnalysisResult, PatternAnalysisResult } from '../types';
import { geminiService } from '../services/geminiService';

// Keys for React Query
export const AI_KEYS = {
  all: ['ai'] as const,
  incident: (id: string) => [...AI_KEYS.all, 'incident', id] as const,
  pattern: () => [...AI_KEYS.all, 'pattern'] as const,
};

// Hook for Single Incident Analysis
export const useCachedIncidentAnalysis = (incident: Incident | undefined, enabled: boolean = false) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: AI_KEYS.incident(incident?.id || 'unknown'),
    queryFn: async () => {
      if (!incident) throw new Error("No incident provided");
      return geminiService.analyzeIncidentComprehensive(incident);
    },
    enabled: !!incident && enabled,
    staleTime: 1000 * 60 * 60, // Consider analysis fresh for 1 hour in memory
    gcTime: 1000 * 60 * 60 * 24, // Keep in memory cache for 24 hours (renamed from cacheTime)
    // If we have cached data, don't refetch automatically on window focus to save API costs
    refetchOnWindowFocus: false, 
  });
};

// Hook for Pattern Analysis
export const useCachedPatternAnalysis = () => {
  return useMutation({
    mutationFn: (incidents: Incident[]) => geminiService.analyzeIncidentPattern(incidents),
  });
};

// Hook for manually prefetching/analyzing (used by buttons)
export const useRunAnalysis = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (incident: Incident) => geminiService.analyzeIncidentComprehensive(incident),
    onSuccess: (data, variables) => {
      // Update the query cache manually so useQuery reads it immediately
      queryClient.setQueryData(AI_KEYS.incident(variables.id), data);
    }
  });
};