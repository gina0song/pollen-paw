import { APIGatewayProxyEvent } from 'aws-lambda';
import axios from 'axios';
import { handler } from '../getPollenData';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('getPollenData - Edge Cases', () => {
  const createMockEvent = (zipCode: string): APIGatewayProxyEvent => {
    return {
      queryStringParameters: { zipCode },
      body: null,
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'GET',
      isBase64Encoded: false,
      path: '/environmental/pollen',
      pathParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: '',
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Empty and Missing Data', () => {
    it('should handle Pollen API returning empty dailyInfo array', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({
          data: {
            status: 'OK',
            results: [
              {
                geometry: { location: { lat: 47.6149, lng: -122.0326 } },
                formatted_address: 'Sammamish, WA 98074, USA',
              },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            regionCode: 'US',
            dailyInfo: [],
          },
        });

      const event = createMockEvent('98074');
      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.forecast).toEqual([]);
    });

    it('should handle missing pollenTypeInfo', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({
          data: {
            status: 'OK',
            results: [
              {
                geometry: { location: { lat: 47.6149, lng: -122.0326 } },
                formatted_address: 'Sammamish, WA 98074, USA',
              },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            regionCode: 'US',
            dailyInfo: [
              {
                date: { year: 2026, month: 1, day: 24 },
                pollenTypeInfo: [],
              },
            ],
          },
        });

      const event = createMockEvent('98074');
      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.forecast[0].grassPollen).toBe(0);
      expect(body.forecast[0].treePollen).toBe(0);
      expect(body.forecast[0].weedPollen).toBe(0);
      expect(body.forecast[0].pollenLevel).toBe('LOW');
    });

    it('should handle pollen type with missing indexInfo', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({
          data: {
            status: 'OK',
            results: [
              {
                geometry: { location: { lat: 47.6149, lng: -122.0326 } },
                formatted_address: 'Sammamish, WA 98074, USA',
              },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            regionCode: 'US',
            dailyInfo: [
              {
                date: { year: 2026, month: 1, day: 24 },
                pollenTypeInfo: [
                  {
                    code: 'GRASS',
                    // Missing indexInfo
                    healthRecommendations: ['Test'],
                  },
                ],
              },
            ],
          },
        });

      const event = createMockEvent('98074');
      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.forecast[0].grassPollen).toBe(0);
    });

    it('should handle missing healthRecommendations', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({
          data: {
            status: 'OK',
            results: [
              {
                geometry: { location: { lat: 47.6149, lng: -122.0326 } },
                formatted_address: 'Sammamish, WA 98074, USA',
              },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            regionCode: 'US',
            dailyInfo: [
              {
                date: { year: 2026, month: 1, day: 24 },
                pollenTypeInfo: [
                  {
                    code: 'GRASS',
                    indexInfo: { value: 2 },
                    // Missing healthRecommendations
                  },
                ],
              },
            ],
          },
        });

      const event = createMockEvent('98074');
      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.forecast[0].healthRecommendations).toEqual([]);
    });
  });

  describe('Special ZIP Codes', () => {
    it('should handle 9-digit ZIP+4 format', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({
          data: {
            status: 'OK',
            results: [
              {
                geometry: { location: { lat: 47.6149, lng: -122.0326 } },
                formatted_address: 'Sammamish, WA 98074-1234, USA',
              },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            regionCode: 'US',
            dailyInfo: [],
          },
        });

      const event = createMockEvent('98074-1234');
      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://maps.googleapis.com/maps/api/geocode/json',
        expect.objectContaining({
          params: expect.objectContaining({
            address: '98074-1234',
          }),
        })
      );
    });

    it('should handle Canadian postal codes', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({
          data: {
            status: 'OK',
            results: [
              {
                geometry: { location: { lat: 43.6532, lng: -79.3832 } },
                formatted_address: 'Toronto, ON M5H 2N2, Canada',
              },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            regionCode: 'CA',
            dailyInfo: [],
          },
        });

      const event = createMockEvent('M5H2N2');
      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.location).toContain('Canada');
    });
  });

  describe('Unusual Pollen Values', () => {
    it('should handle zero pollen values', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({
          data: {
            status: 'OK',
            results: [
              {
                geometry: { location: { lat: 47.6149, lng: -122.0326 } },
                formatted_address: 'Sammamish, WA 98074, USA',
              },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            regionCode: 'US',
            dailyInfo: [
              {
                date: { year: 2026, month: 1, day: 24 },
                pollenTypeInfo: [
                  {
                    code: 'GRASS',
                    indexInfo: { value: 0 },
                    healthRecommendations: [],
                  },
                  {
                    code: 'TREE',
                    indexInfo: { value: 0 },
                    healthRecommendations: [],
                  },
                  {
                    code: 'WEED',
                    indexInfo: { value: 0 },
                    healthRecommendations: [],
                  },
                ],
              },
            ],
          },
        });

      const event = createMockEvent('98074');
      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.forecast[0].pollenLevel).toBe('LOW');
    });

    it('should handle very high pollen values (5)', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({
          data: {
            status: 'OK',
            results: [
              {
                geometry: { location: { lat: 47.6149, lng: -122.0326 } },
                formatted_address: 'Sammamish, WA 98074, USA',
              },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            regionCode: 'US',
            dailyInfo: [
              {
                date: { year: 2026, month: 1, day: 24 },
                pollenTypeInfo: [
                  {
                    code: 'GRASS',
                    indexInfo: { value: 5 },
                    healthRecommendations: ['Stay indoors'],
                  },
                ],
              },
            ],
          },
        });

      const event = createMockEvent('98074');
      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.forecast[0].pollenLevel).toBe('VERY_HIGH');
      expect(body.forecast[0].grassPollen).toBe(5);
    });

    it('should handle duplicate health recommendations', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({
          data: {
            status: 'OK',
            results: [
              {
                geometry: { location: { lat: 47.6149, lng: -122.0326 } },
                formatted_address: 'Sammamish, WA 98074, USA',
              },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            regionCode: 'US',
            dailyInfo: [
              {
                date: { year: 2026, month: 1, day: 24 },
                pollenTypeInfo: [
                  {
                    code: 'GRASS',
                    indexInfo: { value: 3 },
                    healthRecommendations: ['Stay indoors', 'Wear mask'],
                  },
                  {
                    code: 'TREE',
                    indexInfo: { value: 3 },
                    healthRecommendations: ['Stay indoors', 'Take medication'],
                  },
                ],
              },
            ],
          },
        });

      const event = createMockEvent('98074');
      const result = await handler(event);

      const body = JSON.parse(result.body);
      const recommendations = body.forecast[0].healthRecommendations;
      
      // Should only have 'Stay indoors' once
      const stayIndoorsCount = recommendations.filter(
        (r: string) => r === 'Stay indoors'
      ).length;
      expect(stayIndoorsCount).toBe(1);
      expect(recommendations).toHaveLength(3); // Stay indoors, Wear mask, Take medication
    });
  });

  describe('Date Edge Cases', () => {
    it('should format single-digit months and days correctly', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({
          data: {
            status: 'OK',
            results: [
              {
                geometry: { location: { lat: 47.6149, lng: -122.0326 } },
                formatted_address: 'Sammamish, WA 98074, USA',
              },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            regionCode: 'US',
            dailyInfo: [
              {
                date: { year: 2026, month: 1, day: 5 },
                pollenTypeInfo: [],
              },
            ],
          },
        });

      const event = createMockEvent('98074');
      const result = await handler(event);

      const body = JSON.parse(result.body);
      expect(body.forecast[0].date).toBe('2026-01-05');
    });

    it('should handle end of year date', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({
          data: {
            status: 'OK',
            results: [
              {
                geometry: { location: { lat: 47.6149, lng: -122.0326 } },
                formatted_address: 'Sammamish, WA 98074, USA',
              },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            regionCode: 'US',
            dailyInfo: [
              {
                date: { year: 2026, month: 12, day: 31 },
                pollenTypeInfo: [],
              },
            ],
          },
        });

      const event = createMockEvent('98074');
      const result = await handler(event);

      const body = JSON.parse(result.body);
      expect(body.forecast[0].date).toBe('2026-12-31');
    });
  });
});