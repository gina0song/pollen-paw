// ============================================
// GET /symptoms - Fetch symptoms for a specific pet
// ============================================
// Query params: ?petId=123
import { APIGatewayProxyHandler } from 'aws-lambda';
import { query } from '../../services/db';

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Fetching symptoms for request:', event.requestContext.requestId);

  try {
    const petId = event.queryStringParameters?.petId;
    
    if (!petId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'petId query parameter is required' }),
      };
    }

    // TODO: Verify user owns this pet (after auth is implemented)
    const userId = event.requestContext.authorizer?.lambda?.userId || 1;

    // Verify pet exists and belongs to user
    const petCheck = await query(
      'SELECT id FROM pets WHERE id = $1 AND user_id = $2',
      [petId, userId]
    );

    if (petCheck.rows.length === 0) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Pet not found' }),
      };
    }

    // Fetch symptoms for this pet, ordered by date descending
    const result = await query(
      'SELECT * FROM symptom_logs WHERE pet_id = $1 ORDER BY log_date DESC',
      [petId]
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(result.rows),
    };
  } catch (error) {
    console.error('Fetch symptoms error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Failed to fetch symptoms' }),
    };
  }
};