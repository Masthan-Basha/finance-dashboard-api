import {
  createTransactionSchema,
  updateTransactionSchema,
  filterTransactionSchema,
} from './transactions.schema.js'

import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  softDeleteTransaction,
} from './transactions.service.js'

export async function listTransactions(req, reply) {
  const parsed = filterTransactionSchema.safeParse(req.query)
  if (!parsed.success) {
    return reply.status(400).send({
      success: false,
      error: 'Invalid query parameters',
      details: parsed.error.flatten().fieldErrors,
    })
  }

  try {
    const result = await getAllTransactions(parsed.data)
    return reply.status(200).send({ success: true, ...result })
  } catch (err) {
    return reply.status(err.statusCode ?? 500).send({ success: false, error: err.message })
  }
}

export async function getTransaction(req, reply) {
  try {
    const transaction = await getTransactionById(req.params.id)
    return reply.status(200).send({ success: true, data: transaction })
  } catch (err) {
    return reply.status(err.statusCode ?? 500).send({ success: false, error: err.message })
  }
}

export async function createTransactionHandler(req, reply) {
  const parsed = createTransactionSchema.safeParse(req.body)
  if (!parsed.success) {
    return reply.status(400).send({
      success: false,
      error: 'Validation failed',
      details: parsed.error.flatten().fieldErrors,
    })
  }

  try {
    const transaction = await createTransaction(parsed.data, req.user.id)
    return reply.status(201).send({ success: true, data: transaction })
  } catch (err) {
    return reply.status(err.statusCode ?? 500).send({ success: false, error: err.message })
  }
}

export async function updateTransactionHandler(req, reply) {
  const parsed = updateTransactionSchema.safeParse(req.body)
  if (!parsed.success) {
    return reply.status(400).send({
      success: false,
      error: 'Validation failed',
      details: parsed.error.flatten().fieldErrors,
    })
  }

  try {
    const transaction = await updateTransaction(req.params.id, parsed.data)
    return reply.status(200).send({ success: true, data: transaction })
  } catch (err) {
    return reply.status(err.statusCode ?? 500).send({ success: false, error: err.message })
  }
}

export async function deleteTransactionHandler(req, reply) {
  try {
    const result = await softDeleteTransaction(req.params.id)
    return reply.status(200).send({ success: true, data: result })
  } catch (err) {
    return reply.status(err.statusCode ?? 500).send({ success: false, error: err.message })
  }
}
