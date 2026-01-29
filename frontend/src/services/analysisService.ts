// ============================================
// Analysis Service
// ============================================

import { api } from './api';

export interface CorrelationResponse {
  daysAnalyzed: number;
  correlations: {
    treePollen: number;
    airQuality: number;
  };
  suggestion: string;
  message?: string; 
}

export const analysisService = {
  /**
    GET /analysis/correlation?petId=xxx
   */
  getCorrelation: async (petId: number): Promise<CorrelationResponse> => {
    try {
      const response = await api.get<CorrelationResponse>(`/analysis/correlation?petId=${petId}`);
      return response;
    } catch (error: any) {
      console.error('Analysis API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch analysis');
    }
  }
};