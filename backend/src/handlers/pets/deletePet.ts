import { APIGatewayProxyHandler } from 'aws-lambda';
import { query } from '../../services/db';

interface DeletePetBody {
  userId?: number;
}

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


    let deleteData: DeletePetBody = {};
    if (event.body) {
      try {
        deleteData = JSON.parse(event.body);
      } catch (e) {
        console.log('Could not parse request body');
      }
    }

    const userId = deleteData.userId || event.requestContext.authorizer?.lambda?.userId || 1;
    console.log('Deleting pet:', petId, 'for userId:', userId);

  
    const result = await query(
      'DELETE FROM pets WHERE id = $1 AND user_id = $2 RETURNING id',
      [petId, userId]
    );

    if (result.rows.length === 0) {
      console.error('Pet not found or user not authorized - petId:', petId, 'userId:', userId);
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Pet not found or you do not have permission to delete it' }),
      };
    }

    console.log('✅ Pet deleted successfully:', result.rows[0].id);

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
      body: JSON.stringify({ 
        message: 'Failed to delete pet',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};