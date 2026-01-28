// ============================================
// GET /pets/{id} - Fetch a single pet by ID
// ============================================
import { APIGatewayProxyHandler } from 'aws-lambda';
import { query } from '../../services/db';

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Fetching pet details for request:', event.requestContext.requestId);

  try {
    const petId = event.pathParameters?.id;
    
    if (!petId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Pet ID is required' }),
      };
    }

    // for future  JWT : Add userId verification to ensure user owns this pet
    
    // for future  JWT : Add userId verification to ensure user owns this pet
    //const userId = event.requestContext.authorizer?.lambda?.userId;
// 👆 从 JWT token 中获取真实的用户 ID


    const userId = event.requestContext.authorizer?.lambda?.userId || 1; // always 1 for now, mock user

    // Query pet by ID and verify ownership
    const result = await query(
      'SELECT * FROM pets WHERE id = $1 AND user_id = $2',
      [petId, userId]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Pet not found' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(result.rows[0]),
    };
  } catch (error) {
    console.error('Fetch pet error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Failed to fetch pet' }),
    };
  }
};