import { register, login, me } from './auth.controller.js'

export default async function authRoutes(fastify) {
  fastify.post('/register', {
    schema: {
      tags: ['Auth'],
      summary: 'Register a new user',
      description: 'Creates a new user account. Default role is VIEWER unless specified.',
      body: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name:     { type: 'string', minLength: 2,  },
          email:    { type: 'string', format: 'email',  },
          password: { type: 'string', minLength: 8,  },
          role:     { type: 'string', enum: ['VIEWER', 'ANALYST', 'ADMIN'],  },
        },
      },
    },
  }, register)

  fastify.post('/login', {
    schema: {
      tags: ['Auth'],
      summary: 'Login and receive JWT token',
      description: 'Authenticate with email and password to receive a JWT token.',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email:    { type: 'string', format: 'email',  },
          password: { type: 'string',  },
        },
      },
    },
  }, login)

  fastify.get('/me', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['Auth'],
      summary: 'Get current user profile',
      description: 'Returns the profile of the currently authenticated user.',
      security: [{ bearerAuth: [] }],
    },
  }, me)
}
