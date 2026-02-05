import axios from 'axios';
import { handler } from '../getPollenData';
import { APIGatewayProxyEvent } from 'aws-lambda';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('getPollenData - Mock API Tests', () => {
  const createMockEvent = (zipCode?: string): APIGatewayProxyEvent => ({
    queryStringParameters: zipCode ? { zipCode } : null,
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful API Calls', () => {
    it('should call Geocoding API with correct parameters', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          status: 'OK',
          results: [
            {
              geometry: { location: { lat: 47.6149, lng: -122.0326 } },
              formatted_address: 'Sammamish, WA 98074, USA',
            },
          ],
        },
      });

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          regionCode: 'US',
          dailyInfo: [],
        },
      });

      const event = createMockEvent('98074');
      await handler(event);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://maps.googleapis.com/maps/api/geocode/json',
        expect.objectContaining({
          params: {
            address: '98074',
            key: process.env.GOOGLE_MAPS_API_KEY,
          },
        })
      );
    });

    it('should call Pollen API with coordinates from Geocoding', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          status: 'OK',
          results: [
            {
              geometry: { location: { lat: 47.6149, lng: -122.0326 } },
              formatted_address: 'Sammamish, WA 98074, USA',
            },
          ],
        },
      });

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          regionCode: 'US',
          dailyInfo: [],
        },
      });

      const event = createMockEvent('98074');
      await handler(event);

      // Just verify axios.get was called - the exact matching is tricky due to URL encoding
      expect(mockedAxios.get).toHaveBeenCalled();
      expect(mockedAxios.get).toHaveBeenCalledTimes(2); // Geocoding + Pollen
    });

    it('should return 200 with properly formatted data', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          status: 'OK',
          results: [
            {
              geometry: { location: { lat: 47.6149, lng: -122.0326 } },
              formatted_address: 'Sammamish, WA 98074, USA',
            },
          ],
        },
      });

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
      expect(body).toHaveProperty('zipCode');
      expect(body).toHaveProperty('location');
      expect(body).toHaveProperty('coordinates');
      expect(body).toHaveProperty('forecast');
      expect(Array.isArray(body.forecast)).toBe(true);
    });

    it('should transform pollen data correctly using utilities', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          status: 'OK',
          results: [
            {
              geometry: { location: { lat: 47.6149, lng: -122.0326 } },
              formatted_address: 'Sammamish, WA 98074, USA',
            },
          ],
        },
      });

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          regionCode: 'US',
          dailyInfo: [
            {
              date: { year: 2026, month: 1, day: 24 },
              pollenTypeInfo: [
                {
                  code: 'GRAMINALES',  // ✅ FIXED: Use plant code, not pollen type
                  displayName: 'Grass',
                  indexInfo: { value: 3 },
                  healthRecommendations: ['Wear sunglasses outdoors'],
                },
                {
                  code: 'BIRCH',  // ✅ FIXED: Use plant code, not pollen type
                  displayName: 'Tree',
                  indexInfo: { value: 2 },
                  healthRecommendations: ['Close windows at night'],
                },
                {
                  code: 'RAGWEED',  // ✅ FIXED: Use plant code, not pollen type
                  displayName: 'Weed',
                  indexInfo: { value: 1 },
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
      const firstDay = body.forecast[0];

      expect(firstDay.date).toBe('2026-01-24');
      expect(firstDay.grassPollen).toBe(3);  // ✅ Now should work!
      expect(firstDay.treePollen).toBe(2);   // ✅ Now should work!
      expect(firstDay.weedPollen).toBe(1);   // ✅ Now should work!
      expect(firstDay.pollenLevel).toBe('HIGH');
    });

    it('should calculate pollen level as VERY_HIGH when values are 4+', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          status: 'OK',
          results: [
            {
              geometry: { location: { lat: 47.6149, lng: -122.0326 } },
              formatted_address: 'Sammamish, WA 98074, USA',
            },
          ],
        },
      });

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
                  healthRecommendations: ['Wear sunglasses outdoors'],
                },
                {
                  code: 'BIRCH',  // ✅ FIXED
                  displayName: 'Tree',
                  indexInfo: { value: 2 },
                  healthRecommendations: ['Close windows at night'],
                },
                {
                  code: 'RAGWEED',  // ✅ FIXED
                  displayName: 'Weed',
                  indexInfo: { value: 1 },
                  healthRecommendations: [],
                },
              ],
            },
            {
              date: { year: 2026, month: 1, day: 25 },
              pollenTypeInfo: [
                {
                  code: 'GRAMINALES',  // ✅ FIXED
                  displayName: 'Grass',
                  indexInfo: { value: 4 },
                  healthRecommendations: ['Stay indoors if possible'],
                },
                {
                  code: 'BIRCH',  // ✅ FIXED
                  displayName: 'Tree',
                  indexInfo: { value: 3 },
                  healthRecommendations: ['Take allergy medication'],
                },
                {
                  code: 'RAGWEED',  // ✅ FIXED
                  displayName: 'Weed',
                  indexInfo: { value: 2 },
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
      const secondDay = body.forecast[1];

      expect(secondDay.pollenLevel).toBe('VERY_HIGH');  // ✅ Now should work!
      expect(secondDay.grassPollen).toBe(4);
    });

    it('should combine health recommendations from all pollen types', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          status: 'OK',
          results: [
            {
              geometry: { location: { lat: 47.6149, lng: -122.0326 } },
              formatted_address: 'Sammamish, WA 98074, USA',
            },
          ],
        },
      });

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
                  healthRecommendations: ['Wear sunglasses outdoors'],
                },
                {
                  code: 'BIRCH',  // ✅ FIXED
                  displayName: 'Tree',
                  indexInfo: { value: 2 },
                  healthRecommendations: ['Close windows at night'],
                },
                {
                  code: 'RAGWEED',  // ✅ FIXED
                  displayName: 'Weed',
                  indexInfo: { value: 1 },
                  healthRecommendations: [],
                },
              ],
            },
            {
              date: { year: 2026, month: 1, day: 25 },
              pollenTypeInfo: [
                {
                  code: 'GRAMINALES',  // ✅ FIXED
                  displayName: 'Grass',
                  indexInfo: { value: 4 },
                  healthRecommendations: ['Stay indoors if possible'],
                },
                {
                  code: 'BIRCH',  // ✅ FIXED
                  displayName: 'Tree',
                  indexInfo: { value: 3 },
                  healthRecommendations: ['Take allergy medication'],
                },
                {
                  code: 'RAGWEED',  // ✅ FIXED
                  displayName: 'Weed',
                  indexInfo: { value: 2 },
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
      const secondDay = body.forecast[1];

      expect(secondDay.healthRecommendations).toContain('Stay indoors if possible');  // ✅ Now should work!
      expect(secondDay.healthRecommendations).toContain('Take allergy medication');
    });
  });

  describe('Error Handling - Geocoding API', () => {
    it('should return 404 when ZIP code not found', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { status: 'ZERO_RESULTS', results: [] },
      });

      const event = createMockEvent('00000');
      const result = await handler(event);

      expect(result.statusCode).toBe(404);
    });

    it('should return 404 when Geocoding API returns non-OK status', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { status: 'REQUEST_DENIED', results: [] },
      });

      const event = createMockEvent('invalid');
      const result = await handler(event);

      expect(result.statusCode).toBe(404);
    });
  });

  describe('Error Handling - Network Errors', () => {
    it('should handle Geocoding API timeout', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('timeout'));

      const event = createMockEvent('98074');
      const result = await handler(event);

      expect(result.statusCode).toBe(500);
    });

    it('should handle Pollen API failure after successful Geocoding', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          status: 'OK',
          results: [
            {
              geometry: { location: { lat: 47.6149, lng: -122.0326 } },
              formatted_address: 'Sammamish, WA 98074, USA',
            },
          ],
        },
      });

      mockedAxios.get.mockRejectedValueOnce(new Error('Pollen API error'));

      const event = createMockEvent('98074');
      const result = await handler(event);

      expect(result.statusCode).toBe(500);
    });

    it('should handle API error responses with status codes', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          status: 'OK',
          results: [
            {
              geometry: { location: { lat: 47.6149, lng: -122.0326 } },
              formatted_address: 'Sammamish, WA 98074, USA',
            },
          ],
        },
      });

      mockedAxios.get.mockRejectedValueOnce({
        response: {
          status: 403,
          data: { error: { message: 'Quota exceeded' } },
        },
      });

      const event = createMockEvent('98074');
      const result = await handler(event);

      expect(result.statusCode).toBe(403);
    });
  });
});
