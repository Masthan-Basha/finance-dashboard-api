import { z } from 'zod'

export const createTransactionSchema = z.object({
  amount:   z.number().positive('Amount must be a positive number'),
  type:     z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1, 'Category is required'),
  date:     z.string().datetime({ message: 'Invalid date format. Use ISO 8601.' }),
  notes:    z.string().optional(),
})

export const updateTransactionSchema = z.object({
  amount:   z.number().positive().optional(),
  type:     z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().min(1).optional(),
  date:     z.string().datetime().optional(),
  notes:    z.string().optional(),
})

export const filterTransactionSchema = z.object({
  page:      z.coerce.number().int().positive().default(1),
  limit:     z.coerce.number().int().positive().max(100).default(10),
  type:      z.enum(['INCOME', 'EXPENSE']).optional(),
  category:  z.string().optional(),
  startDate: z.string().optional(),
  endDate:   z.string().optional(),
  search:    z.string().optional(),
})
