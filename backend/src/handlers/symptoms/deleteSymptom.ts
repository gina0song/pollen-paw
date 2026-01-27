// ============================================
// DELETE /symptoms/{id} - Delete a symptom log
// ============================================
import { APIGatewayProxyHandler } from 'aws-lambda';
import { query } from '../../services/db';

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Deleting symptom log for request:', event.requestContext.requestId);

  try {
    const symptomId = event.pathParameters?.id;
    
    if (!symptomId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Symptom ID is required' }),
      };
    }

    // TODO: Verify user owns the pet that owns this symptom
    const userId = event.requestContext.authorizer?.lambda?.userId || 1;

    // Delete symptom log (verify ownership through pet)
    const result = await query(
      `DELETE FROM symptom_logs 
       WHERE id = $1 
       AND pet_id IN (SELECT id FROM pets WHERE user_id = $2)
       RETURNING id`,
      [symptomId, userId]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Symptom log not found' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        message: 'Symptom log deleted successfully',
        id: result.rows[0].id 
      }),
    };
  } catch (error) {
    console.error('Delete symptom error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Failed to delete symptom log' }),
    };
  }
};