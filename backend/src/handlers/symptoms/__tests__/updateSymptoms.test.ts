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
    const mockUpdatedSymptom = {
      id: 10,
      eye_symptoms: 5,
      notes: 'Updated notes',
      updated_at: new Date()
    };

    mockQuery.mockResolvedValueOnce(createMockResult([mockUpdatedSymptom]));

    const event = {
      pathParameters: { id: '10' },
      body: JSON.stringify({
        eye_symptoms: 5,
        notes: 'Updated notes'
      }),
      requestContext: { 
        requestId: 'test-id',
        authorizer: { lambda: { userId: 1 } } 
      },
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event, mockContext, () => {});

    expect(response?.statusCode).toBe(200);
    const body = JSON.parse(response!.body);
    expect(body.eye_symptoms).toBe(5);
    expect(body.notes).toBe('Updated notes');
    
    // 修改重点：使用正则匹配，忽略 SQL 中的多余空格和换行
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringMatching(/UPDATE symptom_logs\s+SET eye_symptoms = \$1, notes = \$2, updated_at = CURRENT_TIMESTAMP/i),
      [5, 'Updated notes', '10', 1]
    );
  });

  it('should return 400 if symptom values are out of range (1-5)', async () => {
    const event = {
      pathParameters: { id: '10' },
      body: JSON.stringify({ respiratory: 6 }),
      requestContext: { requestId: 'test-id' },
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event, mockContext, () => {});

    expect(response?.statusCode).toBe(400);
    expect(JSON.parse(response!.body).message).toContain('must be between 1 and 5');
  });

  it('should return 404 if log not found or user lacks permission', async () => {
    mockQuery.mockResolvedValueOnce(createMockResult([]));

    const event = {
      pathParameters: { id: '999' },
      body: JSON.stringify({ notes: 'Unauthorized update' }),
      requestContext: { 
        requestId: 'test-id',
        authorizer: { lambda: { userId: 1 } } 
      },
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event, mockContext, () => {});

    expect(response?.statusCode).toBe(404);
    expect(JSON.parse(response!.body).message).toBe('Symptom log not found');
  });

  it('should return 400 if request body contains no fields to update', async () => {
    const event = {
      pathParameters: { id: '10' },
      body: JSON.stringify({}),
      requestContext: { requestId: 'test-id' },
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event, mockContext, () => {});

    expect(response?.statusCode).toBe(400);
    expect(JSON.parse(response!.body).message).toBe('No fields to update');
  });
});