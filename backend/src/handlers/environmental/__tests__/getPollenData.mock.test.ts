import { APIGatewayProxyEvent } from 'aws-lambda';
import axios from 'axios';
import { handler } from '../getPollenData';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('getPollenData - Mock API Tests', () => {
  // Set up environment variable for tests
  const originalEnv = process.env;

  beforeAll(() => {
    process.env = {
      ...originalEnv,
      GOOGLE_MAPS_API_KEY: 'test-api-key-12345',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });
  // Helper to create mock events
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

  // Mock data
  const mockGeocodingResponse = {
    data: {
      status: 'OK',
      results: [
        {
          geometry: {
            location: { lat: 47.6149, lng: -122.0326 },
          },
          formatted_address: 'Sammamish, WA 98074, USA',
        },
      ],
    },
  };

  const mockPollenResponse = {
    data: {
      regionCode: 'US',
      dailyInfo: [
        {
          date: { year: 2026, month: 1, day: 24 },
          pollenTypeInfo: [
            {
              code: 'GRASS',
              indexInfo: { value: 3 },
              healthRecommendations: ['Wear sunglasses outdoors'],
            },
            {
              code: 'TREE',
              indexInfo: { value: 2 },
              healthRecommendations: ['Close windows at night'],
            },
            {
              code: 'WEED',
              indexInfo: { value: 1 },
              healthRecommendations: [],
            },
          ],
        },
        {
          date: { year: 2026, month: 1, day: 25 },
          pollenTypeInfo: [
            {
              code: 'GRASS',
              indexInfo: { value: 4 },
              healthRecommendations: ['Stay indoors if possible'],
            },
            {
              code: 'TREE',
              indexInfo: { value: 3 },
              healthRecommendations: ['Take allergy medication'],
            },
            {
              code: 'WEED',
              indexInfo: { value: 2 },
              healthRecommendations: [],
            },
          ],
        },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful API Calls', () => {
    it('should call Geocoding API with correct parameters', async () => {
      mockedAxios.get
        .mockResolvedValueOnce(mockGeocodingResponse)
        .mockResolvedValueOnce(mockPollenResponse);

      const event = createMockEvent('98074');
      await handler(event);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://maps.googleapis.com/maps/api/geocode/json',
        expect.objectContaining({
          params: expect.objectContaining({
            address: '98074',
            key: 'test-api-key-12345',
          }),
        })
      );
    });

    it('should call Pollen API with coordinates from Geocoding', async () => {
      mockedAxios.get
        .mockResolvedValueOnce(mockGeocodingResponse)
        .mockResolvedValueOnce(mockPollenResponse);

      const event = createMockEvent('98074');
      await handler(event);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('pollen.googleapis.com/v1/forecast:lookup')
      );
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('location.latitude=47.6149')
      );
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('location.longitude=-122.0326')
      );
    });

    it('should return 200 with properly formatted data', async () => {
      mockedAxios.get
        .mockResolvedValueOnce(mockGeocodingResponse)
        .mockResolvedValueOnce(mockPollenResponse);

      const event = createMockEvent('98074');
      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      
      const body = JSON.parse(result.body);
      expect(body.zipCode).toBe('98074');
      expect(body.location).toBe('Sammamish, WA 98074, USA');
      expect(body.coordinates).toEqual({ lat: 47.6149, lng: -122.0326 });
      expect(body.forecast).toHaveLength(2);
    });

    it('should transform pollen data correctly using utilities', async () => {
      mockedAxios.get
        .mockResolvedValueOnce(mockGeocodingResponse)
        .mockResolvedValueOnce(mockPollenResponse);

      const event = createMockEvent('98074');
      const result = await handler(event);

      const body = JSON.parse(result.body);
      const firstDay = body.forecast[0];

      // Check data transformation
      expect(firstDay.date).toBe('2026-01-24');
      expect(firstDay.grassPollen).toBe(3);
      expect(firstDay.treePollen).toBe(2);
      expect(firstDay.weedPollen).toBe(1);
      expect(firstDay.pollenLevel).toBe('HIGH'); // max is 3
      expect(firstDay.healthRecommendations).toContain('Wear sunglasses outdoors');
    });

    it('should calculate pollen level as VERY_HIGH when values are 4+', async () => {
      mockedAxios.get
        .mockResolvedValueOnce(mockGeocodingResponse)
        .mockResolvedValueOnce(mockPollenResponse);

      const event = createMockEvent('98074');
      const result = await handler(event);

      const body = JSON.parse(result.body);
      const secondDay = body.forecast[1];

      expect(secondDay.pollenLevel).toBe('VERY_HIGH'); // max is 4
      expect(secondDay.grassPollen).toBe(4);
    });

    it('should combine health recommendations from all pollen types', async () => {
      mockedAxios.get
        .mockResolvedValueOnce(mockGeocodingResponse)
        .mockResolvedValueOnce(mockPollenResponse);

      const event = createMockEvent('98074');
      const result = await handler(event);

      const body = JSON.parse(result.body);
      const secondDay = body.forecast[1];

      expect(secondDay.healthRecommendations).toContain('Stay indoors if possible');
      expect(secondDay.healthRecommendations).toContain('Take allergy medication');
    });
  });

  describe('Error Handling - Geocoding API', () => {
    it('should return 404 when ZIP code not found', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          status: 'ZERO_RESULTS',
          results: [],
        },
      });

      const event = createMockEvent('00000');
      const result = await handler(event);

      expect(result.statusCode).toBe(404);
      const body = JSON.parse(result.body);
      expect(body.error).toBe('Invalid ZIP code');
    });

    it('should return 404 when Geocoding API returns non-OK status', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          status: 'INVALID_REQUEST',
          results: [],
        },
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
      const body = JSON.parse(result.body);
      expect(body.error).toBe('Internal server error');
    });

    it('should handle Pollen API failure after successful Geocoding', async () => {
      mockedAxios.get
        .mockResolvedValueOnce(mockGeocodingResponse)
        .mockRejectedValueOnce(new Error('Pollen API error'));

      const event = createMockEvent('98074');
      const result = await handler(event);

      expect(result.statusCode).toBe(500);
    });

    it('should handle API error responses with status codes', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          status: 403,
          data: {
            error: {
              message: 'API key invalid',
            },
          },
        },
      });

      const event = createMockEvent('98074');
      const result = await handler(event);

      expect(result.statusCode).toBe(403);
      const body = JSON.parse(result.body);
      expect(body.error).toBe('External API error');
    });
  });
});