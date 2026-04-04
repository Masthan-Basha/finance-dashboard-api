import { authorize } from '../../middlewares/authorize.js'
import {
  listUsers, getUser, createUserHandler, updateUserHandler, deleteUserHandler,
} from './users.controller.js'

export default async function userRoutes(fastify) {
  const auth    = [fastify.authenticate]
  const admin   = [fastify.authenticate, authorize('ADMIN')]
  const any     = [fastify.authenticate, authorize('ADMIN', 'ANALYST', 'VIEWER')]

  // GET /api/users — ADMIN only
  fastify.get('/', {
    onRequest: admin,
    schema: {
      tags: ['Users'],
      summary: 'List all users (Admin only)',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page:   { type: 'integer', default: 1 },
          limit:  { type: 'integer', default: 10 },
          role:   { type: 'string', enum: ['VIEWER', 'ANALYST', 'ADMIN'] },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
        },
      },
    },
  }, listUsers)

  // GET /api/users/:id — ADMIN only
  fastify.get('/:id', {
    onRequest: admin,
    schema: {
      tags: ['Users'],
      summary: 'Get user by ID (Admin only)',
      security: [{ bearerAuth: [] }],
    },
  }, getUser)

  // POST /api/users — ADMIN only
  fastify.post('/', {
    onRequest: admin,
    schema: {
      tags: ['Users'],
      summary: 'Create a new user (Admin only)',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name:     { type: 'string' },
          email:    { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          role:     { type: 'string', enum: ['VIEWER', 'ANALYST', 'ADMIN'] },
        },
      },
    },
  }, createUserHandler)

  // PATCH /api/users/:id — ADMIN only
  fastify.patch('/:id', {
    onRequest: admin,
    schema: {
      tags: ['Users'],
      summary: 'Update user role or status (Admin only)',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          name:   { type: 'string' },
          role:   { type: 'string', enum: ['VIEWER', 'ANALYST', 'ADMIN'] },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
        },
      },
    },
  }, updateUserHandler)

  // DELETE /api/users/:id — ADMIN only
  fastify.delete('/:id', {
    onRequest: admin,
    schema: {
      tags: ['Users'],
      summary: 'Delete a user (Admin only)',
      security: [{ bearerAuth: [] }],
    },
  }, deleteUserHandler)
}
