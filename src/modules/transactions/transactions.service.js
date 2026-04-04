import prisma from '../../config/database.js'

export async function getAllTransactions({ page, limit, type, category, startDate, endDate, search }) {
  const skip = (page - 1) * limit

  const where = { isDeleted: false }

  if (type)     where.type     = type
  if (category) where.category = { contains: category, mode: 'insensitive' }

  if (startDate || endDate) {
    where.date = {}
    if (startDate) where.date.gte = new Date(startDate)
    if (endDate)   where.date.lte = new Date(endDate)
  }

  if (search) {
    where.OR = [
      { category: { contains: search, mode: 'insensitive' } },
      { notes:    { contains: search, mode: 'insensitive' } },
    ]
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    prisma.transaction.count({ where }),
  ])

  return {
    data: transactions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getTransactionById(id) {
  const transaction = await prisma.transaction.findFirst({
    where: { id, isDeleted: false },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  })

  if (!transaction) {
    const err = new Error('Transaction not found')
    err.statusCode = 404
    throw err
  }

  return transaction
}

export async function createTransaction(data, userId) {
  return prisma.transaction.create({
    data: {
      ...data,
      date:   new Date(data.date),
      userId,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  })
}

export async function updateTransaction(id, data) {
  const transaction = await prisma.transaction.findFirst({
    where: { id, isDeleted: false },
  })

  if (!transaction) {
    const err = new Error('Transaction not found')
    err.statusCode = 404
    throw err
  }

  const updateData = { ...data }
  if (data.date) updateData.date = new Date(data.date)

  return prisma.transaction.update({
    where: { id },
    data: updateData,
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  })
}

export async function softDeleteTransaction(id) {
  const transaction = await prisma.transaction.findFirst({
    where: { id, isDeleted: false },
  })

  if (!transaction) {
    const err = new Error('Transaction not found')
    err.statusCode = 404
    throw err
  }

  await prisma.transaction.update({
    where: { id },
    data: { isDeleted: true },
  })

  return { message: 'Transaction deleted successfully' }
}
