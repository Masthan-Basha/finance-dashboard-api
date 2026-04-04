export async function authenticate(req, reply) {
  try {
    await req.jwtVerify()
  } catch (err) {
    return reply.status(401).send({
      success: false,
      error: 'Unauthorized: Invalid or expired token',
    })
  }
}
