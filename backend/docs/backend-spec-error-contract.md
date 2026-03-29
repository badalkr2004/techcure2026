# Error Contract and Response Patterns

This document defines the observed API response patterns to be preserved when recreating the backend.

---

## Success Responses
- Most successful writes return JSON with `success: true` and a `message`.
- List endpoints return `count` and a list array.
- Creation endpoints frequently return `201` with a payload object.

Examples
- `POST /api/issues`
  - Status `201`
  - Body: `{ success: true, issueId, message, nearbyVolunteersNotified, status }`

- `POST /api/donations`
  - Status `201`
  - Body: `{ success: true, message, donation }`

- List endpoints
  - Status `200`
  - Body: `{ items: [...], count: number }` or a similar naming (`issues`, `campaigns`, `donations`).

---

## Error Responses
- Errors return JSON with `error` string.
- Typical status codes
  - `400` for validation or missing input
  - `401` for missing auth
  - `403` for role or permission errors
  - `404` when resource is not found
  - `500` for unhandled server errors

Examples
- `{ error: "Authentication required" }` with `401`
- `{ error: "Not found" }` with `404`
- `{ error: "Failed to ..." }` with `500`

---

## Consistency Rules
- Maintain the same `error` field name.
- Maintain the same status codes per route as defined in the route implementation.
- Prefer stable `message` strings for success responses to match existing clients.
