import { APIGatewayProxyHandler } from 'aws-lambda';
import { query } from '../../services/db';

interface UpdateSymptomBody {
  eye_symptoms?: number;
  fur_quality?: number;
  skin_irritation?: number;
  respiratory?: number;
  notes?: string;
  photo_url?: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('--- [START] Update Symptom Log ---');

  try {
    const symptomId = event.pathParameters?.id;
    const userId = event.requestContext.authorizer?.lambda?.userId || 
                   parseInt(event.queryStringParameters?.userId || "7", 10);
    
    if (!symptomId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'Symptom ID is required' }),
      };
    }

    if (!event.body) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'Request body is required' }),
      };
    }

    const rawData = JSON.parse(event.body);

    const updateData: UpdateSymptomBody = {
      eye_symptoms: rawData.eyeSymptoms !== undefined ? rawData.eyeSymptoms : rawData.eye_symptoms,
      fur_quality: rawData.furQuality !== undefined ? rawData.furQuality : rawData.fur_quality,
      skin_irritation: rawData.skinIrritation !== undefined ? rawData.skinIrritation : rawData.skin_irritation,
      respiratory: rawData.respiratory !== undefined ? rawData.respiratory : rawData.respiratory,
      notes: rawData.notes,
      photo_url: rawData.photoUrl || rawData.photo_url // 
    };

    const validateSymptom = (value?: number, name?: string) => {
      if (value !== undefined && value !== null && (value < 1 || value > 5)) {
        throw new Error(`${name} must be between 1 and 5`);
      }
    };

    validateSymptom(updateData.eye_symptoms, 'eye_symptoms');
    validateSymptom(updateData.fur_quality, 'fur_quality');
    validateSymptom(updateData.skin_irritation, 'skin_irritation');
    validateSymptom(updateData.respiratory, 'respiratory');

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    const fields = ['eye_symptoms', 'fur_quality', 'skin_irritation', 'respiratory', 'notes', 'photo_url'];
    fields.forEach(field => {
      const val = updateData[field as keyof UpdateSymptomBody];
      if (val !== undefined) {
        updates.push(`${field} = $${paramCount++}`);
        values.push(val);
      }
    });

    if (updates.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'No fields to update' }),
      };
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    
    values.push(symptomId);
    values.push(userId);

    const result = await query(
      `UPDATE symptom_logs 
       SET ${updates.join(', ')}
       WHERE id = $${paramCount++} 
       AND pet_id IN (SELECT id FROM pets WHERE user_id = $${paramCount++})
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'Symptom log not found or unauthorized' }),
      };
    }

    console.log('--- [SUCCESS] Symptom log updated ---');
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(result.rows[0]),
    };
  } catch (error: any) {
    console.error('Update symptom error:', error);
    const status = error.message.includes('must be between') ? 400 : 500;
    return {
      statusCode: status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: status === 400 ? error.message : 'Failed to update symptom log' }),
    };
  }
};