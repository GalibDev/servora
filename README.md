<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:102f29,50:315c50,100:8caf9f&height=230&section=header&text=Servora&fontSize=76&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Thoughtful%20help%2C%20close%20to%20home&descAlignY=60&descSize=20" alt="Servora animated header" width="100%" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=DM+Sans&weight=600&size=22&duration=2800&pause=900&color=315C50&center=true&vCenter=true&width=760&lines=Full-stack+local+service+marketplace;Customer%2C+provider+and+admin+workflows;Production-ready+Express+%2B+Prisma+REST+API" alt="Servora animated introduction" />
</p>

<p align="center">
  <a href="https://servora-opal.vercel.app"><img src="https://img.shields.io/badge/Live_Demo-Open_Servora-123a32?style=for-the-badge&logo=vercel&logoColor=white" alt="Live demo" /></a>
  <a href="https://servora-opal.vercel.app/api/health"><img src="https://img.shields.io/badge/API-Live-4f806f?style=for-the-badge&logo=express&logoColor=white" alt="Live API" /></a>
  <a href="./API.md"><img src="https://img.shields.io/badge/API-Documentation-c9974d?style=for-the-badge&logo=readthedocs&logoColor=white" alt="API documentation" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111" alt="React" />
  <img src="https://img.shields.io/badge/Tests-Vitest-6E9F18?logo=vitest&logoColor=white" alt="Vitest" />
</p>

## Servora at a glance

Servora is a responsive service marketplace where customers discover and book trusted local professionals, providers manage their offerings and incoming work, and administrators oversee the complete platform. It combines a polished React interface with a modular, type-safe Express REST API.

<p align="center">
  <a href="https://servora-opal.vercel.app">
    <img src="./docs/screenshots/home.png" alt="Servora home page" width="100%" />
  </a>
</p>

## What makes it complete

| Experience | Included capabilities |
|---|---|
| Customer | Search and browse services, book with a date picker, manage bookings, submit reviews, edit profile |
| Provider | Create, edit and soft-delete services; view incoming bookings; update booking status |
| Admin | Manage users, categories, services and bookings from one role-protected console |
| Authentication | Customer/provider registration, bcrypt password hashing, JWT login and role authorization |
| REST API | Full CRUD, pagination, Zod validation, consistent envelopes and centralized error handling |
| Production hardening | Helmet, CORS, rate limiting, structured Pino logging, indexes and automated API tests |
| User experience | Responsive layouts, active navigation, loading states, toast feedback, hover animations and hero slider |

## Role-based dashboards

<table>
  <tr>
    <td width="50%"><strong>Customer workspace</strong><br/><br/><img src="./docs/screenshots/customer-dashboard.png" alt="Servora customer dashboard" /></td>
    <td width="50%"><strong>Provider studio</strong><br/><br/><img src="./docs/screenshots/provider-dashboard.png" alt="Servora provider dashboard" /></td>
  </tr>
  <tr>
    <td colspan="2"><strong>Admin console</strong><br/><br/><img src="./docs/screenshots/admin-dashboard.png" alt="Servora admin dashboard" /></td>
  </tr>
</table>

## Technology

| Layer | Stack |
|---|---|
| Frontend | React 19, TypeScript, Vite, responsive CSS |
| Backend | Express 5, TypeScript, REST architecture |
| Data | PostgreSQL / Neon, Prisma ORM and Prisma Migrate |
| Security | JWT, bcrypt, Helmet, CORS and rate limiting |
| Quality | Zod, Pino, Vitest and Supertest |
| Deployment | Vercel serverless API and static frontend |

## Architecture

```text
servora/
├── api/
│   └── index.ts                 # Vercel serverless entrypoint
├── client/
│   └── src/
│       ├── api.ts               # Central API client
│       ├── components/          # Reusable interface components
│       └── App.tsx              # Marketplace and role workflows
├── server/
│   ├── prisma/
│   │   ├── schema.prisma        # Normalized database schema
│   │   └── seed.ts              # Demo data
│   └── src/
│       ├── controllers/         # HTTP request/response layer
│       ├── services/            # Domain business logic
│       ├── routes/              # REST route contracts
│       ├── validation/          # Centralized Zod schemas
│       ├── middleware/          # Auth, roles, errors and security
│       ├── lib/                 # Prisma and shared utilities
│       ├── app.ts
│       └── server.ts
├── API.md                       # Complete API reference
└── SUBMISSION.md                # Submission checklist
```

