import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import axios from 'axios';
import { calculatePollenLevel } from '../../utils/pollenCalculator'; 
import { extractPollenValues, combineRecommendations } from '../../utils/pollenExtractor';
import { formatApiDate } from '../../utils/dateFormatter';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

interface PollenForecast { // Define structure for daily pollen forecast
  date: string;
  grassPollen: number;
  treePollen: number;
  weedPollen: number;
  pollenLevel: string;
  healthRecommendations: string[];
}

interface PollenResponse { // Define structure for the full API response
  zipCode: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  forecast: PollenForecast[];
}
// Lambda handler function to get pollen data based on ZIP code
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Received event:', JSON.stringify(event));

  try {
    // Validate input
    const zipCode = event.queryStringParameters?.zipCode;
    if (!zipCode) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'ZIP code is required',
          message: 'Please provide a zipCode query parameter',
        }),
      };
    }

    // Step 1: Get coordinates from ZIP code using Geocoding API
    console.log('Fetching coordinates for ZIP code:', zipCode);
    const geocodingUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
    const geocodingResponse = await axios.get(geocodingUrl, {
      params: {
        address: zipCode,
        key: GOOGLE_API_KEY,
      },
    });
    // Validate geocoding response
    if (
      geocodingResponse.data.status !== 'OK' ||
      !geocodingResponse.data.results.length
    ) {
      return { // Return 404 if ZIP code is invalid
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Invalid ZIP code',
          message: 'Could not find location for the provided ZIP code',
        }),
      };
    }
    // Extract latitude and longitude
    const location = geocodingResponse.data.results[0];
    const { lat, lng } = location.geometry.location;
    const formattedAddress = location.formatted_address;

    console.log('Coordinates found:', { lat, lng, formattedAddress });

    // Step 2: Get pollen data using Pollen API
    console.log('Fetching pollen data for coordinates:', { lat, lng });
    const pollenUrl = `https://pollen.googleapis.com/v1/forecast:lookup?key=${GOOGLE_API_KEY}&location.latitude=${lat}&location.longitude=${lng}&days=5`;

    const pollenResponse = await axios.get(pollenUrl); // Fetch pollen data
    console.log('Pollen API response:', JSON.stringify(pollenResponse.data));

    // Step 3: Transform data using utility functions
    const forecast: PollenForecast[] = pollenResponse.data.dailyInfo.map(
      (day: any) => {
        // Extract pollen values using utility
        const extracted = extractPollenValues(day.pollenTypeInfo);

        // Calculate pollen level using utility
        const pollenLevel = calculatePollenLevel(
          extracted.grassPollen,
          extracted.treePollen,
          extracted.weedPollen
        );

        // Combine recommendations using utility
        const healthRecommendations = combineRecommendations(extracted);

        // Format date using utility
        const formattedDate = formatApiDate(day.date);

        return {
          date: formattedDate,
          grassPollen: extracted.grassPollen,
          treePollen: extracted.treePollen,
          weedPollen: extracted.weedPollen,
          pollenLevel,
          healthRecommendations,
        };
      }
    );

    // Step 4: Return response
    const response: PollenResponse = {
      zipCode,
      location: formattedAddress,
      coordinates: { lat, lng },
      forecast,
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(response),
    };
  } catch (error: any) {
    console.error('Error fetching pollen data:', error);

    // Handle different error types
    if (error.response) {
      // API error
      return {
        statusCode: error.response.status || 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'External API error',
          message: error.response.data?.error?.message || 'Failed to fetch data from external API',
        }),
      };
    }

    // Generic error
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing your request',
      }),
    };
  }
};