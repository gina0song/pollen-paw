import { APIGatewayProxyHandler } from 'aws-lambda';
import axios from 'axios';
import { query } from '../../services/db';
import { getHistoricalPollen } from '../../services/pollenService'; 
import { getAirQuality } from '../../services/airQualityService'; // 导入新 Service

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

interface CreateSymptomBody {
  pet_id: number;
  log_date?: string;
  eye_symptoms?: number;      
  fur_quality?: number;      
  skin_irritation?: number; 
  respiratory?: number;       
  notes?: string;
  photo_url?: string;   
}

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('--- [START] Create Symptom Log ---');

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'Request body is required' }),
      };
    }

    const symptomData: CreateSymptomBody = JSON.parse(event.body);

    if (!symptomData.pet_id) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'pet_id is required' }),
      };
    }

    // 1. 验证症状分值 (1-5)
    const validateSymptom = (value?: number, name?: string) => {
      if (value !== undefined && (value < 1 || value > 5)) {
        throw new Error(`${name} must be between 1 and 5`);
      }
    };
    validateSymptom(symptomData.eye_symptoms, 'eye_symptoms');
    validateSymptom(symptomData.fur_quality, 'fur_quality');
    validateSymptom(symptomData.skin_irritation, 'skin_irritation');
    validateSymptom(symptomData.respiratory, 'respiratory');

    // 2. 获取 Pet 关联的邮编
    const petOwnerInfo = await query(
      `SELECT u.zip_code FROM users u JOIN pets p ON p.user_id = u.id WHERE p.id = $1`,
      [symptomData.pet_id]
    );

    if (petOwnerInfo.rows.length === 0) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'Pet not found' }),
      };
    }

    const zipCode = petOwnerInfo.rows[0].zip_code;
    const logDate = symptomData.log_date || new Date().toISOString().split('T')[0];

    // 3. 环境数据自动抓取逻辑
    console.log(`[SYNC] Auto-fetching data for zip: ${zipCode} on ${logDate}`);
    try {
      // 3a. 先通过 Geocoding 获取经纬度 (Air Quality 必须使用坐标)
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${GOOGLE_MAPS_API_KEY}`;
      const geoRes = await axios.get(geocodeUrl);
      
      if (geoRes.data.status === 'OK') {
        const { lat, lng } = geoRes.data.results[0].geometry.location;

        // 3b. 并行调用花粉和空气质量服务
        // 使用 allSettled 确保即便一个 API 出错，另一个也能尝试完成
        console.log(`[SYNC] Dispatching Pollen and AQI requests for ${lat}, ${lng}...`);
        await Promise.allSettled([
          getHistoricalPollen(logDate, zipCode), // 内部已有数据库持久化
          getAirQuality(lat, lng, zipCode, logDate) // 内部已有数据库持久化
        ]);
        
        console.log('[SYNC] Environmental data synchronization attempt finished.');
      } else {
        console.warn(`[SYNC] Geocoding failed for zip ${zipCode}, skipping environment sync.`);
      }
    } catch (envError) {
      console.error('[SYNC ERROR] Environmental sync failed:', envError);
      // 不抛出错误，继续保存症状日记
    }

    // 4. 插入症状日志 (持久化)
    const result = await query(
      `INSERT INTO symptom_logs 
       (pet_id, zip_code, log_date, eye_symptoms, fur_quality, skin_irritation, respiratory, notes, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        symptomData.pet_id,
        zipCode,
        logDate,
        symptomData.eye_symptoms || null,     
        symptomData.fur_quality || null,     
        symptomData.skin_irritation || null,  
        symptomData.respiratory || null,      
        symptomData.notes || null,
        symptomData.photo_url || null,       
      ]
    );

    console.log('--- [SUCCESS] Symptom log created ---');
    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(result.rows[0]),
    };

  } catch (error: any) {
    console.error('--- [ERROR] Create Symptom Failed ---', error);
    const statusCode = error.message.includes('must be between') ? 400 : 500;
    return {
      statusCode,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: error.message || 'Internal server error' }),
    };
  }
};