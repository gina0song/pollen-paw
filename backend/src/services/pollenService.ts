import axios from 'axios';
import { query } from './db';
import { extractPollenValues } from '../utils/pollenExtractor';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function getHistoricalPollen(dateStr: string, zipCode: string) {
  try {
    // 1. Attempt to fetch from local RDS database first (cost-saving)
    const dbResult = await query(
      `SELECT tree_pollen, grass_pollen, weed_pollen, air_quality 
       FROM environmental_data 
       WHERE zip_code = $1 AND date = $2`,
      [zipCode, dateStr]
    );

    if (dbResult.rows.length > 0) {
      const row = dbResult.rows[0];
      return {
        treePollen: row.tree_pollen,
        grassPollen: row.grass_pollen,
        weedPollen: row.weed_pollen,
        airQuality: row.air_quality
      };
    }

    // 2. Fallback to Google Pollen API if data is not in the database
    console.log(`Cache/DB miss for ${zipCode} on ${dateStr}, calling Google API...`);
    
    // Step A: Geocode ZIP code to coordinates
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${GOOGLE_MAPS_API_KEY}`;
    const geoRes = await axios.get(geocodingUrl);
    if (geoRes.data.status !== 'OK') return null;

    const { lat, lng } = geoRes.data.results[0].geometry.location;
    
    // Step B: Fetch forecast from Google Pollen API
    const pollenUrl = `https://pollen.googleapis.com/v1/forecast:lookup?key=${GOOGLE_MAPS_API_KEY}&location.latitude=${lat}&location.longitude=${lng}&days=1`;
    const pollenRes = await axios.get(pollenUrl);

    if (!pollenRes.data.dailyInfo || pollenRes.data.dailyInfo.length === 0) return null;
    
    // Step C: Extract values using utility
    const extracted = extractPollenValues(pollenRes.data.dailyInfo[0].pollenTypeInfo);

    return {
      treePollen: extracted.treePollen,
      grassPollen: extracted.grassPollen,
      weedPollen: extracted.weedPollen,
      airQuality: null // Forecast API typically does not provide AQI
    };

  } catch (error) {
    console.error(`[PollenService] Failed to retrieve pollen data:`, error);
    return null;
  }
}