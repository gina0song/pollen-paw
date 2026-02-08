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

  it('should return enriched symptoms with pollen data', async () => {
    const mockDbRows = [
      { 
        id: 1, 
        petId: 1, 
        logDate: '2026-01-27', 
        eyeSymptoms: 4, 
        treePollen: 8.5, 
        grassPollen: 3.0,
        weedPollen: 1.5,
        airQuality: 70
      }
    ];

   
    mockQuery.mockResolvedValueOnce(createMockResult(mockDbRows));

    const event = {
      queryStringParameters: { petId: '1' },
      requestContext: { 
        authorizer: { lambda: { userId: 1 } } 
      },
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event, mockContext, () => {});

    expect(response?.statusCode).toBe(200);
    const body = JSON.parse(response!.body);
    
    expect(body).toHaveLength(1);
    expect(body[0].pollen_data).toEqual({
      treePollen: 8.5,
      grassPollen: 3.0,
      weedPollen: 1.5,
      airQuality: 70,
      source: "RDS_DATABASE"
    });
  });
});