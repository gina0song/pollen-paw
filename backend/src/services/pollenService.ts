import axios from 'axios';
import { query } from './db';
import { extractPollenValues } from '../utils/pollenExtractor';

export async function getHistoricalPollen(dateStr: string, zipCode: string) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    console.log(`[PollenService] Start for ZIP: ${zipCode}, Date: ${dateStr}`);
    console.log(`[PollenService] API_KEY check: ${apiKey ? 'Present (First 5: ' + apiKey.substring(0, 5) + '...)' : 'MISSING'}`);

    const dbResult = await query(
      `SELECT tree_pollen, grass_pollen, weed_pollen, air_quality
       FROM environmental_data
       WHERE zip_code = $1 AND date = $2`,
      [zipCode, dateStr]
    );

    if (dbResult.rows.length > 0) {
      console.log(`[PollenService] Cache hit in DB for ${zipCode}`);
      const row = dbResult.rows[0];
      return {
        treePollen: row.tree_pollen,
        grassPollen: row.grass_pollen,
        weedPollen: row.weed_pollen,
        airQuality: row.air_quality
      };
    }

    if (!apiKey) {
      console.error('[PollenService] Cannot call Google API: Missing API Key in environment');
      return null;
    }

    console.log(`[PollenService] Cache miss. Calling Google Geocoding for ${zipCode}...`);

    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${apiKey}`;
    const geoRes = await axios.get(geocodingUrl);

    if (geoRes.data.status !== 'OK') {
      console.error(`[PollenService] Geocoding failed: ${geoRes.data.status}`, geoRes.data.error_message || '');
      return null;
    }

    const { lat, lng } = geoRes.data.results[0].geometry.location;
    console.log(`[PollenService] Coordinates found: ${lat}, ${lng}`);

    const pollenUrl = `https://pollen.googleapis.com/v1/forecast:lookup?key=${apiKey}&location.latitude=${lat}&location.longitude=${lng}&days=1&plantsDescription=true`;
    
    console.log(`[PollenService] Calling Google Pollen API...`);
    const pollenRes = await axios.get(pollenUrl);

    if (!pollenRes.data.dailyInfo || pollenRes.data.dailyInfo.length === 0) {
      console.warn(`[PollenService] Google Pollen API returned no dailyInfo for ${lat}, ${lng}`);
      return null;
    }

    const dailyInfo = pollenRes.data.dailyInfo[0];
    console.log(`[PollenService] Received dailyInfo for date: ${dailyInfo.date.year}-${dailyInfo.date.month}-${dailyInfo.date.day}`);

    if (!dailyInfo.plantInfo || dailyInfo.plantInfo.length === 0) {
      console.warn(`[PollenService] Google Pollen API returned no plantInfo`);
      return null;
    }

    const extracted = extractPollenValues(dailyInfo.plantInfo);
    console.log(`[PollenService] Successfully extracted data:`, extracted);

    try {
      await query(
        `INSERT INTO environmental_data (zip_code, date, tree_pollen, grass_pollen, weed_pollen)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (zip_code, date) DO UPDATE SET
         tree_pollen = $3,
         grass_pollen = $4,
         weed_pollen = $5`,
        [zipCode, dateStr, extracted.treePollen, extracted.grassPollen, extracted.weedPollen]
      );
      console.log(`[PollenService] Saved pollen data to database for ${zipCode} on ${dateStr}`);
    } catch (dbError: any) {
      console.error(`[PollenService] Failed to save to database:`, dbError.message);
    }

    return {
      treePollen: extracted.treePollen,
      grassPollen: extracted.grassPollen,
      weedPollen: extracted.weedPollen,
      airQuality: null
    };

  } catch (error: any) {
    console.error(`[PollenService] Critical Error:`, error.response?.data || error.message);
    return null;
  }
}
