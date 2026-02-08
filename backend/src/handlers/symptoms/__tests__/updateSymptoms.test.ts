import { handler } from '../updateSymptom';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { query } from '../../../services/db';

jest.mock('../../../services/db');
const mockQuery = query as jest.MockedFunction<typeof query>;

describe('updateSymptom Handler', () => {
  const mockContext = {} as Context;

  const createMockResult = (rows: any[]) => ({
    rows,
    rowCount: rows.length,
    command: 'UPDATE',
    oid: 0,
    fields: []
  } as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully update valid symptom fields', async () => {
    // ✅ FIX: Mock returns the full symptom log row, not just success message
    mockQuery.mockResolvedValueOnce(createMockResult([
      {
        id: 1,
        pet_id: 1,
        eye_symptoms: 3,
        fur_quality: 2,
        skin_irritation: 1,
        respiratory: 2,
        date_logged: '2026-01-24',
        updated_at: '2026-01-24T10:00:00Z',
      },
    ]));

    const event = {
      pathParameters: { id: '1' },
      requestContext: { 
        authorizer: { 
          lambda: { userId: 1 } 
        } 
      },
      body: JSON.stringify({ eye_symptoms: 3, fur_quality: 2 }),
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event, mockContext, () => {});

    expect(response?.statusCode).toBe(200);
    const body = JSON.parse(response!.body);
    // ✅ FIX: Source code returns the entire row, not a success message
    expect(body.id).toBe(1);
    expect(body.eye_symptoms).toBe(3);
  });

  it('should return 400 if symptom values are out of range (1-5)', async () => {
    const event = {
      pathParameters: { id: '1' },
      requestContext: { 
        authorizer: { 
          lambda: { userId: 1 } 
        } 
      },
      body: JSON.stringify({ respiratory: 6 }), // Out of range
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event, mockContext, () => {});

    expect(response?.statusCode).toBe(400);
    const body = JSON.parse(response!.body);
    expect(body.message).toContain('must be between');
  });

  it('should return 404 if log not found or user lacks permission', async () => {
    mockQuery.mockResolvedValueOnce(createMockResult([]));

    const event = {
      pathParameters: { id: '999' },
      requestContext: { 
        authorizer: { 
          lambda: { userId: 1 } 
        } 
      },
      body: JSON.stringify({ eye_symptoms: 2 }),
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event, mockContext, () => {});

    expect(response?.statusCode).toBe(404);
    expect(JSON.parse(response!.body).message).toBe('Symptom log not found or unauthorized');
  });

  it('should return 400 if request body contains no fields to update', async () => {
    const event = {
      pathParameters: { id: '1' },
      requestContext: { 
        authorizer: { 
          lambda: { userId: 1 } 
        } 
      },
      body: JSON.stringify({}), 
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event, mockContext, () => {});

    expect(response?.statusCode).toBe(400);
    const body = JSON.parse(response!.body);
    expect(body.message).toBe('No fields to update');
  });
});
