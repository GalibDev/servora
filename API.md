# Servora REST API

Local base URL: `http://localhost:5000/api`. Live base URL: `https://servora-opal.vercel.app/api`. Protected endpoints require `Authorization: Bearer <JWT>`.

Successful responses use `{ "success": true, "message": "...", "data": ... }`. Errors use the same envelope with `success: false` and `data: null`. Paginated list endpoints accept `?page=1&limit=20` (maximum 100) and include a top-level `meta` object.

| Method | Endpoint | Description | Body / Query | Status |
|---|---|---|---|---|
| GET | `/health` | Application health | — | 200 |
| GET | `/health/database` | Database connectivity | — | 200/503 |
| POST | `/auth/register` | Register as customer/provider and receive JWT | `{name,email,password,role: "CUSTOMER" | "PROVIDER"}` | 201/400/409 |
| POST | `/auth/login` | Login and receive JWT | `{email,password}` | 200/400/401/429 |
| GET | `/users` | Paginated users (admin) | `?page=&limit=` | 200/403 |
| GET | `/users/me` | Current profile | — | 200/401 |
| GET | `/users/:id` | Own/admin user by ID | — | 200/403/404 |
| PATCH | `/users/:id` | Update own/admin user | `{name?,avatar?,role?,status?: "ACTIVE" | "SUSPENDED"}` | 200/400/403 |
| DELETE | `/users/:id` | Soft-delete own/admin user | — | 200/403 |
| GET | `/categories` | Paginated categories | `?page=&limit=` | 200 |
| GET | `/categories/manage` | All active/inactive categories (admin) | `?page=&limit=` | 200/401/403 |
| GET | `/categories/:id` | Category by ID | — | 200/404 |
| POST | `/categories` | Create category (admin) | `{name,slug,icon?,description?,status?: "ACTIVE" | "INACTIVE"}` | 201/400/403 |
| PATCH | `/categories/:id` | Update category (admin) | Partial category | 200/400/403 |
| DELETE | `/categories/:id` | Soft-delete category (admin) | — | 200/403 |
| GET | `/services` | Paginated active services | `?categoryId=&search=&page=&limit=` | 200 |
| GET | `/services/mine` | Provider/admin managed services | `?page=&limit=` | 200/403 |
| GET | `/services/:id` | Service with provider/reviews | — | 200/404 |
| POST | `/services` | Create service (provider/admin) | `{title,description,price,duration,categoryId,status?,image?}` | 201/400/403 |
| PATCH | `/services/:id` | Update owned service/admin | Partial service | 200/400/403 |
| DELETE | `/services/:id` | Soft-delete owned service/admin | — | 200/403 |
| GET | `/reviews` | Paginated reviews | `?serviceId=&page=&limit=` | 200 |
| GET | `/reviews/mine` | Current customer's reviews | `?page=&limit=` | 200/401/403 |
| GET | `/reviews/:id` | Review by ID | — | 200/404 |
| POST | `/reviews` | Create/update own review | `{serviceId,rating,comment?}` | 201/400 |
| PATCH | `/reviews/:id` | Update own review | `{rating?,comment?}` | 200/400 |
| DELETE | `/reviews/:id` | Soft-delete own review | — | 200 |
| GET | `/bookings` | Customer bookings | `?page=&limit=` | 200 |
| GET | `/bookings/provider` | Provider/admin incoming bookings | `?page=&limit=` | 200/403 |
| GET | `/bookings/:id` | Authorized booking by ID | — | 200/403/404 |
| POST | `/bookings` | Book active service | `{serviceId,scheduledAt,address,note?}` | 201/400/404 |
| PATCH | `/bookings/:id` | Update booking/status | `{status?,scheduledAt?,address?,note?}` | 200/400/403 |
| DELETE | `/bookings/:id` | Soft-delete booking | — | 200/403 |

All mutation bodies are validated centrally with Zod. Invalid input returns `400`; missing/invalid authentication returns `401`; authorization failures return `403`; rate-limited requests return `429`.

Public registration deliberately accepts only `CUSTOMER` and `PROVIDER`; `ADMIN` accounts cannot be created through the public API. User, category, service, review, and booking records all have enum-backed status fields in addition to soft deletion. Suspended users cannot log in, and inactive categories or hidden reviews are excluded from public results.

Example paginated response:

```json
{
  "success": true,
  "message": "Services retrieved successfully",
  "data": [],
  "meta": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
}
```
