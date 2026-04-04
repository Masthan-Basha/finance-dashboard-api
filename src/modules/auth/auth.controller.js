import { registerSchema, loginSchema } from './auth.schema.js'
import { registerUser, loginUser, getMe } from './auth.service.js'

export async function register(req, reply) {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    return reply.status(400).send({
      success: false,
      error: 'Validation failed',
      details: parsed.error.flatten().fieldErrors,
    })
  }

  try {
    const user = await registerUser(parsed.data)
    return reply.status(201).send({ success: true, data: user })
  } catch (err) {
    return reply.status(err.statusCode ?? 500).send({
      success: false,
      error: err.message,
    })
  }
}

export async function login(req, reply) {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    return reply.status(400).send({
      success: false,
      error: 'Validation failed',
      details: parsed.error.flatten().fieldErrors,
    })
  }

  try {
    const result = await loginUser(parsed.data, req.server.jwt.sign)
    return reply.status(200).send({ success: true, data: result })
  } catch (err) {
    return reply.status(err.statusCode ?? 500).send({
      success: false,
      error: err.message,
    })
  }
}

export async function me(req, reply) {
  try {
    const user = await getMe(req.user.id)
    return reply.status(200).send({ success: true, data: user })
  } catch (err) {
    return reply.status(err.statusCode ?? 500).send({
      success: false,
      error: err.message,
    })
  }
}
