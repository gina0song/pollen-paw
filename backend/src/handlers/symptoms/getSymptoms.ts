import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { query } from '../../services/db';

export const handler: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  try {
    const petId = event.queryStringParameters?.petId;
    
    // Get userId from Lambda Authorizer context, defaulting to 1 for development/testing
    const userId = event.requestContext.authorizer?.lambda?.userId || 1;

    if (!petId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json', 
          'Access-Control-Allow-Origin': '*' 
        },
        body: JSON.stringify({ message: 'petId is required' })
      };
    }

    /**
     * Fetch symptoms joined with environmental data and pet ownership verification.
     * We use INNER JOIN with 'pets' to ensure the pet belongs to the requesting userId.
     * We use LEFT JOIN with 'environmental_data' to include pollen info if it exists for that zip/date.
     */
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

    // Map database rows to the enriched JSON structure expected by the frontend
    const enrichedRows = result.rows.map(row => ({
      id: row.id,
      petId: row.petId,
      logDate: row.logDate,
      eyeSymptoms: row.eyeSymptoms,
      furQuality: row.furQuality,
      skinIrritation: row.skinIrritation,
      respiratory: row.respiratory,
      notes: row.notes,
      createdAt: row.createdAt,
      // If the LEFT JOIN found pollen data, structure it into an object
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
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*' 
      },
      body: JSON.stringify(enrichedRows),
    };

  } catch (error) {
    console.error('Fetch symptoms error:', error);
    return {
      statusCode: 500,
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*' 
      },
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};