import { handler } from '../createSymptom';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { query } from '../../../services/db';

jest.mock('../../../services/db');
const mockQuery = query as jest.MockedFunction<typeof query>;

describe('createSymptom Handler', () => {
  const createMockResult = (rows: any[]) => ({
    rows,
    rowCount: rows.length,
    command: 'SELECT',
    oid: 0,
    fields: []
  });

  it('should create symptom with valid data', async () => {
    mockQuery
      .mockResolvedValueOnce(createMockResult([{ id: 1 }])) // Pet check
      .mockResolvedValueOnce(createMockResult([{
        id: 11,
        pet_id: 1,
        notes: 'Test note',
        created_at: new Date()
      }]));

    const event = {
      body: JSON.stringify({
        pet_id: 1,
        eye_symptoms: 4,
        notes: 'Test note',
      }),
      requestContext: { requestId: 'test-id' },
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event, {} as Context, () => {});
    expect(response?.statusCode).toBe(201);
  });
});