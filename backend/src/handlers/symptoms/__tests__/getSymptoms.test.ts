import { handler } from '../getSymptoms';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { query } from '../../../services/db';

// Mock the database query function
jest.mock('../../../services/db');
const mockQuery = query as jest.MockedFunction<typeof query>;

describe('getSymptoms Handler', () => {
  const mockContext = {} as Context;

  // Helper function to create a mock result matching pg library format
  const createMockResult = (rows: any[]) => ({ 
    rows,
    rowCount: rows.length,
    command: 'SELECT',
    oid: 0,
    fields: []
  } as any);

  it('should return enriched symptoms with pollen data', async () => {
    // Mock the data structure returned after SQL JOIN
    const mockDbRows = [
      { 
        id: 1, 
        petId: 1, 
        logDate: '2026-01-27', 
        eyeSymptoms: 4, 
        treePollen: 8.5, // Mock data from environmental_data table
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
    
    // Verify the length of the returned data
    expect(body).toHaveLength(1);
    // Verify that pollen_data is correctly restructured
    expect(body[0].pollen_data).toEqual({
      treePollen: 8.5,
      grassPollen: 3.0,
      weedPollen: 1.5,
      airQuality: 70,
      source: "RDS_DATABASE"
    });
  });
});