import { createUserSchema, updateUserSchema } from './users.schema.js'
import {
  getAllUsers, getUserById, createUser, updateUser, deleteUser,
} from './users.service.js'

export async function listUsers(req, reply) {
  try {
    const { page = 1, limit = 10, role, status } = req.query
    const result = await getAllUsers({
      page: parseInt(page),
      limit: parseInt(limit),
      role,
      status,
    })
    return reply.status(200).send({ success: true, ...result })
  } catch (err) {
    return reply.status(err.statusCode ?? 500).send({ success: false, error: err.message })
  }
}

export async function getUser(req, reply) {
  try {
    const user = await getUserById(req.params.id)
    return reply.status(200).send({ success: true, data: user })
  } catch (err) {
    return reply.status(err.statusCode ?? 500).send({ success: false, error: err.message })
  }
}

export async function createUserHandler(req, reply) {
  const parsed = createUserSchema.safeParse(req.body)
  if (!parsed.success) {
    return reply.status(400).send({
      success: false,
      error: 'Validation failed',
      details: parsed.error.flatten().fieldErrors,
    })
  }

  try {
    const user = await createUser(parsed.data)
    return reply.status(201).send({ success: true, data: user })
  } catch (err) {
    return reply.status(err.statusCode ?? 500).send({ success: false, error: err.message })
  }
}

export async function updateUserHandler(req, reply) {
  const parsed = updateUserSchema.safeParse(req.body)
  if (!parsed.success) {
    return reply.status(400).send({
      success: false,
      error: 'Validation failed',
      details: parsed.error.flatten().fieldErrors,
    })
  }

  try {
    const user = await updateUser(req.params.id, parsed.data)
    return reply.status(200).send({ success: true, data: user })
  } catch (err) {
    return reply.status(err.statusCode ?? 500).send({ success: false, error: err.message })
  }
}

export async function deleteUserHandler(req, reply) {
  try {
    const result = await deleteUser(req.params.id, req.user.id)
    return reply.status(200).send({ success: true, data: result })
  } catch (err) {
    return reply.status(err.statusCode ?? 500).send({ success: false, error: err.message })
  }
}