The backend separates routing, controllers and domain services for users, categories, services, reviews and bookings. Prisma models use proper relations, mapped table names, indexes, timestamps, enum-backed states and soft deletion.

## Run locally

### Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- A PostgreSQL database (local, Neon or Supabase)

### 1. Install

```bash
git clone https://github.com/GalibDev/servora.git
cd servora
npm install
```

### 2. Configure environment variables

Copy `server/.env.example` to `server/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
JWT_SECRET="replace-with-a-long-random-secret"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

Copy `client/.env.example` to `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Prepare the database

```bash
npm run prisma:migrate -w server -- --name init
npm run seed -w server
```

### 4. Start both applications

```bash
npm run dev
```

Open `http://localhost:5173`. The API runs at `http://localhost:5000/api`.

## Demo accounts

All seeded accounts use the password `Password123!`.

| Role | Email | Destination after login |
|---|---|---|
| Customer | `customer@servora.com` | My dashboard |
| Provider | `provider@servora.com` | Provider studio |
| Admin | `admin@servora.com` | Admin console |

Public registration supports `CUSTOMER` and `PROVIDER`. Admin accounts cannot be created through the public API.

## API overview

Base URL: `https://servora-opal.vercel.app/api`

| Module | Base endpoint | Highlights |
|---|---|---|
| Auth | `/auth` | Register, login and JWT issuance |
| Users | `/users` | Profile management and admin user CRUD |
| Categories | `/categories` | Public discovery and admin CRUD |
| Services | `/services` | Search, pagination and provider-owned CRUD |
| Reviews | `/reviews` | Customer feedback CRUD |
| Bookings | `/bookings` | Customer booking and provider status workflow |

Every response uses a predictable envelope:

```json
{
  "success": true,
  "message": "Services retrieved successfully",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

See the [complete API documentation](./API.md) for request bodies, authorization rules, responses and status codes.

## Database design

The normalized Prisma schema includes `User`, `Category`, `Service`, `Review` and `Booking`. It demonstrates:

- Six enums for roles and lifecycle states
- One-to-many and unique relational constraints
- `createdAt` and `updatedAt` audit fields
- `isDeleted` soft-delete support on every major model
- Query-focused compound indexes
- PostgreSQL table mapping with `@@map()`

Useful Prisma commands:

```bash
npm run prisma:generate -w server
npm run prisma:migrate -w server -- --name your_migration
npm run prisma:studio -w server
npm run prisma:deploy -w server
```

## Verification

```bash
npm test
npm run build
```

The API test suite covers authentication, authorization, validation, pagination, security headers, rate limiting and standardized errors.

## Deployment and submission

| Deliverable | Link |
|---|---|
| Live application | [servora-opal.vercel.app](https://servora-opal.vercel.app) |
| Live backend API | [servora-opal.vercel.app/api](https://servora-opal.vercel.app/api) |
| API health | [servora-opal.vercel.app/api/health](https://servora-opal.vercel.app/api/health) |
| Source repository | [github.com/GalibDev/servora](https://github.com/GalibDev/servora) |
| API documentation | [API.md](./API.md) |
| Submission checklist | [SUBMISSION.md](./SUBMISSION.md) |

For Vercel, configure `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL` and `VITE_API_URL=/api`, then run production migrations with `npm run prisma:deploy -w server`.

## Author

Built by **Mirza Galib Palash**.

- Email: [mirza.galib.palash@gmail.com](mailto:mirza.galib.palash@gmail.com)
- GitHub: [@GalibDev](https://github.com/GalibDev)

<p align="center">
  <strong>Servora — more time for life.</strong><br/>
  If this project helped you, consider giving it a ⭐
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:8caf9f,50:315c50,100:102f29&height=120&section=footer" alt="Servora footer" width="100%" />
</p>
