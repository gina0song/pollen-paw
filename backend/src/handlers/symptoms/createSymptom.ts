// ============================================
// POST /symptoms - Create a new symptom log
// ============================================
import { APIGatewayProxyHandler } from 'aws-lambda';
import { query } from '../../services/db';

interface CreateSymptomBody {
  pet_id: number;
  log_date?: string;
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


    const petOwnerInfo = await query(
      `SELECT u.zip_code 
       FROM users u 
       JOIN pets p ON p.user_id = u.id 
       WHERE p.id = $1`,
      [symptomData.pet_id]
    );

    if (petOwnerInfo.rows.length === 0) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Pet not found' }),
      };
    }

    const zipCode = petOwnerInfo.rows[0].zip_code;

    const result = await query(
      `INSERT INTO symptom_logs 
       (pet_id, zip_code, log_date, eye_symptoms, fur_quality, skin_irritation, respiratory, notes, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        symptomData.pet_id,
        zipCode,
        symptomData.log_date || new Date().toISOString().split('T')[0],
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