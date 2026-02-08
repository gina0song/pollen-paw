import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import axios from 'axios';
import { getAirQuality } from '../../services/airQualityService';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export const handler: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  console.log('--- [START] getAirQualityData Handler ---');
  
  try {
    const zipCode = event.queryStringParameters?.zipCode;
    console.log(`[STEP 1] Received zipCode: ${zipCode}`);

    if (!zipCode) {
      console.warn('[WARN] No zipCode provided');
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'ZIP code is required' }),
      };
    }

    console.log(`[STEP 2] Calling Geocoding API for zipCode: ${zipCode}...`);
    const geocodingUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
    const geocodingResponse = await axios.get(geocodingUrl, {
      params: {
        address: zipCode,
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    if (geocodingResponse.data.status !== 'OK' || !geocodingResponse.data.results.length) {
      console.error(`[ERROR] Geocoding failed: ${geocodingResponse.data.status}`);
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid ZIP code' }),
      };
    }

    const { lat, lng } = geocodingResponse.data.results[0].geometry.location;
    const dateStr = new Date().toISOString().split('T')[0];
    console.log(`[STEP 3] Coordinates found: ${lat}, ${lng}. Date: ${dateStr}`);

    console.log('[STEP 4] Entering airQualityService...');
    
    const aqi = await getAirQuality(lat, lng, zipCode, dateStr);

    console.log(`[STEP 5] airQualityService finished. Result (AQI): ${aqi}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        zipCode,
        date: dateStr,
        aqi: aqi,
        coordinates: { lat, lng },
        debug: "AQI request completed"
      }),
    };

  } catch (error: any) {
    console.error('--- [FATAL ERROR] ---');
    console.error('Error Message:', error.message);
    console.error('Stack Trace:', error.stack);
    
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
    };
  } finally {
    console.log('--- [END] getAirQualityData Handler ---');
  }
};