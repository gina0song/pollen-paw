// ============================================
// PUT /pets/{id} - Update an existing pet profile
// ============================================
import { APIGatewayProxyHandler } from 'aws-lambda';
import { query } from '../../services/db';

interface UpdatePetBody {
 name?: string;
 species?: 'dog' | 'cat';
 breed?: string;
 age?: number;
 weight?: number;
 photo_url?: string;
 medical_notes?: string;
 userId?: number;
}

export const handler: APIGatewayProxyHandler = async (event) => {
 console.log('Updating pet for request:', event.requestContext.requestId);

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

   const updateData: UpdatePetBody = JSON.parse(event.body);

   // Validate species if provided
   if (updateData.species && updateData.species !== 'dog' && updateData.species !== 'cat') {
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

   // Get userId from request body (sent by frontend)
   const userId = updateData.userId || event.requestContext.authorizer?.lambda?.userId || 1;
   console.log('Updating pet:', petId, 'for userId:', userId);

   // Build dynamic UPDATE query
   const updates: string[] = [];
   const values: any[] = [];
   let paramCount = 1;

   if (updateData.name !== undefined) {
     updates.push(`name = $${paramCount++}`);
     values.push(updateData.name);
   }
   if (updateData.species !== undefined) {
     updates.push(`species = $${paramCount++}`);
     values.push(updateData.species);
   }
   if (updateData.breed !== undefined) {
     updates.push(`breed = $${paramCount++}`);
     values.push(updateData.breed);
   }
   if (updateData.age !== undefined) {
     updates.push(`age = $${paramCount++}`);
     values.push(updateData.age);
   }
   if (updateData.weight !== undefined) {
     updates.push(`weight = $${paramCount++}`);
     values.push(updateData.weight);
   }
   if (updateData.photo_url !== undefined) {
     updates.push(`photo_url = $${paramCount++}`);
     values.push(updateData.photo_url);
   }
   if (updateData.medical_notes !== undefined) {
     updates.push(`medical_notes = $${paramCount++}`);
     values.push(updateData.medical_notes);
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

   // Add updated_at
   updates.push(`updated_at = CURRENT_TIMESTAMP`);

   values.push(petId, userId);

   const whereClause = `WHERE id = $${paramCount} AND user_id = $${paramCount + 1}`;
   const sqlQuery = `UPDATE pets SET ${updates.join(', ')} ${whereClause} RETURNING id, name, species, breed, age, user_id as "userId", updated_at, created_at`;

   console.log('SQL:', sqlQuery);
   console.log('Values:', values);

   const result = await query(sqlQuery, values);

   if (result.rows.length === 0) {
     console.error('Pet not found or user not authorized - petId:', petId, 'userId:', userId);
     return {
       statusCode: 404,
       headers: {
         'Content-Type': 'application/json',
         'Access-Control-Allow-Origin': '*',
       },
       body: JSON.stringify({ message: 'Pet not found or you do not have permission to update it' }),
     };
   }

   console.log('✅ Pet updated successfully:', result.rows[0]);

   return {
     statusCode: 200,
     headers: {
       'Content-Type': 'application/json',
       'Access-Control-Allow-Origin': '*',
     },
     body: JSON.stringify(result.rows[0]),
   };
 } catch (error) {
   console.error('Update pet error:', error);
   return {
     statusCode: 500,
     headers: {
       'Content-Type': 'application/json',
       'Access-Control-Allow-Origin': '*',
     },
     body: JSON.stringify({ message: 'Failed to update pet', error: error instanceof Error ? error.message : 'Unknown error' }),
   };
 }
};