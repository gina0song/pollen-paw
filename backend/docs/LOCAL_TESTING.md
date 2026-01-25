# Local Integration Testing Guide

## Starting the Local Server
```bash
cd backend
npm run dev
```

The API will be available at: `http://localhost:3000/dev`

## Test Results

### ✅ Test 1: Valid ZIP Code
```bash
curl "http://localhost:3000/dev/environmental/pollen?zipCode=98074"
```

**Response (200 OK)**:
```json
{
  "zipCode": "98074",
  "location": "Sammamish, WA 98074, USA",
  "coordinates": {
    "lat": 47.621,
    "lng": -122.047
  },
  "forecast": [
    {
      "date": "2026-01-25",
      "grassPollen": 0,
      "treePollen": 0,
      "weedPollen": 0,
      "pollenLevel": "LOW",
      "healthRecommendations": []
    }
  ]
}
```

### ✅ Test 2: Missing Parameter
```bash
curl "http://localhost:3000/dev/environmental/pollen"
```

**Response (400 Bad Request)**:
```json
{
  "error": "ZIP code is required",
  "message": "Please provide a zipCode query parameter"
}
```

### ✅ Test 3: Invalid ZIP Code
```bash
curl "http://localhost:3000/dev/environmental/pollen?zipCode=00000"
```

**Response (404 Not Found)**:
```json
{
  "error": "Invalid ZIP code",
  "message": "Could not find location for the provided ZIP code"
}
```

### ✅ Test 4: Other Cities
- Seattle (98101): ✓ Success
- New York (10001): ✓ Success

## Testing Notes

- All endpoints working correctly
- Error handling validated
- CORS headers present in all responses
- Response times: 30-190ms
