import { describe, it, expect } from 'vitest'

// ── Pure logic unit tests (no DB needed) ──────────────────────────────────────

describe('Dashboard Summary Calculations', () => {
  function calcSummary(totals) {
    const incomeData  = totals.find((t) => t.type === 'INCOME')
    const expenseData = totals.find((t) => t.type === 'EXPENSE')
    const totalIncome   = Number(incomeData?._sum?.amount  ?? 0)
    const totalExpenses = Number(expenseData?._sum?.amount ?? 0)
    return { totalIncome, totalExpenses, netBalance: totalIncome - totalExpenses }
  }

  it('calculates net balance correctly when income > expenses', () => {
    const totals = [
      { type: 'INCOME',  _sum: { amount: 50000 }, _count: { id: 5 } },
      { type: 'EXPENSE', _sum: { amount: 20000 }, _count: { id: 3 } },
    ]
    const result = calcSummary(totals)
    expect(result.totalIncome).toBe(50000)
    expect(result.totalExpenses).toBe(20000)
    expect(result.netBalance).toBe(30000)
  })

  it('calculates negative net balance when expenses > income', () => {
    const totals = [
      { type: 'INCOME',  _sum: { amount: 10000 }, _count: { id: 1 } },
      { type: 'EXPENSE', _sum: { amount: 30000 }, _count: { id: 4 } },
    ]
    const result = calcSummary(totals)
    expect(result.netBalance).toBe(-20000)
  })

  it('handles missing income gracefully', () => {
    const totals = [
      { type: 'EXPENSE', _sum: { amount: 5000 }, _count: { id: 2 } },
    ]
    const result = calcSummary(totals)
    expect(result.totalIncome).toBe(0)
    expect(result.netBalance).toBe(-5000)
  })

  it('handles empty totals gracefully', () => {
    const result = calcSummary([])
    expect(result.totalIncome).toBe(0)
    expect(result.totalExpenses).toBe(0)
    expect(result.netBalance).toBe(0)
  })
})

describe('Monthly Trends Processing', () => {
  function processMonthlyTrends(rows) {
    const monthMap = {}
    for (const row of rows) {
      if (!monthMap[row.month]) {
        monthMap[row.month] = { month: row.month, income: 0, expenses: 0 }
      }
      if (row.type === 'INCOME')  monthMap[row.month].income   = Number(row.total)
      if (row.type === 'EXPENSE') monthMap[row.month].expenses = Number(row.total)
    }
    return Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month))
  }

  it('merges income and expense rows for the same month', () => {
    const rows = [
      { month: '2026-01', type: 'INCOME',  total: 50000 },
      { month: '2026-01', type: 'EXPENSE', total: 20000 },
    ]
    const result = processMonthlyTrends(rows)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ month: '2026-01', income: 50000, expenses: 20000 })
  })

  it('sorts months in ascending order', () => {
    const rows = [
      { month: '2026-03', type: 'INCOME', total: 3000 },
      { month: '2026-01', type: 'INCOME', total: 1000 },
      { month: '2026-02', type: 'INCOME', total: 2000 },
    ]
    const result = processMonthlyTrends(rows)
    expect(result.map((r) => r.month)).toEqual(['2026-01', '2026-02', '2026-03'])
  })

  it('defaults missing expense to 0', () => {
    const rows = [{ month: '2026-01', type: 'INCOME', total: 5000 }]
    const result = processMonthlyTrends(rows)
    expect(result[0].expenses).toBe(0)
  })
})

describe('Role Authorization Logic', () => {
  const ROLES = { VIEWER: 'VIEWER', ANALYST: 'ANALYST', ADMIN: 'ADMIN' }

  function canAccess(userRole, allowedRoles) {
    return allowedRoles.includes(userRole)
  }

  it('allows ADMIN to perform admin-only actions', () => {
    expect(canAccess(ROLES.ADMIN, ['ADMIN'])).toBe(true)
  })

  it('blocks VIEWER from admin-only actions', () => {
    expect(canAccess(ROLES.VIEWER, ['ADMIN'])).toBe(false)
  })

  it('blocks ANALYST from admin-only actions', () => {
    expect(canAccess(ROLES.ANALYST, ['ADMIN'])).toBe(false)
  })

  it('allows ANALYST and ADMIN to access analyst routes', () => {
    expect(canAccess(ROLES.ANALYST, ['ADMIN', 'ANALYST'])).toBe(true)
    expect(canAccess(ROLES.ADMIN,   ['ADMIN', 'ANALYST'])).toBe(true)
    expect(canAccess(ROLES.VIEWER,  ['ADMIN', 'ANALYST'])).toBe(false)
  })

  it('allows all roles to view dashboard', () => {
    const allRoles = ['ADMIN', 'ANALYST', 'VIEWER']
    expect(canAccess(ROLES.ADMIN,   allRoles)).toBe(true)
    expect(canAccess(ROLES.ANALYST, allRoles)).toBe(true)
    expect(canAccess(ROLES.VIEWER,  allRoles)).toBe(true)
  })
})
