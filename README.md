# POS Cashier System

Full-stack Point of Sale system for restaurants, cafés, and supermarkets.

**Stack:** Spring Boot 3.2 · Angular 17 · PostgreSQL · Flyway

Architecture mirrors [Property_Managments](../Property_Managments) (modular backend, JWT auth, `ApiResponse` envelope, Angular standalone layout with sidebar/topbar).

## Project structure

```
pos-cashier-system/
├── pos-backend/          # Spring Boot API (port 8082, context /api/v1)
├── pos-frontend/         # Angular 17 SPA (port 4200)
├── docker-compose.yml    # PostgreSQL for local dev
└── POS_IMPLEMENTATION_REPORT.md
```

## Prerequisites

- Java 17+
- Node.js 18+ and npm
- PostgreSQL 14+ (or Docker)

## Quick start

### 1. Database

**Option A — Docker (recommended)**

```powershell
cd "d:\Apps Work\My Apps\pos-cashier-system"
docker compose up -d
```

Uses port **5433** (see `application-dev.yml`).

**Option B — Local PostgreSQL**

Create database/schema or point to existing instance:

```powershell
$env:DB_URL = "jdbc:postgresql://localhost:5432/postgres?currentSchema=pos_mgmt"
$env:DB_USER = "postgres"
$env:DB_PASS = "admin"
```

Flyway runs automatically on backend startup (`V1`–`V4` migrations).

### 2. Backend

```powershell
cd pos-backend
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"

# Default profile (localhost:5432)
.\mvnw.cmd spring-boot:run

# Dev profile (Docker postgres on 5433)
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
```

API base URL: **http://localhost:8082/api/v1**

### 3. Frontend

```powershell
cd pos-frontend
npm install
npm start
```

App URL: **http://localhost:4200**

### Default users

| Username | Password | Role    |
|----------|----------|---------|
| admin    | admin123 | ADMIN   |
| cashier  | admin123 | CASHIER |

## Build & test

```powershell
# Backend compile
cd pos-backend
.\mvnw.cmd compile

# Backend tests
.\mvnw.cmd test

# Frontend production build
cd pos-frontend
npm run build
```

## API examples

```
POST /api/v1/auth/login
GET  /api/v1/dashboard/summary
GET  /api/v1/products?q=burger
POST /api/v1/pos/orders
POST /api/v1/pos/orders/{id}/pay
POST /api/v1/shifts/open
GET  /api/v1/reports/daily-sales
GET  /api/v1/inventory/low-stock
```

## Environment variables

| Variable     | Default                                              |
|--------------|------------------------------------------------------|
| `DB_URL`     | `jdbc:postgresql://localhost:5432/postgres?currentSchema=pos_mgmt` |
| `DB_USER`    | `postgres`                                           |
| `DB_PASS`    | `admin`                                              |
| `JWT_SECRET` | (see `application.yml`)                              |

See **POS_IMPLEMENTATION_REPORT.md** for full module list, migrations, and frontend pages.
