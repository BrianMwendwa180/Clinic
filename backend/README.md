# Clinic backend (Node + TypeScript + Express + Prisma)

Quick start (dev, production-like using Postgres via Docker)

1. Copy environment file and tweak values:

```bash
cp backend/.env.example backend/.env
# edit backend/.env and set values (DATABASE_URL, SMTP_*, JWT_SECRET)
```

2. Start Postgres (docker-compose) for local dev:

```bash
cd backend
docker-compose up -d
```

3. Install dependencies and generate Prisma client:

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
```

4. Run in dev mode:

```bash
npm run dev
# server will be on http://localhost:4000
```

Notes
- Public endpoints:
  - POST /api/appointments
  - POST /api/contact
- This scaffold uses PostgreSQL. Set `DATABASE_URL` in `.env`.
- If SMTP is not configured the server will still store records but skip sending email notifications.
