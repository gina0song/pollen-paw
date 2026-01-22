import { APIGatewayProxyHandler } from 'aws-lambda';
import axios from 'axios';

/**
 * Static ZIP code to coordinates mapping for the Seattle area.
 * In a real-world scenario, this could be extended with a Geocoding API.
 */
const zipCodeMap: Record<string, { lat: number; lon: number }> = {
  '98074': { lat: 47.6149, lon: -122.0326 }, // Sammamish, WA
  '98052': { lat: 47.6740, lon: -122.1215 }, // Redmond, WA
  '98004': { lat: 47.6144, lon: -122.2090 }, // Bellevue, WA
  '98033': { lat: 47.6770, lon: -122.1903 }, // Kirkland, WA
  '98109': { lat: 47.6376, lon: -122.3465 }, // Seattle, WA
  '33101': { lat: 25.7617, lon: -80.1918 }, // Miami, FL (For testing active pollen)
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
          error: `ZIP code ${zipCode} is not currently mapped in our local database.`,
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
      location: {
        latitude: coords.lat,
        longitude: coords.lon,
      },
      regionCode: response.data.regionCode,
      forecast: response.data.dailyInfo.map((day) => ({
        date: `${day.date.year}-${String(day.date.month).padStart(2, '0')}-${String(day.date.day).padStart(2, '0')}`,
        // Safely map pollen types using Optional Chaining
        pollenTypes: day.pollenTypeInfo.map((pollen) => ({
          type: pollen.code,
          displayName: pollen.displayName,
          inSeason: pollen.inSeason,
          index: {
            value: pollen.indexInfo?.value ?? 0,
            category: pollen.indexInfo?.category ?? 'No Data',
            description: pollen.indexInfo?.indexDescription ?? 'Data unavailable for this type.',
            color: pollen.indexInfo?.color ?? { red: 200, green: 200, blue: 200 },
          },
          healthRecommendations: pollen.healthRecommendations ?? [],
        })),
        // Safely map individual plants if present
        plants: day.plantInfo?.map((plant) => ({
          code: plant.code,
          displayName: plant.displayName,
          inSeason: plant.inSeason,
          index: {
            value: plant.indexInfo?.value ?? 0,
            category: plant.indexInfo?.category ?? 'No Data',
          },
        })) || [],
      })),
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