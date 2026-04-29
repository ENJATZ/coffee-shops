# Coffee Shops API

Nest.js REST API to find the closest coffe shops. It takes a user position as `x` and `y`, reads the coffee shops from a remote CSV, and returns the 3 closest shops.

## Start the app

Install dependencies:

```bash
npm install
```

Make sure to have the `.env` extended from `.env.example`:

```bash
npm run start:dev
```

The API should be available at http://localhost:3000/api/v1 and the Swagger UI at http://localhost:3000/docs.

## Endpoint

```http
GET /api/v1/coffee-shops/nearby?x=47.6&y=-122.4
```

Response:

```json
{
  "data": [
    {
      "name": "Starbucks Seattle2",
      "location": {
        "x": 47.5869,
        "y": -122.3368
      },
      "distance": 0.0645
    }
  ]
}
```

## How is it built?

The app is split by responsibility:

- HTTP layer: controller and DTOs. It handles request validation and response shape
- Business logic layer: finds the closest coffee shops and calculates distance
- Data source layer: fetches the remote CSV, parses it, and caches it for the configured TTL
- Config layer: validates required env vars with Zod

## Tests

Run:

```bash
npm test
```

The tests cover:

- business logic for closest 3 shops
- distance calculation
- CSV parsing and cache behavior
- remote CSV source failure
- e2e endpoint response and validation

## Complexity

The closest shops function scans the list once and keeps only the best 3 results.

For `n` coffee shops and `k = 3`:

```
Time: O(n * k), which is O(n) because k is fixed
Space: O(k), which is O(1)
```

This is better than sorting the full list, which would be `O(n log n)` and would keep more data in memory than needed.
