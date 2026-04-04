import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hash = (pw) => bcrypt.hash(pw, 12)

  // Create demo users
  await prisma.user.createMany({
    data: [
      {
        name: 'Admin User',
        email: 'admin@demo.com',
        password: await hash('Admin@123'),
        role: 'ADMIN',
      },
      {
        name: 'Analyst User',
        email: 'analyst@demo.com',
        password: await hash('Analyst@123'),
        role: 'ANALYST',
      },
      {
        name: 'Viewer User',
        email: 'viewer@demo.com',
        password: await hash('Viewer@123'),
        role: 'VIEWER',
      },
    ],
    skipDuplicates: true,
  })

  const admin = await prisma.user.findUnique({ where: { email: 'admin@demo.com' } })

  // Create sample transactions
  await prisma.transaction.createMany({
    data: [
      {
        amount: 50000,
        type: 'INCOME',
        category: 'Salary',
        date: new Date('2026-01-01'),
        notes: 'Monthly salary',
        userId: admin.id,
      },
      {
        amount: 15000,
        type: 'EXPENSE',
        category: 'Rent',
        date: new Date('2026-01-05'),
        notes: 'Monthly rent',
        userId: admin.id,
      },
      {
        amount: 3000,
        type: 'EXPENSE',
        category: 'Groceries',
        date: new Date('2026-01-10'),
        notes: 'Monthly groceries',
        userId: admin.id,
      },
      {
        amount: 8000,
        type: 'INCOME',
        category: 'Freelance',
        date: new Date('2026-01-15'),
        notes: 'Freelance project payment',
        userId: admin.id,
      },
      {
        amount: 2000,
        type: 'EXPENSE',
        category: 'Utilities',
        date: new Date('2026-01-20'),
        notes: 'Electricity and water',
        userId: admin.id,
      },
      {
        amount: 50000,
        type: 'INCOME',
        category: 'Salary',
        date: new Date('2026-02-01'),
        notes: 'Monthly salary',
        userId: admin.id,
      },
      {
        amount: 15000,
        type: 'EXPENSE',
        category: 'Rent',
        date: new Date('2026-02-05'),
        notes: 'Monthly rent',
        userId: admin.id,
      },
      {
        amount: 5000,
        type: 'EXPENSE',
        category: 'Entertainment',
        date: new Date('2026-02-14'),
        notes: 'Weekend outing',
        userId: admin.id,
      },
      {
        amount: 12000,
        type: 'INCOME',
        category: 'Freelance',
        date: new Date('2026-02-20'),
        notes: 'Freelance project payment',
        userId: admin.id,
      },
      {
        amount: 50000,
        type: 'INCOME',
        category: 'Salary',
        date: new Date('2026-03-01'),
        notes: 'Monthly salary',
        userId: admin.id,
      },
      {
        amount: 15000,
        type: 'EXPENSE',
        category: 'Rent',
        date: new Date('2026-03-05'),
        notes: 'Monthly rent',
        userId: admin.id,
      },
      {
        amount: 4500,
        type: 'EXPENSE',
        category: 'Groceries',
        date: new Date('2026-03-12'),
        notes: 'Monthly groceries',
        userId: admin.id,
      },
    ],
    skipDuplicates: false,
  })

  console.log('✅ Seed complete — 3 demo users and 12 sample transactions created')
  console.log('')
  console.log('Demo Credentials:')
  console.log('  Admin   → admin@demo.com   / Admin@123')
  console.log('  Analyst → analyst@demo.com / Analyst@123')
  console.log('  Viewer  → viewer@demo.com  / Viewer@123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
