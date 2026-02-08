import axios from 'axios';
import { query } from './db';

export async function getAirQuality(lat: number, lng: number, zipCode: string, dateStr: string) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  try {
    const url = `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${apiKey}`;
    console.log(`[AQI Service] Requesting Google API for lat: ${lat}, lng: ${lng}`);

    const response = await axios.post(url, {
      location: { latitude: lat, longitude: lng }
    });

    console.log('[AQI Service] Raw Google Response:', JSON.stringify(response.data));

    let aqi = null;
    if (response.data && response.data.indexes && response.data.indexes.length > 0) {
      aqi = response.data.indexes[0].aqi;
      if (aqi === undefined) aqi = response.data.indexes[0].value;
    }

    if (aqi === null || aqi === undefined) {
      console.warn('[AQI Service] Could not find AQI value in Google response');
      return null;
    }

    console.log(`[AQI Service] Found AQI: ${aqi}. Updating Database...`);

    await query(`
      INSERT INTO environmental_data (zip_code, date, air_quality)
      VALUES ($1, $2, $3)
      ON CONFLICT (zip_code, date) 
      DO UPDATE SET air_quality = EXCLUDED.air_quality, created_at = NOW()
    `, [zipCode, dateStr, aqi]);

    return aqi;
  } catch (error: any) {
    console.error('[AQI Service Error]:', error.response?.data || error.message);
    return null;
  }
}