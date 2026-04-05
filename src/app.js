import Fastify       from 'fastify'
import jwt           from '@fastify/jwt'
import swagger       from '@fastify/swagger'
import swaggerUi     from '@fastify/swagger-ui'
import 'dotenv/config'

import { authenticate }      from './middlewares/authenticate.js'
import authRoutes            from './modules/auth/auth.routes.js'
import userRoutes            from './modules/users/users.routes.js'
import transactionRoutes     from './modules/transactions/transactions.routes.js'
import dashboardRoutes       from './modules/dashboard/dashboard.routes.js'

const app = Fastify({ logger: true })

// ── Swagger / OpenAPI ──────────────────────────────────────────────────────────
await app.register(swagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title:       'Finance Dashboard API',
      description: 'Finance Data Processing and Access Control Backend — Zorvyn Assignment',
      version:     '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type:         'http',
          scheme:       'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      { name: 'Auth',         description: 'Authentication endpoints' },
      { name: 'Users',        description: 'User management (Admin only)' },
      { name: 'Transactions', description: 'Financial record management' },
      { name: 'Dashboard',    description: 'Summary and analytics endpoints' },
    ],
  },
})

await app.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    persistAuthorization: true,
    docExpansion:         'list',
  },
})

// ── JWT ────────────────────────────────────────────────────────────────────────
await app.register(jwt, {
  secret: process.env.JWT_SECRET,
})

// ── Decorators ─────────────────────────────────────────────────────────────────
app.decorate('authenticate', authenticate)

// ── Root route ─────────────────────────────────────────────────────────────────
app.get('/', async () => ({
  message: 'Finance Dashboard API',
  version: '1.0.0',
  docs:    'https://finance-dashboard-api-1-cu7x.onrender.com/docs',
  health:  'https://finance-dashboard-api-1-cu7x.onrender.com/health',
}))

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/health', {
  schema: {
    tags: ['Health'],
    summary: 'Health check',
  },
}, async () => ({
  status:    'ok',
  timestamp: new Date().toISOString(),
  version:   '1.0.0',
}))

// ── Routes ─────────────────────────────────────────────────────────────────────
await app.register(authRoutes,        { prefix: '/api/auth' })
await app.register(userRoutes,        { prefix: '/api/users' })
await app.register(transactionRoutes, { prefix: '/api/transactions' })
await app.register(dashboardRoutes,   { prefix: '/api/dashboard' })

// ── Global error handler ───────────────────────────────────────────────────────
app.setErrorHandler((error, req, reply) => {
  app.log.error(error)
  reply.status(error.statusCode ?? 500).send({
    success: false,
    error:   error.message ?? 'Internal server error',
  })
})

// ── Start ──────────────────────────────────────────────────────────────────────
try {
  const port = parseInt(process.env.PORT ?? '3000')
  await app.listen({ port, host: '0.0.0.0' })
  console.log('')
  console.log(`Server    → http://localhost:${port}`)
  console.log(`Swagger   → http://localhost:${port}/docs`)
  console.log(`Health    → http://localhost:${port}/health`)
  console.log('')
} catch (err) {
  app.log.error(err)
  process.exit(1)
}

export default app
