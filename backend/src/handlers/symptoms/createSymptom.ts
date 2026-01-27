// ============================================
// POST /symptoms - Create a new symptom log
// ============================================
import { APIGatewayProxyHandler } from 'aws-lambda';
import { query } from '../../services/db';

interface CreateSymptomBody {
  pet_id: number;
  log_date?: string; // ISO date string (YYYY-MM-DD)
  eye_symptoms?: number;
  fur_quality?: number;
  skin_irritation?: number;
  respiratory?: number;
  notes?: string;
  photo_url?: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Creating symptom log for request:', event.requestContext.requestId);

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

    const symptomData: CreateSymptomBody = JSON.parse(event.body);

    // Validate required fields
    if (!symptomData.pet_id) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'pet_id is required' }),
      };
    }

    // Validate symptom values (1-5 scale)
    const validateSymptom = (value?: number, name?: string) => {
      if (value !== undefined && (value < 1 || value > 5)) {
        throw new Error(`${name} must be between 1 and 5`);
      }
    };

    validateSymptom(symptomData.eye_symptoms, 'eye_symptoms');
    validateSymptom(symptomData.fur_quality, 'fur_quality');
    validateSymptom(symptomData.skin_irritation, 'skin_irritation');
    validateSymptom(symptomData.respiratory, 'respiratory');

    // TODO: Verify user owns this pet
    const userId = event.requestContext.authorizer?.lambda?.userId || 1;

    // Verify pet exists and belongs to user
    const petCheck = await query(
      'SELECT id FROM pets WHERE id = $1 AND user_id = $2',
      [symptomData.pet_id, userId]
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

    // Insert new symptom log
    const result = await query(
      `INSERT INTO symptom_logs 
       (pet_id, log_date, eye_symptoms, fur_quality, skin_irritation, respiratory, notes, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        symptomData.pet_id,
        symptomData.log_date || new Date().toISOString().split('T')[0], // Default to today
        symptomData.eye_symptoms || null,
        symptomData.fur_quality || null,
        symptomData.skin_irritation || null,
        symptomData.respiratory || null,
        symptomData.notes || null,
        symptomData.photo_url || null,
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
  } catch (error: any) {
    console.error('Create symptom error:', error);
    
    // Handle validation errors
    if (error.message.includes('must be between')) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: error.message }),
      };
    }

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Failed to create symptom log' }),
    };
  }
};