# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### Listings

#### GET /listings
Retrieve all properties with optional filtering.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| area | string | - | Filter by zone (KAHAWA_WENDANI, KM, KAHAWA_SUKARI, MWIHOKO, GITHURAI_44, GITHURAI_45, RUIRU) |
| priceMin | number | 0 | Minimum price in KES |
| priceMax | number | 50000 | Maximum price in KES |
| hasWifi | boolean | false | Filter by WiFi availability |
| securityMin | number | 1 | Minimum security score (1-5) |
| noiseMax | number | 5 | Maximum noise level (1-5) |
| waterType | string | - | Filter by water type (BOREHOLE, RATIONED, RELIABLE) |
| limit | number | 12 | Results per page |
| offset | number | 0 | Pagination offset |
| sortBy | string | createdAt | Sort field (createdAt, price, securityScore) |
| sortOrder | string | desc | asc or desc |

**Example Request:**
```bash
GET /api/listings?area=KAHAWA_WENDANI&priceMin=8000&priceMax=20000&limit=12
```

**Response:**
```json
{
  "data": [
    {
      "id": "clq1a2b3c4d5e6f7",
      "title": "Spacious 2BR Bedsitter",
      "price": 15000,
      "bedrooms": 2,
      "bathrooms": 1,
      "area": "KAHAWA_WENDANI",
      "location": "Close to Main Gate",
      "latitude": 1.9437,
      "longitude": 36.881,
      "waterReliability": "RELIABLE",
      "hasWifi": true,
      "wifiQuality": 4,
      "securityScore": 5,
      "noiseLevel": 2,
      "lookingForRoommate": true,
      "isVerifiedProperty": true,
      "reviewCount": 12,
      "averageRating": 4.8
    }
  ],
  "total": 342,
  "limit": 12,
  "offset": 0,
  "hasMore": true
}
```

**Status Codes:**
- 200: Success
- 400: Bad request
- 500: Server error

---

#### POST /listings
Create a new property listing (requires authentication).

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Spacious Bedsitter",
  "description": "Well-ventilated room with WiFi",
  "price": 15000,
  "bedrooms": 2,
  "bathrooms": 1,
  "location": "Close to Main Gate",
  "area": "KAHAWA_WENDANI",
  "zone": "Kahawa Wendani - Main Area",
  "latitude": 1.9437,
  "longitude": 36.881,
  "waterReliability": "RELIABLE",
  "hasWifi": true,
  "wifiQuality": 4,
  "securityScore": 5,
  "noiseLevel": 2,
  "lookingForRoommate": true,
  "landlordId": "user_id_123",
  "landlordName": "John Doe",
  "phoneNumber": "+254712345678",
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```

**Response (201 Created):**
```json
{
  "id": "clq1a2b3c4d5e6f7",
  "title": "Spacious Bedsitter",
  "price": 15000,
  ...
}
```

---

#### GET /listings/[id]
Get a specific property by ID.

**Path Parameters:**
- `id`: Property ID

**Response:**
```json
{
  "id": "clq1a2b3c4d5e6f7",
  "title": "Spacious Bedsitter",
  "price": 15000,
  "bedrooms": 2,
  "bathrooms": 1,
  "area": "KAHAWA_WENDANI",
  "location": "Close to Main Gate",
  "latitude": 1.9437,
  "longitude": 36.881,
  "waterReliability": "RELIABLE",
  "hasWifi": true,
  "wifiQuality": 4,
  "securityScore": 5,
  "noiseLevel": 2,
  "lookingForRoommate": true,
  "isVerifiedProperty": true,
  "landlordName": "John Doe",
  "phoneNumber": "+254712345678",
  "reviews": [
    {
      "id": "review_123",
      "rating": 5,
      "comment": "Great place, friendly landlord",
      "authorName": "Jane Student",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

#### PUT /listings/[id]
Update a property (requires authentication as landlord).

**Path Parameters:**
- `id`: Property ID

**Request Body:** (Same fields as POST)

**Response:** Updated property object

---

#### DELETE /listings/[id]
Delete a property (requires authentication as landlord).

**Response:**
```json
{
  "message": "Property deleted successfully"
}
```

---

### Reviews

#### GET /listings/[id]/reviews
Get all reviews for a property.

**Query Parameters:**
- `limit`: Number of reviews (default: 10)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "data": [
    {
      "id": "review_123",
      "rating": 5,
      "comment": "Excellent place to live",
      "authorName": "Jane Student",
      "authorId": "user_123",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 12
}
```

---

#### POST /listings/[id]/reviews
Add a review to a property (requires authentication).

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Great location, friendly landlord, reliable water supply"
}
```

**Response (201 Created):**
```json
{
  "id": "review_new_123",
  "rating": 5,
  "comment": "Great location...",
  "authorName": "Jane Student",
  "createdAt": "2024-01-20T15:45:00Z"
}
```

---

### Users

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "student@ku.ac.ke",
  "password": "SecurePassword123!",
  "name": "Jane Student",
  "phone": "+254712345678",
  "role": "STUDENT"
}
```

**Response (201 Created):**
```json
{
  "id": "user_123",
  "email": "student@ku.ac.ke",
  "name": "Jane Student",
  "role": "STUDENT",
  "isVerified": false
}
```

---

#### POST /auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "student@ku.ac.ke",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_123",
    "email": "student@ku.ac.ke",
    "name": "Jane Student",
    "role": "STUDENT"
  }
}
```

---

#### GET /auth/me
Get current authenticated user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "user_123",
  "email": "student@ku.ac.ke",
  "name": "Jane Student",
  "phone": "+254712345678",
  "role": "STUDENT",
  "profileImage": "https://example.com/avatar.jpg",
  "bio": "Looking for affordable housing near campus",
  "isVerified": false
}
```

---

#### PUT /auth/profile
Update user profile.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Jane Updated",
  "phone": "+254798765432",
  "bio": "Updated bio"
}
```

---

## Error Responses

### 400 - Bad Request
```json
{
  "error": "Invalid input",
  "details": {
    "price": "Price must be a positive number"
  }
}
```

### 401 - Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 - Forbidden
```json
{
  "error": "You do not have permission to perform this action"
}
```

### 404 - Not Found
```json
{
  "error": "Property not found"
}
```

### 500 - Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

- **Limit**: 100 requests per minute per IP
- **Headers Returned**:
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: 95`
  - `X-RateLimit-Reset: 1642857600`

---

## Authentication

### Token Format
All authenticated requests require a Bearer token in the Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration
- Access tokens expire in 24 hours
- Refresh tokens expire in 30 days

---

## Webhooks (Future Implementation)

### Property Listing Created
```
POST /webhooks/property.created
```

---

## Examples

### JavaScript (Fetch)
```javascript
// Get listings
const response = await fetch(
  '/api/listings?area=KAHAWA_WENDANI&priceMax=20000',
  {
    headers: { 'Content-Type': 'application/json' }
  }
);
const data = await response.json();

// Create listing
const newListing = await fetch('/api/listings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token_here'
  },
  body: JSON.stringify({
    title: 'New Bedsitter',
    price: 15000,
    ...
  })
});
```

### cURL
```bash
# Get listings
curl -X GET \
  "http://localhost:3000/api/listings?area=KAHAWA_WENDANI&priceMax=20000" \
  -H "Content-Type: application/json"

# Create listing
curl -X POST \
  "http://localhost:3000/api/listings" \
  -H "Authorization: Bearer token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Bedsitter",
    "price": 15000,
    ...
  }'
```

---

## Status Codes Summary

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

**Last Updated**: January 2024
