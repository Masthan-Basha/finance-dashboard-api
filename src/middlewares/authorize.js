/**
 * Role-based authorization middleware
 * Usage: onRequest: [fastify.authenticate, authorize('ADMIN')]
 * Usage: onRequest: [fastify.authenticate, authorize('ADMIN', 'ANALYST')]
 */
export function authorize(...allowedRoles) {
  return async function (req, reply) {
    const userRole = req.user?.role

    if (!allowedRoles.includes(userRole)) {
      return reply.status(403).send({
        success: false,
        error: `Forbidden: This action requires one of the following roles: [${allowedRoles.join(', ')}]`,
      })
    }
  }
}
