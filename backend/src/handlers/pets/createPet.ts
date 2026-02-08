import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { query } from '../../services/db';

interface CreatePetBody {
  name: string;
  species: 'dog' | 'cat'; 
  breed?: string;
  age?: number;
  userId?: number; 
}

export const handler: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'Request body is required' }),
      };
    }

    const petData: CreatePetBody = JSON.parse(event.body);

    if (!petData.name || !petData.species) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'Name and species are required fields' }),
      };
    }

    const userId = petData.userId || event.requestContext.authorizer?.lambda?.userId || 1;

    const result = await query(
      `INSERT INTO pets (user_id, name, species, breed, age)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, species, breed, age, user_id as "userId"`,
      [
        userId,
        petData.name,
        petData.species,  
        petData.breed || null,
        petData.age || null,
      ]
    );

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true'
      },
      body: JSON.stringify(result.rows[0]),
    };
  } catch (error) {
    console.error('Create pet error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Failed to create pet', error: error instanceof Error ? error.message : 'Unknown error' }),
    };
  }
};