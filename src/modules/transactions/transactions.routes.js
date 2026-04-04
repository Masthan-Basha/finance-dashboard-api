import { authorize } from '../../middlewares/authorize.js'
import {
  listTransactions,
  getTransaction,
  createTransactionHandler,
  updateTransactionHandler,
  deleteTransactionHandler,
} from './transactions.controller.js'

export default async function transactionRoutes(fastify) {
  const adminOnly     = [fastify.authenticate, authorize('ADMIN')]
  const analystAdmin  = [fastify.authenticate, authorize('ADMIN', 'ANALYST')]
  const allRoles      = [fastify.authenticate, authorize('ADMIN', 'ANALYST', 'VIEWER')]

  // GET /api/transactions — All roles can view
  fastify.get('/', {
    onRequest: allRoles,
    schema: {
      tags: ['Transactions'],
      summary: 'List all transactions with filters and pagination',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page:      { type: 'integer', default: 1 },
          limit:     { type: 'integer', default: 10 },
          type:      { type: 'string', enum: ['INCOME', 'EXPENSE'] },
          category:  { type: 'string' },
          startDate: { type: 'string', description: 'ISO date e.g. 2026-01-01' },
          endDate:   { type: 'string', description: 'ISO date e.g. 2026-12-31' },
          search:    { type: 'string', description: 'Search in category or notes' },
        },
      },
    },
  }, listTransactions)

  // GET /api/transactions/:id — All roles
  fastify.get('/:id', {
    onRequest: allRoles,
    schema: {
      tags: ['Transactions'],
      summary: 'Get a single transaction by ID',
      security: [{ bearerAuth: [] }],
    },
  }, getTransaction)

  // POST /api/transactions — Admin only
  fastify.post('/', {
    onRequest: adminOnly,
    schema: {
      tags: ['Transactions'],
      summary: 'Create a new transaction (Admin only)',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['amount', 'type', 'category', 'date'],
        properties: {
          amount:   { type: 'number',  },
          type:     { type: 'string', enum: ['INCOME', 'EXPENSE'] },
          category: { type: 'string',  },
          date:     { type: 'string',  },
          notes:    { type: 'string',  },
        },
      },
    },
  }, createTransactionHandler)

  // PATCH /api/transactions/:id — Admin only
  fastify.patch('/:id', {
    onRequest: adminOnly,
    schema: {
      tags: ['Transactions'],
      summary: 'Update a transaction (Admin only)',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          amount:   { type: 'number' },
          type:     { type: 'string', enum: ['INCOME', 'EXPENSE'] },
          category: { type: 'string' },
          date:     { type: 'string' },
          notes:    { type: 'string' },
        },
      },
    },
  }, updateTransactionHandler)

  // DELETE /api/transactions/:id — Admin only (soft delete)
  fastify.delete('/:id', {
    onRequest: adminOnly,
    schema: {
      tags: ['Transactions'],
      summary: 'Soft delete a transaction (Admin only)',
      description: 'Marks the transaction as deleted without removing from database.',
      security: [{ bearerAuth: [] }],
    },
  }, deleteTransactionHandler)
}
