# LEXDATA IA — SGPDP · LOPDP Ecuador

Plataforma de cumplimiento de la Ley Orgánica de Protección de Datos Personales.

## Quick start

```bash
# Prerequisites: Node 22+, pnpm 12+, Docker

# 1. Infrastructure
docker compose -f infra/docker-compose.yml up -d

# 2. Install dependencies
pnpm install

# 3. Environment
cp .env.example .env

# 4. Database
pnpm db:migrate
pnpm db:seed

# 5. Development
pnpm dev
# Web: http://localhost:5173
# API: http://localhost:3001/health
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start web + api in dev mode |
| `pnpm build` | Build all packages |
| `pnpm typecheck` | TypeScript check |
| `pnpm lint` | Lint all packages |
| `pnpm test` | Run all tests |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:seed` | Seed database |
| `pnpm db:reset` | Reset and re-seed |
