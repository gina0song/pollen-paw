// ============================================
// POST /pets - Create a new pet profile
// ============================================
import { APIGatewayProxyHandler } from 'aws-lambda';
import { query } from '../../services/db';

interface CreatePetBody {
  name: string;
  species: 'dog' | 'cat';
  breed?: string;
  age?: number;
  weight?: number;
  photo_url?: string;
  medical_notes?: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Creating new pet for request:', event.requestContext.requestId);

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Request body is required' }),
      };
    }

    const petData: CreatePetBody = JSON.parse(event.body);

    // Validate required fields
    if (!petData.name || !petData.species) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          message: 'Name and species are required fields' 
        }),
      };
    }

    // Validate species
    if (petData.species !== 'dog' && petData.species !== 'cat') {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          message: 'Species must be either "dog" or "cat"' 
        }),
      };
    }

    // TODO: Replace with real JWT auth
    const userId = event.requestContext.authorizer?.lambda?.userId || 1;

    // Insert new pet
    const result = await query(
      `INSERT INTO pets (user_id, name, species, breed, age, weight, photo_url, medical_notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        petData.name,
        petData.species,
        petData.breed || null,
        petData.age || null,
        petData.weight || null,
        petData.photo_url || null,
        petData.medical_notes || null,
      ]
    );

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(result.rows[0]),
    };
  } catch (error) {
    console.error('Create pet error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Failed to create pet' }),
    };
  }
};