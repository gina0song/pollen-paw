// ============================================
// PUT /symptoms/{id} - Update an existing symptom log
// ============================================
import { APIGatewayProxyHandler } from 'aws-lambda';
import { query } from '../../services/db';

interface UpdateSymptomBody {
  eye_symptoms?: number;
  fur_quality?: number;
  skin_irritation?: number;
  respiratory?: number;
  notes?: string;
  photo_url?: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Updating symptom log for request:', event.requestContext.requestId);

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

    const updateData: UpdateSymptomBody = JSON.parse(event.body);

    // Validate symptom values (1-5 scale)
    const validateSymptom = (value?: number, name?: string) => {
      if (value !== undefined && (value < 1 || value > 5)) {
        throw new Error(`${name} must be between 1 and 5`);
      }
    };

    validateSymptom(updateData.eye_symptoms, 'eye_symptoms');
    validateSymptom(updateData.fur_quality, 'fur_quality');
    validateSymptom(updateData.skin_irritation, 'skin_irritation');
    validateSymptom(updateData.respiratory, 'respiratory');

    // TODO: Verify user owns the pet that owns this symptom
    const userId = event.requestContext.authorizer?.lambda?.userId || 1;

    // Build dynamic UPDATE query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updateData.eye_symptoms !== undefined) {
      updates.push(`eye_symptoms = $${paramCount++}`);
      values.push(updateData.eye_symptoms);
    }
    if (updateData.fur_quality !== undefined) {
      updates.push(`fur_quality = $${paramCount++}`);
      values.push(updateData.fur_quality);
    }
    if (updateData.skin_irritation !== undefined) {
      updates.push(`skin_irritation = $${paramCount++}`);
      values.push(updateData.skin_irritation);
    }
    if (updateData.respiratory !== undefined) {
      updates.push(`respiratory = $${paramCount++}`);
      values.push(updateData.respiratory);
    }
    if (updateData.notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(updateData.notes);
    }
    if (updateData.photo_url !== undefined) {
      updates.push(`photo_url = $${paramCount++}`);
      values.push(updateData.photo_url);
    }

    if (updates.length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'No fields to update' }),
      };
    }

    // Always update timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add symptomId and userId to values
    values.push(symptomId, userId);

    // Update symptom log (verify ownership through pet)
    const result = await query(
      `UPDATE symptom_logs 
       SET ${updates.join(', ')}
       WHERE id = $${paramCount++} 
       AND pet_id IN (SELECT id FROM pets WHERE user_id = $${paramCount++})
       RETURNING *`,
      values
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
      body: JSON.stringify(result.rows[0]),
    };
  } catch (error: any) {
    console.error('Update symptom error:', error);
    
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
      body: JSON.stringify({ message: 'Failed to update symptom log' }),
    };
  }
};