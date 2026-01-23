import { APIGatewayProxyHandler } from 'aws-lambda';
import axios from 'axios';

/**
 *  Google Geocoding API Response
 */
interface GeocodingResponse {
  results: Array<{
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    formatted_address: string;
  }>;
  status: string;
}

/**
 *  Google Pollen API Response
 */
interface GooglePollenResponse {
  regionCode: string;
  dailyInfo: Array<{
    date: { year: number; month: number; day: number };
    pollenTypeInfo: Array<{
      code: string;
      displayName: string;
      inSeason: boolean;
      indexInfo?: {
        value: number;
        category: string;
      };
      healthRecommendations?: string[];
    }>;
  }>;
}

// Lambda Handler
export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Received Lambda Event:', JSON.stringify(event, null, 2));

  try {
    const zipCode = event.queryStringParameters?.zipCode;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    // 1. Validation 
    // Ensure both the user input and the server configuration are present
    if (!zipCode) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'zipCode parameter is required' }),
      };
    }

    if (!apiKey) {
      throw new Error('GOOGLE_MAPS_API_KEY is not defined in environment variables');
    }

    // 2. Geocoding 
    // Convert the ZIP code into Latitude and Longitude using Google Geocoding API
    console.log(`Converting ZIP code ${zipCode} to coordinates...`);
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json`;
    const geoResponse = await axios.get<GeocodingResponse>(geocodeUrl, {
      params: {
        address: zipCode,
        key: apiKey,
      },
    });

    // Handle cases where the ZIP code is invalid or not found
    if (geoResponse.data.status !== 'OK' || !geoResponse.data.results[0]) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: `ZIP code ${zipCode} not found or invalid.` }),
      };
    }

    const { lat, lng } = geoResponse.data.results[0].geometry.location;
    const locationName = geoResponse.data.results[0].formatted_address;

    // 3. Pollen API 
    // Use the coordinates obtained from the Geocoding API to fetch pollen data
    console.log(`Querying Pollen API for: ${locationName} (${lat}, ${lng})`);
    const pollenUrl = `https://pollen.googleapis.com/v1/forecast:lookup`;
    const pollenResponse = await axios.get<GooglePollenResponse>(pollenUrl, {
      params: {
        key: apiKey,
        'location.latitude': lat,
        'location.longitude': lng,
        days: 5,
        languageCode: 'en',
        plantsDescription: true,
      },
      timeout: 10000,
    });

    // 4. Data Transformation 
    // Map the raw Google data into a simplified format for the frontend
    const formattedData = {
      zipCode,
      location: locationName,
      regionCode: pollenResponse.data.regionCode,
      forecast: pollenResponse.data.dailyInfo.map((day) => {
        // Extract specific pollen types
        const grassPollen = day.pollenTypeInfo.find(p => p.code === 'GRASS');
        const treePollen = day.pollenTypeInfo.find(p => p.code === 'TREE');
        const weedPollen = day.pollenTypeInfo.find(p => p.code === 'WEED');
        
        // Determine the overall risk level based on the highest index value
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

    // 5. Success Response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(formattedData),
    };

  } catch (error: any) {
    // 6. Error Handling
    console.error('Error in getPollenData handler:', error);

    let errorMessage = 'An internal server error occurred';
    let statusCode = 500;

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
      body: JSON.stringify({ error: errorMessage, zipCode: event.queryStringParameters?.zipCode }),
    };
  }
};