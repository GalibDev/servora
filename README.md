# Servora — Full-stack service marketplace

Production-oriented REST API built with Express, TypeScript, Prisma and PostgreSQL, with a React frontend consuming the API.

## Quick start

1. Create a PostgreSQL database (local, Supabase or Neon).
2. Copy `server/.env.example` to `server/.env` and set `DATABASE_URL` and `JWT_SECRET`.
3. Optionally copy `client/.env.example` to `client/.env`.
4. Run `npm run install:all`.
5. Run `npm run prisma:migrate --prefix server -- --name init` then `npm run seed --prefix server`.
6. Run `npm run dev` and open `http://localhost:5173`.

Demo accounts after seeding: `customer@servora.com` or `provider@servora.com`, password `Password123!`.

## Architecture

`server/src/routes` defines HTTP contracts, `server/src/services` contains business logic, `server/src/middleware` provides authentication/error boundaries, and `server/src/lib` owns shared infrastructure. Prisma models use normalized relations, enums, indexes, timestamps, mapped table names, and soft deletion. The client keeps all HTTP access in `client/src/api.ts`.

See [API.md](./API.md) for the complete API contract.

## Vercel deployment

The repository is configured as an npm workspace. Vercel installs both client and server dependencies, generates Prisma Client during `postinstall`, builds the React app into `client/dist`, and serves Express through the serverless `api/index.ts` entrypoint.

Add these environment variables in Vercel Project Settings before deploying:

- `DATABASE_URL`: a pooled PostgreSQL connection URL from Neon/Supabase (recommended for serverless)
- `JWT_SECRET`: a long random production secret
- `CLIENT_URL`: the deployed Vercel URL (optional for same-origin deployment)
- `VITE_API_URL`: `/api`

Run production migrations against the same database before the first deployment: `npm run prisma:deploy -w server`.
