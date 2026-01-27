import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { query } from '../../services/db';
import { getHistoricalPollen } from '../../services/pollenService';

export const handler: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  try {
    const petId = event.queryStringParameters?.petId;
    const userId = event.requestContext.authorizer?.lambda?.userId || 1;

    if (!petId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'petId is required' })
      };
    }

    // 1. Get pet ZIP code and verify ownership
    const petResult = await query(
      `SELECT p.id, u.zip_code 
       FROM pets p 
       JOIN users u ON p.user_id = u.id 
       WHERE p.id = $1 AND p.user_id = $2`,
      [petId, userId]
    );

    if (petResult.rows.length === 0) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'Pet not found' })
      };
    }

    const zipCode = petResult.rows[0].zip_code;

    // 2. Fetch logs
    const symptomsResult = await query(
      'SELECT * FROM symptom_logs WHERE pet_id = $1 ORDER BY log_date DESC',
      [petId]
    );

    // 3. Parallel Enrichment with Pollen Data
    const enrichedRows = await Promise.all(
      symptomsResult.rows.map(async (row) => {
        // Format to YYYY-MM-DD
        const logDateStr = new Date(row.log_date).toISOString().split('T')[0];
        
        let pollenData = null;
        if (zipCode) {
          pollenData = await getHistoricalPollen(logDateStr, zipCode);
        }

        // Map snake_case DB fields to CamelCase if your frontend types strictly require it
        // Or keep them as is if your frontend can handle both
        return {
          id: row.id,
          petId: row.pet_id,
          logDate: row.log_date,
          eyeSymptoms: row.eye_symptoms,
          furQuality: row.fur_quality,
          skinIrritation: row.skin_irritation,
          respiratory: row.respiratory,
          notes: row.notes,
          photoUrl: row.photo_url,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          pollen_data: pollenData
        };
      })
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(enrichedRows),
    };

  } catch (error) {
    console.error('Fetch symptoms error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};