import { handler } from '../deleteSymptom';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { query } from '../../../services/db';

jest.mock('../../../services/db');
const mockQuery = query as jest.MockedFunction<typeof query>;

describe('deleteSymptom Handler', () => {
  const mockContext = {} as Context;

  const createMockResult = (rows: any[]) => ({
    rows,
    rowCount: rows.length,
    command: 'DELETE',
    oid: 0,
    fields: []
  } as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully delete a log belonging to the authorized user', async () => {
    mockQuery.mockResolvedValueOnce(createMockResult([{ id: 10 }]));

    const event = {
      pathParameters: { id: '10' },
      requestContext: { 
        requestId: 'test-id',
        authorizer: { lambda: { userId: 1 } } 
      },
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event, mockContext, () => {});

    expect(response?.statusCode).toBe(200);
    const body = JSON.parse(response!.body);
    expect(body.message).toBe('Symptom log deleted successfully');
    expect(body.id).toBe(10);
  });

  it('should return 404 if log ID does not exist for that user', async () => {
    mockQuery.mockResolvedValueOnce(createMockResult([]));

    const event = {
      pathParameters: { id: '999' },
      requestContext: { 
        requestId: 'test-id',
        authorizer: { lambda: { userId: 1 } } 
      },
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event, mockContext, () => {});

    expect(response?.statusCode).toBe(404);
    expect(JSON.parse(response!.body).message).toBe('Symptom log not found');
  });
});