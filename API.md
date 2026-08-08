# Servora REST API

Base URL: `http://localhost:5000/api`. Protected endpoints require `Authorization: Bearer <JWT>`. Responses use `{ "success": true, "message": "...", "data": ... }`; errors use the same envelope with `success: false` and `data: null`.

| Method | Endpoint | Description | Body / Query | Success |
|---|---|---|---|---|
| GET | `/health` | Health check | — | 200 |
| POST | `/auth/register` | Register and receive JWT | `{name,email,password}` | 201 |
| POST | `/auth/login` | Login and receive JWT | `{email,password}` | 200 |
| GET | `/users` | List active users (auth) | — | 200 |
| GET | `/users/me` | Current profile (auth) | — | 200 |
| GET | `/users/:id` | User by ID (auth) | — | 200/404 |
| PATCH | `/users/:id` | Update own/admin profile | Partial user | 200/403 |
| DELETE | `/users/:id` | Soft-delete own/admin user | — | 200/403 |
| GET | `/categories` | List categories | — | 200 |
| GET | `/categories/:id` | Category by ID | — | 200/404 |
| POST | `/categories` | Create category (auth) | `{name,slug,icon?,description?}` | 201 |
| PATCH | `/categories/:id` | Update category (auth) | Partial category | 200 |
| DELETE | `/categories/:id` | Soft-delete category (auth) | — | 200 |
| GET | `/services` | List active services | `?categoryId=` | 200 |
| GET | `/services/:id` | Service with provider/reviews | — | 200/404 |
| POST | `/services` | Create service (auth) | `{title,description,price,duration,categoryId,status?,image?}` | 201 |
| PATCH | `/services/:id` | Update service (auth) | Partial service | 200 |
| DELETE | `/services/:id` | Soft-delete service (auth) | — | 200 |
| GET | `/reviews` | List reviews | `?serviceId=` | 200 |
| GET | `/reviews/:id` | Review by ID | — | 200/404 |
| POST | `/reviews` | Create review (auth) | `{serviceId,rating,comment?}` | 201 |
| PATCH | `/reviews/:id` | Update own review | `{rating?,comment?}` | 200 |
| DELETE | `/reviews/:id` | Soft-delete own review | — | 200 |
| GET | `/bookings` | Current user's bookings | — | 200 |
| GET | `/bookings/:id` | Booking by ID | — | 200/404 |
| POST | `/bookings` | Book active service | `{serviceId,scheduledAt,address,note?}` | 201 |
| PATCH | `/bookings/:id` | Update own booking | Partial booking | 200 |
| DELETE | `/bookings/:id` | Soft-delete own booking | — | 200 |

Common status codes: `200` success, `201` created, `400` validation/input error, `401` unauthenticated, `403` forbidden, `404` missing resource, `409` conflict, `500` unexpected server error.
