import { APIGatewayProxyHandler } from 'aws-lambda';
import axios from 'axios';
import { query } from '../../services/db';
import { getHistoricalPollen } from '../../services/pollenService';
import { getAirQuality } from '../../services/airQualityService';

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

    const rawData = JSON.parse(event.body);
    
    const symptomData: CreateSymptomBody = {
      pet_id: rawData.petId || rawData.pet_id,
      log_date: rawData.logDate || rawData.log_date,
      eye_symptoms: rawData.eyeSymptoms || rawData.eye_symptoms,
      fur_quality: rawData.furQuality || rawData.fur_quality,
      skin_irritation: rawData.skinIrritation || rawData.skin_irritation,
      respiratory: rawData.respiratory,
      notes: rawData.notes,
      photo_url: rawData.photoUrl || rawData.photo_url 
    };

    if (!symptomData.pet_id) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'pet_id is required' }),
      };
    }

    const validateSymptom = (value?: number, name?: string) => {
      if (value !== undefined && value !== null && (value < 1 || value > 5)) {
        throw new Error(`${name} must be between 1 and 5`);
      }
    };
    validateSymptom(symptomData.eye_symptoms, 'eye_symptoms');
    validateSymptom(symptomData.fur_quality, 'fur_quality');
    validateSymptom(symptomData.skin_irritation, 'skin_irritation');
    validateSymptom(symptomData.respiratory, 'respiratory');

    console.log('Creating symptom for pet_id:', symptomData.pet_id);
    const petOwnerInfo = await query(
      `SELECT u.zip_code FROM users u JOIN pets p ON p.user_id = u.id WHERE p.id = $1`,
      [symptomData.pet_id]
    );
    console.log('Owner user_id:', petOwnerInfo.rows[0].id); 

    if (petOwnerInfo.rows.length === 0) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'Pet not found' }),
      };
    }

    const zipCode = petOwnerInfo.rows[0].zip_code;
    const logDate = symptomData.log_date || new Date().toISOString().split('T')[0];

    try {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${GOOGLE_MAPS_API_KEY}`;
      const geoRes = await axios.get(geocodeUrl);
      if (geoRes.data.status === 'OK') {
        const { lat, lng } = geoRes.data.results[0].geometry.location;
        await Promise.allSettled([
          getHistoricalPollen(logDate, zipCode),
          getAirQuality(lat, lng, zipCode, logDate)
        ]);
      }
    } catch (envError) {
      console.error('[SYNC ERROR] Environmental sync failed:', envError);
    }

    const result = await query(
      `INSERT INTO symptom_logs
       (pet_id, zip_code, log_date, eye_symptoms, fur_quality, skin_irritation, respiratory, notes, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        symptomData.pet_id,
        zipCode,
        logDate,
        symptomData.eye_symptoms || 0,
        symptomData.fur_quality || 0,
        symptomData.skin_irritation || 0,
        symptomData.respiratory || 0,
        symptomData.notes || null,
        symptomData.photo_url || null 
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
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: error.message || 'Internal server error' }),
    };
  }
};