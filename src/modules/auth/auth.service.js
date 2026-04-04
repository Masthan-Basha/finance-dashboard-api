import bcrypt from 'bcrypt'
import prisma from '../../config/database.js'

const SALT_ROUNDS = 12

export async function registerUser({ name, email, password, role }) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    const err = new Error('Email already registered')
    err.statusCode = 409
    throw err
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role ?? 'VIEWER',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  })

  return user
}

export async function loginUser({ email, password }, jwtSign) {
  const user = await prisma.user.findUnique({ where: { email } })

  // Use same error message for wrong email/password to prevent user enumeration
  if (!user) {
    const err = new Error('Invalid email or password')
    err.statusCode = 401
    throw err
  }

  if (user.status === 'INACTIVE') {
    const err = new Error('Account is deactivated. Please contact an administrator.')
    err.statusCode = 403
    throw err
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    const err = new Error('Invalid email or password')
    err.statusCode = 401
    throw err
  }

  const token = jwtSign(
    { id: user.id, email: user.email, role: user.role },
    { expiresIn: '7d' }
  )

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  }
}

export async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  })

  if (!user) {
    const err = new Error('User not found')
    err.statusCode = 404
    throw err
  }

  return user
}
