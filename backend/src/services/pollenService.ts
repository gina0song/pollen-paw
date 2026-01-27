import axios from 'axios';
import { calculatePollenLevel } from '../utils/pollenCalculator'; 
import { extractPollenValues } from '../utils/pollenExtractor';
import { formatApiDate } from '../utils/dateFormatter';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Simple in-memory cache
const pollenCache = new Map<string, any>();

export async function getHistoricalPollen(dateStr: string, zipCode: string) {
  const cacheKey = `${zipCode}-${dateStr}`;
  
  // 1. Check cache first
  if (pollenCache.has(cacheKey)) {
    return pollenCache.get(cacheKey);
  }

  try {
    // 2. Step 1: Geocoding (reuse getPollenData logic here)
    const geocodingUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
    const geocodingResponse = await axios.get(geocodingUrl, {
      params: { address: zipCode, key: GOOGLE_MAPS_API_KEY },
    });

    if (geocodingResponse.data.status !== 'OK') return null;
    const { lat, lng } = geocodingResponse.data.results[0].geometry.location;
     // 3. Step 2: Fetch pollen data
    const pollenUrl = `https://pollen.googleapis.com/v1/forecast:lookup?key=${GOOGLE_MAPS_API_KEY}&location.latitude=${lat}&location.longitude=${lng}&days=5`;
    const pollenResponse = await axios.get(pollenUrl);

    if (!pollenResponse.data.dailyInfo) return null;

    // 4. Step 3: Extract pollen data for the specified date
    const dayData = pollenResponse.data.dailyInfo.find((day: any) => {
      return formatApiDate(day.date) === dateStr;
    });

    if (!dayData) return null;

    const extracted = extractPollenValues(dayData.pollenTypeInfo);
    const pollenLevel = calculatePollenLevel(
      extracted.grassPollen,
      extracted.treePollen,
      extracted.weedPollen
    );

    const result = {
      grassPollen: extracted.grassPollen,
      treePollen: extracted.treePollen,
      weedPollen: extracted.weedPollen,
      pollenLevel
    };

    // 5. Cache the result
    pollenCache.set(cacheKey, result);
    return result;

  } catch (error) {
    console.error(`[PollenService] 抓取失败 (${zipCode} @ ${dateStr}):`, error);
    return null; // Gracefully handle errors
  }
}