// ============================================
// GET /pets - Fetch all pets for an authenticated user
// ============================================
import { APIGatewayProxyHandler } from 'aws-lambda';
import { query } from '../../services/db';

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Fetching all pets for request:', event.requestContext.requestId);

  try {
    // The userId logic here is consistent with your getPet.ts
    // Once JWT is enabled, the real ID will be obtained from the authorizer
    const userId = event.requestContext.authorizer?.lambda?.userId || 1; 

    // Query all pets for this user
    const result = await query(
      'SELECT * FROM pets WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(result.rows), // return the list of pets
    };
  } catch (error) {
    console.error('Fetch pets error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Failed to fetch pets list' }),
    };
  }
};