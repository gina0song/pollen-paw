import axios from 'axios';
import { handler } from '../getPollenData';
import { APIGatewayProxyEvent } from 'aws-lambda';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('getPollenData - Edge Cases', () => {
  const createMockEvent = (zipCode: string): APIGatewayProxyEvent => ({
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
  });

  const createMockGeocodingResponse = (lat: number, lng: number, address: string) => ({
    data: {
      status: 'OK',
      results: [
        {
          geometry: { location: { lat, lng } },
          formatted_address: address,
        },
      ],
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Empty and Missing Data', () => {
    it('should handle Pollen API returning empty dailyInfo array', async () => {
      mockedAxios.get.mockResolvedValueOnce(
        createMockGeocodingResponse(47.6149, -122.0326, 'Sammamish, WA 98074, USA')
      );

      mockedAxios.get.mockResolvedValueOnce({
        data: { regionCode: 'US', dailyInfo: [] },
      });

      const event = createMockEvent('98074');
      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.forecast).toEqual([]);
    });

    it('should handle missing pollenTypeInfo', async () => {
      mockedAxios.get.mockResolvedValueOnce(
        createMockGeocodingResponse(47.6149, -122.0326, 'Sammamish, WA 98074, USA')
      );

      mockedAxios.get.mockResolvedValueOnce({
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
      const day = body.forecast[0];
      expect(day.grassPollen).toBe(0);
      expect(day.treePollen).toBe(0);
      expect(day.weedPollen).toBe(0);
    });

    it('should handle pollen type with missing indexInfo', async () => {
      mockedAxios.get.mockResolvedValueOnce(
        createMockGeocodingResponse(47.6149, -122.0326, 'Sammamish, WA 98074, USA')
      );

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          regionCode: 'US',
          dailyInfo: [
            {
              date: { year: 2026, month: 1, day: 24 },
              pollenTypeInfo: [
                {
                  code: 'GRAMINALES',  // ✅ FIXED
                  displayName: 'Grass',
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
      const day = body.forecast[0];
      expect(day.grassPollen).toBe(0);
    });

    it('should handle missing healthRecommendations', async () => {
      mockedAxios.get.mockResolvedValueOnce(
        createMockGeocodingResponse(47.6149, -122.0326, 'Sammamish, WA 98074, USA')
      );

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          regionCode: 'US',
          dailyInfo: [
            {
              date: { year: 2026, month: 1, day: 24 },
              pollenTypeInfo: [
                {
                  code: 'GRAMINALES',  // ✅ FIXED
                  displayName: 'Grass',
                  indexInfo: { value: 2 },
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
      const day = body.forecast[0];
      expect(day.healthRecommendations).toEqual([]);
    });
  });

  describe('Special ZIP Codes', () => {
    it('should handle 9-digit ZIP+4 format', async () => {
      mockedAxios.get.mockResolvedValueOnce(
        createMockGeocodingResponse(47.6149, -122.0326, 'Sammamish, WA 98074-1234, USA')
      );

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          regionCode: 'US',
          dailyInfo: [],
        },
      });

      const event = createMockEvent('98074-1234');
      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.zipCode).toBe('98074-1234');
      expect(body.location).toContain('98074-1234');
    });

    it('should handle Canadian postal codes', async () => {
      mockedAxios.get.mockResolvedValueOnce(
        createMockGeocodingResponse(43.6532, -79.3832, 'Toronto, ON M5H 2N2, Canada')
      );

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          regionCode: 'CA',
          dailyInfo: [],
        },
      });

      const event = createMockEvent('M5H2N2');
      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.zipCode).toBe('M5H2N2');
      expect(body.coordinates.lat).toBe(43.6532);
      expect(body.coordinates.lng).toBe(-79.3832);
    });
  });

  describe('Unusual Pollen Values', () => {
    it('should handle zero pollen values', async () => {
      mockedAxios.get.mockResolvedValueOnce(
        createMockGeocodingResponse(47.6149, -122.0326, 'Sammamish, WA 98074, USA')
      );

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          regionCode: 'US',
          dailyInfo: [
            {
              date: { year: 2026, month: 1, day: 24 },
              pollenTypeInfo: [
                {
                  code: 'GRAMINALES',  // ✅ FIXED
                  displayName: 'Grass',
                  indexInfo: { value: 0 },
                  healthRecommendations: [],
                },
                {
                  code: 'BIRCH',  // ✅ FIXED
                  displayName: 'Tree',
                  indexInfo: { value: 0 },
                  healthRecommendations: [],
                },
                {
                  code: 'RAGWEED',  // ✅ FIXED
                  displayName: 'Weed',
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
      mockedAxios.get.mockResolvedValueOnce(
        createMockGeocodingResponse(47.6149, -122.0326, 'Sammamish, WA 98074, USA')
      );

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          regionCode: 'US',
          dailyInfo: [
            {
              date: { year: 2026, month: 1, day: 24 },
              pollenTypeInfo: [
                {
                  code: 'GRAMINALES',  // ✅ FIXED
                  displayName: 'Grass',
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
      expect(body.forecast[0].pollenLevel).toBe('VERY_HIGH');  // ✅ Now should work!
      expect(body.forecast[0].grassPollen).toBe(5);
    });

    it('should handle duplicate health recommendations', async () => {
      mockedAxios.get.mockResolvedValueOnce(
        createMockGeocodingResponse(47.6149, -122.0326, 'Sammamish, WA 98074, USA')
      );

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          regionCode: 'US',
          dailyInfo: [
            {
              date: { year: 2026, month: 1, day: 24 },
              pollenTypeInfo: [
                {
                  code: 'GRAMINALES',  // ✅ FIXED
                  displayName: 'Grass',
                  indexInfo: { value: 3 },
                  healthRecommendations: ['Stay indoors', 'Wear mask'],
                },
                {
                  code: 'BIRCH',  // ✅ FIXED
                  displayName: 'Tree',
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

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      const recommendations = body.forecast[0].healthRecommendations;

      const stayIndoorsCount = recommendations.filter(
        (r: string) => r === 'Stay indoors'
      ).length;
      expect(stayIndoorsCount).toBe(1);  // ✅ Now should work!
      expect(recommendations).toHaveLength(3);
    });
  });

  describe('Date Edge Cases', () => {
    it('should format single-digit months and days correctly', async () => {
      mockedAxios.get.mockResolvedValueOnce(
        createMockGeocodingResponse(47.6149, -122.0326, 'Sammamish, WA 98074, USA')
      );

      mockedAxios.get.mockResolvedValueOnce({
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

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.forecast[0].date).toBe('2026-01-05');
    });

    it('should handle end of year date', async () => {
      mockedAxios.get.mockResolvedValueOnce(
        createMockGeocodingResponse(47.6149, -122.0326, 'Sammamish, WA 98074, USA')
      );

      mockedAxios.get.mockResolvedValueOnce({
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

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.forecast[0].date).toBe('2026-12-31');
    });
  });
});
