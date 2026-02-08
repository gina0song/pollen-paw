import { api } from './api';
import { CorrelationResponse } from '../types';

export const analysisService = {

  getCorrelation: async (petId: number): Promise<CorrelationResponse> => {
    try {
      console.log('📊 Fetching correlation data for pet:', petId);
      
      const response = await api.get<CorrelationResponse>(
        `/analysis/correlation?petId=${petId}`
      );
      
      console.log('✅ Correlation data received:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Analysis API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch analysis');
    }
  }
};

export type { CorrelationResponse } from '../types';