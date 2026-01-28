import axios from 'axios';
import { query } from './db';
import { extractPollenValues } from '../utils/pollenExtractor';

export async function getHistoricalPollen(dateStr: string, zipCode: string) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    console.log(`[PollenService] Start for ZIP: ${zipCode}, Date: ${dateStr}`);
    console.log(`[PollenService] API_KEY check: ${apiKey ? 'Present (First 5: ' + apiKey.substring(0, 5) + '...)' : 'MISSING'}`);

    // 1. Attempt to fetch from local RDS database first (cost-saving)
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

    // 2. Fallback to Google Pollen API
    if (!apiKey) {
      console.error('[PollenService] Cannot call Google API: Missing API Key in environment');
      return null;
    }

    console.log(`[PollenService] Cache miss. Calling Google Geocoding for ${zipCode}...`);
    
    // Step A: Geocode ZIP code to coordinates
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${apiKey}`;
    const geoRes = await axios.get(geocodingUrl);
    
    if (geoRes.data.status !== 'OK') {
      console.error(`[PollenService] Geocoding failed: ${geoRes.data.status}`, geoRes.data.error_message || '');
      return null;
    }

    const { lat, lng } = geoRes.data.results[0].geometry.location;
    console.log(`[PollenService] Coordinates found: ${lat}, ${lng}`);
    
    // Step B: Fetch forecast from Google Pollen API
    const pollenUrl = `https://pollen.googleapis.com/v1/forecast:lookup?key=${apiKey}&location.latitude=${lat}&location.longitude=${lng}&days=1`;
    const pollenRes = await axios.get(pollenUrl);

    if (!pollenRes.data.dailyInfo || pollenRes.data.dailyInfo.length === 0) {
      console.warn(`[PollenService] Google Pollen API returned no dailyInfo for ${lat}, ${lng}`);
      return null;
    }
    
    // Step C: Extract values using utility
    const extracted = extractPollenValues(pollenRes.data.dailyInfo[0].pollenTypeInfo);
    console.log(`[PollenService] Successfully extracted data:`, extracted);

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