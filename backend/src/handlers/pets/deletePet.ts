// ============================================
// DELETE /pets/{id} - Delete a pet profile
// ============================================
import { APIGatewayProxyHandler } from 'aws-lambda';
import { query } from '../../services/db';

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Deleting pet for request:', event.requestContext.requestId);

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

    // TODO: Replace with real JWT auth
    const userId = event.requestContext.authorizer?.lambda?.userId || 1;

    // Delete pet and verify ownership
    // Note: CASCADE delete will automatically remove associated symptoms
    const result = await query(
      'DELETE FROM pets WHERE id = $1 AND user_id = $2 RETURNING id',
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
      body: JSON.stringify({ 
        message: 'Pet deleted successfully',
        id: result.rows[0].id 
      }),
    };
  } catch (error) {
    console.error('Delete pet error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Failed to delete pet' }),
    };
  }
};