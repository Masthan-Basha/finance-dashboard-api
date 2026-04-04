import { authorize } from '../../middlewares/authorize.js'
import { getDashboardSummary, getWeeklySummary } from './dashboard.service.js'

export default async function dashboardRoutes(fastify) {
  const allRoles = [fastify.authenticate, authorize('ADMIN', 'ANALYST', 'VIEWER')]

  // GET /api/dashboard/summary — All authenticated roles
  fastify.get('/summary', {
    onRequest: allRoles,
    schema: {
      tags: ['Dashboard'],
      summary: 'Get full dashboard summary',
      description:
        'Returns total income, expenses, net balance, category breakdown, monthly trends, and recent transactions.',
      security: [{ bearerAuth: [] }],
    },
  }, async (req, reply) => {
    try {
      const data = await getDashboardSummary()
      return reply.status(200).send({ success: true, data })
    } catch (err) {
      return reply.status(err.statusCode ?? 500).send({ success: false, error: err.message })
    }
  })

  // GET /api/dashboard/weekly — All authenticated roles
  fastify.get('/weekly', {
    onRequest: allRoles,
    schema: {
      tags: ['Dashboard'],
      summary: 'Get weekly income vs expense trends (last 8 weeks)',
      security: [{ bearerAuth: [] }],
    },
  }, async (req, reply) => {
    try {
      const data = await getWeeklySummary()
      return reply.status(200).send({ success: true, data })
    } catch (err) {
      return reply.status(err.statusCode ?? 500).send({ success: false, error: err.message })
    }
  })
}
