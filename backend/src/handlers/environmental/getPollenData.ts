import { APIGatewayProxyHandler } from 'aws-lambda';
import axios from 'axios';

/**
 * Static ZIP code to coordinates mapping for the Seattle area.
 * In a real-world scenario, this could be extended with a Geocoding API.
 */
const zipCodeMap: Record<string, { lat: number; lon: number; city: string }> = {
  '98074': { lat: 47.6149, lon: -122.0326, city: 'Sammamish, WA' },
  '98052': { lat: 47.6740, lon: -122.1215, city: 'Redmond, WA' },
  '98004': { lat: 47.6144, lon: -122.2090, city: 'Bellevue, WA' },
  '98033': { lat: 47.6770, lon: -122.1903, city: 'Kirkland, WA' },
  '98109': { lat: 47.6376, lon: -122.3465, city: 'Seattle, WA' },
  '33101': { lat: 25.7617, lon: -80.1918, city: 'Miami, FL' },
};

interface GooglePollenResponse {
  regionCode: string;
  dailyInfo: Array<{
    date: {
      year: number;
      month: number;
      day: number;
    };
    pollenTypeInfo: Array<{
      code: string; // e.g., "GRASS", "TREE", "WEED"
      displayName: string;
      inSeason: boolean;
      indexInfo?: {
        code: string;
        displayName: string;
        value: number; // 0-5 index
        category: string; // e.g., "Very Low", "High"
        indexDescription: string;
        color: {
          red?: number;
          green?: number;
          blue?: number;
        };
      };
      healthRecommendations?: string[];
    }>;
    plantInfo?: Array<{
      code: string;
      displayName: string;
      inSeason: boolean;
      indexInfo?: {
        value: number;
        category: string;
      };
    }>;
  }>;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Received Lambda Event:', JSON.stringify(event, null, 2));

  try {
    const zipCode = event.queryStringParameters?.zipCode;

    // Validate Input
    if (!zipCode) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'zipCode parameter is required' }),
      };
    }

    const coords = zipCodeMap[zipCode];
    if (!coords) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: `ZIP code ${zipCode} is not currently supported. Supported ZIP codes: ${Object.keys(zipCodeMap).join(', ')}`,
        }),
      };
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_MAPS_API_KEY is not defined in environment variables');
    }

    console.log(`Querying Google Pollen API for ZIP: ${zipCode} at (${coords.lat}, ${coords.lon})`);

    // Fetch 5-day forecast from Google
    const url = `https://pollen.googleapis.com/v1/forecast:lookup`;
    const response = await axios.get<GooglePollenResponse>(url, {
      params: {
        key: apiKey,
        'location.latitude': coords.lat,
        'location.longitude': coords.lon,
        days: 5,
        languageCode: 'en',
        plantsDescription: true,
      },
      timeout: 10000,
    });

    console.log('Google Raw Data:', JSON.stringify(response.data.dailyInfo[0], null, 2));

    // Transform and Format the Response for Frontend Consumption
    const formattedData = {
      zipCode,
      location: coords.city,
      regionCode: response.data.regionCode,
      forecast: response.data.dailyInfo.map((day) => {
        // 提取各类型花粉数据
        const grassPollen = day.pollenTypeInfo.find(p => p.code === 'GRASS');
        const treePollen = day.pollenTypeInfo.find(p => p.code === 'TREE');
        const weedPollen = day.pollenTypeInfo.find(p => p.code === 'WEED');
        
        // 计算总体花粉等级
        const maxValue = Math.max(
          grassPollen?.indexInfo?.value ?? 0,
          treePollen?.indexInfo?.value ?? 0,
          weedPollen?.indexInfo?.value ?? 0
        );
        
        const pollenLevel = maxValue >= 4 ? 'VERY_HIGH' :
                          maxValue >= 3 ? 'HIGH' :
                          maxValue >= 2 ? 'MODERATE' : 'LOW';
        
        return {
          date: `${day.date.year}-${String(day.date.month).padStart(2, '0')}-${String(day.date.day).padStart(2, '0')}`,
          pollenLevel,
          grassPollen: grassPollen?.indexInfo?.value ?? 0,
          treePollen: treePollen?.indexInfo?.value ?? 0,
          weedPollen: weedPollen?.indexInfo?.value ?? 0,
          recommendation: grassPollen?.healthRecommendations?.[0] ?? 'No specific recommendations',
        };
      }),
      metadata: {
        source: 'Google Maps Platform',
        timestamp: new Date().toISOString(),
      },
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(formattedData),
    };

  } catch (error: any) {
    console.error('Error in getPollenData handler:', error);

    let errorMessage = 'An internal server error occurred';
    let statusCode = 500;

    // Comprehensive Error Handling for Axios/External API issues
    if (axios.isAxiosError(error)) {
      errorMessage = `External API Error: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`;
      statusCode = error.response?.status || 500;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: errorMessage,
        zipCode: event.queryStringParameters?.zipCode,
      }),
    };
  }
};