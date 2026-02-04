import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { query } from '../../services/db';

export const handler: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  try {
    const rawPetId = event.queryStringParameters?.petId;
    if (!rawPetId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'petId is required' })
      };
    }

    const petId = parseInt(rawPetId, 10);
    const userId = parseInt(event.queryStringParameters?.userId || "1", 10);
    console.log('🔍 Querying symptoms - petId:', petId, ', userId:', userId);

    const result = await query(
      `SELECT
        s.id,
        s.pet_id as "petId",
        s.log_date as "logDate",
        s.eye_symptoms as "eyeSymptoms",
        s.fur_quality as "furQuality",
        s.skin_irritation as "skinIrritation",
        s.respiratory,
        s.notes,
        s.photo_url as "photoUrl",
        s.created_at as "createdAt",
        e.tree_pollen as "treePollen",
        e.grass_pollen as "grassPollen",
        e.weed_pollen as "weedPollen",
        e.air_quality as "airQuality"
      FROM symptom_logs s
      INNER JOIN pets p ON s.pet_id = p.id
      LEFT JOIN environmental_data e
        ON s.zip_code = e.zip_code
        AND s.log_date = e.date
      WHERE s.pet_id = $1 AND p.user_id = $2
      ORDER BY s.log_date DESC`,
      [petId, userId]
    );

    console.log('✅ Found', result.rows.length, 'symptoms');

    const enrichedRows = result.rows.map(row => ({
      ...row,
      photoUrl: row.photoUrl || "", 
      pollen_data: row.treePollen !== null ? {
        treePollen: row.treePollen,
        grassPollen: row.grassPollen,
        weedPollen: row.weedPollen,
        airQuality: row.airQuality,
        source: "RDS_DATABASE"
      } : null
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(enrichedRows),
    };

  } catch (error: any) {
    console.error('❌ getSymptoms error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};