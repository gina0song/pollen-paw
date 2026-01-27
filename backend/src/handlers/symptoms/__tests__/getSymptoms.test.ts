import { handler } from '../getSymptoms';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { query } from '../../../services/db';

jest.mock('../../../services/db');
const mockQuery = query as jest.MockedFunction<typeof query>;

describe('getSymptoms Handler', () => {
  const mockContext = {} as Context;

  const createMockResult = (rows: any[]) => ({ 
    rows,
    rowCount: rows.length,
    command: 'SELECT',
    oid: 0,
    fields: []
  } as any);

  it('should return symptoms for valid pet', async () => {
    const mockSymptoms = [
      { id: 1, pet_id: 1, log_date: '2026-01-27', eye_symptoms: 4, notes: 'Test 1' },
      { id: 2, pet_id: 1, log_date: '2026-01-26', eye_symptoms: 3, notes: 'Test 2' },
    ];

    mockQuery
      .mockResolvedValueOnce(createMockResult([{ id: 1 }])) 
      .mockResolvedValueOnce(createMockResult(mockSymptoms));

    const event = {
      queryStringParameters: { petId: '1' },
      requestContext: { requestId: 'test-id', authorizer: { lambda: { userId: 1 } } },
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event, mockContext, () => {});

    expect(response?.statusCode).toBe(200);
    const body = JSON.parse(response!.body);
    expect(body).toHaveLength(2);
  });
});