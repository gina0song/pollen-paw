import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../getPollenData';

describe('getPollenData - Basic Input Validation', () => {
  const createMockEvent = (
    queryStringParameters: Record<string, string> | null
  ): APIGatewayProxyEvent => {
    return {
      queryStringParameters,
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

  describe('Input Validation', () => {
    it('should return 400 if zipCode is missing', async () => {
      const event = createMockEvent(null);
      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      expect(result.headers?.['Content-Type']).toBe('application/json');
      expect(result.headers?.['Access-Control-Allow-Origin']).toBe('*');

      const body = JSON.parse(result.body);
      expect(body.error).toBe('ZIP code is required');
      expect(body.message).toContain('zipCode');
    });

    it('should return 400 if zipCode parameter is empty object', async () => {
      const event = createMockEvent({});
      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error).toBe('ZIP code is required');
    });

    it('should include CORS headers in error responses', async () => {
      const event = createMockEvent(null);
      const result = await handler(event);

      expect(result.headers?.['Access-Control-Allow-Origin']).toBe('*');
      expect(result.headers?.['Content-Type']).toBe('application/json');
    });
  });

  describe('Response Structure', () => {
    it('should return JSON content type header', async () => {
      const event = createMockEvent({ zipCode: '98074' });
      const result = await handler(event);

      expect(result.headers?.['Content-Type']).toBe('application/json');
    });

    it('should return valid JSON in response body', async () => {
      const event = createMockEvent(null);
      const result = await handler(event);

      expect(() => JSON.parse(result.body)).not.toThrow();
    });
  });
});