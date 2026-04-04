import bcrypt from 'bcrypt'
import prisma from '../../config/database.js'

const SALT_ROUNDS = 12

export async function getAllUsers({ page = 1, limit = 10, role, status }) {
  const skip = (page - 1) * limit
  const where = {}
  if (role)   where.role   = role
  if (status) where.status = status

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true, name: true, email: true,
        role: true, status: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ])

  return {
    data: users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true,
      role: true, status: true, createdAt: true,
    },
  })

  if (!user) {
    const err = new Error('User not found')
    err.statusCode = 404
    throw err
  }

  return user
}

export async function createUser({ name, email, password, role }) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    const err = new Error('Email already registered')
    err.statusCode = 409
    throw err
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

  return prisma.user.create({
    data: { name, email, password: hashedPassword, role: role ?? 'VIEWER' },
    select: {
      id: true, name: true, email: true,
      role: true, status: true, createdAt: true,
    },
  })
}

export async function updateUser(id, data) {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    const err = new Error('User not found')
    err.statusCode = 404
    throw err
  }

  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true, name: true, email: true,
      role: true, status: true, updatedAt: true,
    },
  })
}

export async function deleteUser(id, requestingUserId) {
  if (id === requestingUserId) {
    const err = new Error('You cannot delete your own account')
    err.statusCode = 400
    throw err
  }

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    const err = new Error('User not found')
    err.statusCode = 404
    throw err
  }

  await prisma.user.delete({ where: { id } })
  return { message: 'User deleted successfully' }
}
