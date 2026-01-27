// ============================================
// GET /pets - Fetch all pets for the authenticated user
// ============================================
import { APIGatewayProxyHandler } from 'aws-lambda';
import { query } from '../../services/db';

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Fetching pets for request:', event.requestContext.requestId);

  try {
    // ？？？？TODO: Replace with real JWT auth - for now using placeholder
    // In production, extract userId from JWT token in Authorization header
    const userId = event.requestContext.authorizer?.lambda?.userId || 1;

    // Query all pets for this user, ordered by most recently created
    const result = await query(
      'SELECT * FROM pets WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Enable CORS
      },
      body: JSON.stringify(result.rows),
    };
  } catch (error) {
    console.error('Fetch pets error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Failed to fetch pets' }),
    };
  }
};