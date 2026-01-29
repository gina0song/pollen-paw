// ============================================
// Environmental Data Service
// Fetches pollen and air quality data
// ============================================
import { api } from './api';

export interface PollenForecast {
  date: string;
  grassPollen: number;
  treePollen: number;
  weedPollen: number;
  pollenLevel: string;
  healthRecommendations: string[];
}

export interface PollenResponse {
  zipCode: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  forecast: PollenForecast[];
}

export interface AirQualityResponse {
  zipCode: string;
  date: string;
  aqi: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const environmentalService = {
  /**
   * Get pollen data for user's ZIP code
   */
  getPollenData: async (zipCode: string): Promise<PollenResponse> => {
    try {
      const response = await api.get<PollenResponse>(`/environmental/pollen?zipCode=${zipCode}`);
      return response;
    } catch (error: any) {
      console.error('Get pollen data error:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch pollen data');
    }
  },

  /**
   * Get air quality data for user's ZIP code
   */
  getAirQualityData: async (zipCode: string): Promise<AirQualityResponse> => {
    try {
      const response = await api.get<AirQualityResponse>(`/environmental/air-quality?zipCode=${zipCode}`);
      return response;
    } catch (error: any) {
      console.error('Get air quality data error:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch air quality data');
    }
  },

  /**
   * Get today's pollen forecast
   */
  getTodaysPollen: async (zipCode: string): Promise<PollenForecast | null> => {
    try {
      const data = await environmentalService.getPollenData(zipCode);
      // Return today's forecast (first item in array)
      return data.forecast && data.forecast.length > 0 ? data.forecast[0] : null;
    } catch (error) {
      console.error('Failed to get today\'s pollen:', error);
      return null;
    }
  },
};

export default environmentalService;