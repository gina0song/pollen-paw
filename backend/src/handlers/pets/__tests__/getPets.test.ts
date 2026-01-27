// ============================================
// Integration Test: GET /pets
// ============================================
import { handler } from '../getPets';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

describe('getPets Handler Integration Test', () => {
  let pool: Pool;

  beforeAll(() => {
    // Initialize connection pool for test verification
    pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
  });

  afterAll(async () => {
    // Clean up connections
    await pool.end();
  });

  it('should return 200 and a list of pets for user_id 1', async () => {
    // Mock API Gateway event
    const event = {
      httpMethod: 'GET',
      path: '/pets',
      headers: {
        'Accept': 'application/json'
      },
      pathParameters: null,
      queryStringParameters: null,
      requestContext: {
        requestId: 'test-request-id',
        authorizer: {
          lambda: { userId: 1 }
        }
      }
    } as unknown as APIGatewayProxyEvent;

    const context = {} as Context;

    // Execute handler
    const response = await handler(event, context, () => {});

    // Validate response structure
    expect(response).toBeDefined();
    expect(response!.statusCode).toBe(200);
    expect(response!.headers).toMatchObject({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });

    const body = JSON.parse(response!.body);
    expect(Array.isArray(body)).toBe(true);
    
    // Verify seed data exists
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('id');
      expect(body[0]).toHaveProperty('name');
      expect(body[0]).toHaveProperty('species');
      
      // Check for Luna (from seed data)
      const hasLuna = body.some((pet: any) => pet.name === 'Luna');
      expect(hasLuna).toBe(true);
    } else {
      throw new Error('No pets found. Run seed script: node database/run-seed.js');
    }
  });

  it('should return CORS headers', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/pets',
      requestContext: {
        requestId: 'test-cors',
        authorizer: { lambda: { userId: 1 } }
      }
    } as any;

    const response = await handler(event, {} as any, () => {});
    
    expect(response!.headers).toMatchObject({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    });
  });
});