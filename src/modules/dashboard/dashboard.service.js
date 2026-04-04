import prisma from '../../config/database.js'

export async function getDashboardSummary() {
  // Single optimized query using groupBy for income/expense totals
  const [totals, categoryBreakdown, monthlyTrends, recentTransactions] = await Promise.all([

    // Total income and expenses
    prisma.transaction.groupBy({
      by: ['type'],
      where: { isDeleted: false },
      _sum: { amount: true },
      _count: { id: true },
    }),

    // Category-wise breakdown
    prisma.transaction.groupBy({
      by: ['category', 'type'],
      where: { isDeleted: false },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: 'desc' } },
    }),

    // Monthly trends for last 6 months
    prisma.$queryRaw`
      SELECT
        TO_CHAR(date, 'YYYY-MM') AS month,
        type,
        SUM(amount)::float        AS total,
        COUNT(id)::int            AS count
      FROM "Transaction"
      WHERE
        "isDeleted" = false
        AND date >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(date, 'YYYY-MM'), type
      ORDER BY month ASC
    `,

    // Recent 5 transactions
    prisma.transaction.findMany({
      where: { isDeleted: false },
      orderBy: { date: 'desc' },
      take: 5,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
  ])

  // Process totals
  const incomeData  = totals.find((t) => t.type === 'INCOME')
  const expenseData = totals.find((t) => t.type === 'EXPENSE')

  const totalIncome   = Number(incomeData?._sum?.amount  ?? 0)
  const totalExpenses = Number(expenseData?._sum?.amount ?? 0)
  const netBalance    = totalIncome - totalExpenses

  // Process category breakdown
  const categories = categoryBreakdown.map((c) => ({
    category: c.category,
    type:     c.type,
    total:    Number(c._sum.amount),
    count:    c._count.id,
  }))

  // Process monthly trends into structured format
  const monthMap = {}
  for (const row of monthlyTrends) {
    if (!monthMap[row.month]) {
      monthMap[row.month] = { month: row.month, income: 0, expenses: 0 }
    }
    if (row.type === 'INCOME')  monthMap[row.month].income   = Number(row.total)
    if (row.type === 'EXPENSE') monthMap[row.month].expenses = Number(row.total)
  }
  const trends = Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month))

  return {
    overview: {
      totalIncome,
      totalExpenses,
      netBalance,
      totalTransactions: (incomeData?._count?.id ?? 0) + (expenseData?._count?.id ?? 0),
    },
    categoryBreakdown: categories,
    monthlyTrends:     trends,
    recentTransactions,
  }
}

export async function getWeeklySummary() {
  const rows = await prisma.$queryRaw`
    SELECT
      TO_CHAR(date_trunc('week', date), 'YYYY-MM-DD') AS week_start,
      type,
      SUM(amount)::float AS total,
      COUNT(id)::int     AS count
    FROM "Transaction"
    WHERE
      "isDeleted" = false
      AND date >= NOW() - INTERVAL '8 weeks'
    GROUP BY date_trunc('week', date), type
    ORDER BY week_start ASC
  `

  const weekMap = {}
  for (const row of rows) {
    if (!weekMap[row.week_start]) {
      weekMap[row.week_start] = { weekStart: row.week_start, income: 0, expenses: 0 }
    }
    if (row.type === 'INCOME')  weekMap[row.week_start].income   = Number(row.total)
    if (row.type === 'EXPENSE') weekMap[row.week_start].expenses = Number(row.total)
  }

  return Object.values(weekMap).sort((a, b) => a.weekStart.localeCompare(b.weekStart))
}
