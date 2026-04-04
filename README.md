# Finance Dashboard API

Backend system for a finance dashboard with role-based access control, financial records management, and analytics.

Built with **Node.js · Fastify · PostgreSQL · Prisma · JWT**

🚀 **Live API:** https://finance-dashboard-api-1-cu7x.onrender.com
📄 **Swagger Docs:** https://finance-dashboard-api-1-cu7x.onrender.com/docs

---

## Quick Start

**Prerequisites:** Node.js 18+ and PostgreSQL 13+

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials and JWT secret

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed demo data
npm run db:seed

# Start server
npm run dev
```

Server → `http://localhost:3000`
API Docs → `http://localhost:3000/docs`

---

## Environment Variables

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/finance_db"
JWT_SECRET="generate: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
NODE_ENV="development"
PORT=3000
```

---

## Demo Credentials

| Role    | Email               | Password     |
|---------|---------------------|--------------|
| Admin   | admin@demo.com      | Admin@123    |
| Analyst | analyst@demo.com    | Analyst@123  |
| Viewer  | viewer@demo.com     | Viewer@123   |

---

## Role Permissions

| Action                              | Viewer | Analyst | Admin |
|-------------------------------------|:------:|:-------:|:-----:|
| Login / view own profile            | ✅     | ✅      | ✅    |
| View & filter transactions          | ✅     | ✅      | ✅    |
| View dashboard & analytics          | ✅     | ✅      | ✅    |
| Create / edit / delete transactions | ❌     | ❌      | ✅    |
| Manage users                        | ❌     | ❌      | ✅    |

---

## API Endpoints

| Method | Endpoint                   | Access  | Description                              |
|--------|----------------------------|---------|------------------------------------------|
| POST   | `/api/auth/register`       | Public  | Register new user                        |
| POST   | `/api/auth/login`          | Public  | Login, returns JWT                       |
| GET    | `/api/auth/me`             | All     | Own profile                              |
| GET    | `/api/users`               | Admin   | List users                               |
| POST   | `/api/users`               | Admin   | Create user                              |
| PATCH  | `/api/users/:id`           | Admin   | Update role / status                     |
| DELETE | `/api/users/:id`           | Admin   | Delete user                              |
| GET    | `/api/transactions`        | All     | List with filters & pagination           |
| POST   | `/api/transactions`        | Admin   | Create transaction                       |
| PATCH  | `/api/transactions/:id`    | Admin   | Update transaction                       |
| DELETE | `/api/transactions/:id`    | Admin   | Soft delete                              |
| GET    | `/api/dashboard/summary`   | All     | Income, expenses, net balance, trends    |
| GET    | `/api/dashboard/weekly`    | All     | Weekly income vs expense (8 weeks)       |

### Transaction Filters

```
GET /api/transactions?type=INCOME&category=Salary&startDate=2026-01-01&endDate=2026-03-31&page=1&limit=10&search=bonus
```

---

## Tech Stack

| Layer      | Choice          | Reason                                        |
|------------|-----------------|-----------------------------------------------|
| Framework  | Fastify         | Schema-first, faster than Express             |
| Database   | PostgreSQL      | Relational integrity, powerful aggregations   |
| ORM        | Prisma          | Type-safe queries, clean migrations           |
| Validation | Zod             | Field-level error messages                    |
| Auth       | JWT + bcrypt    | Stateless auth, secure password hashing       |
| Docs       | Swagger UI      | Auto-generated, interactive docs              |
| Tests      | Vitest          | Unit tests for business logic                 |

---

## Project Structure

```
src/
├── config/             # Database client
├── middlewares/        # JWT auth + role authorization
├── modules/
│   ├── auth/           # Register, login, profile
│   ├── users/          # User management
│   ├── transactions/   # Financial records
│   └── dashboard/      # Analytics & summaries
└── app.js
prisma/
├── schema.prisma       # Data models
└── seed.js             # Demo data
tests/
└── dashboard.test.js   # Unit tests
```

---

## Tests

```bash
npm test
```

Covers: summary calculations, monthly trend processing, and role authorization logic.

---

## Assumptions

- Any role can be assigned at registration. In production this would be admin-only.
- Deleted transactions use soft delete (`isDeleted: true`) to preserve audit history.
- Login returns the same error for wrong email or password to prevent user enumeration.
- JWT tokens expire in 7 days. Refresh tokens are out of scope.
- Monetary amounts stored as `Decimal(12,2)` to avoid floating point issues.
