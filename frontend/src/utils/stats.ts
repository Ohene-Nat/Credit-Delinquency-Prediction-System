import type { Prediction } from '../types'

export function summarize(preds: Prediction[]) {
  const delinquent = preds.filter((p) => p.outcome === 'Delinquent').length
  return { total: preds.length, delinquent, notDelinquent: preds.length - delinquent, rate: preds.length ? delinquent / preds.length : 0 }
}

export function monthlyTrend(preds: Prediction[], months = 6) {
  const now = new Date('2026-11-02T12:00:00Z')
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1)
    const inMonth = preds.filter((p) => { const x = new Date(p.createdAt); return x.getFullYear() === d.getFullYear() && x.getMonth() === d.getMonth() })
    const delinquent = inMonth.filter((p) => p.outcome === 'Delinquent').length
    return { month: d.toLocaleDateString('en-US', { month: 'short' }), Delinquent: delinquent, 'Not Delinquent': inMonth.length - delinquent, rate: inMonth.length ? Math.round((delinquent / inMonth.length) * 100) : 0 }
  })
}
