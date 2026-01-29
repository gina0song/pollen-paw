import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'; 
import { query } from '../../services/db';

export const handler: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => { 
  try {
    const userId = event.queryStringParameters?.userId || 
                   event.requestContext.authorizer?.lambda?.userId || 
                   1;

    console.log(`Fetching pets for userId: ${userId}`);

    const result = await query(
      'SELECT id, name, species, breed, age, user_id as "userId" FROM pets WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true'
      },
      body: JSON.stringify(result.rows), 
    };
  } catch (error) {
    console.error('Get pets error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Failed to fetch pets' }),
    };
  }
};