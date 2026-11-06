import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, FileSearch } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useApp, useChartColors } from '../context/AppContext'
import { Button, Card, CardHeader, EmptyState, MockNotice } from '../components/ui'
import { tooltipStyle } from '../components/charts'
import { cx, dateTime, money, pct } from '../utils/format'

export default function PredictionResult() {
  const { id } = useParams()
  const { predictions, customers } = useApp()
  const navigate = useNavigate()
  const c = useChartColors()
  const p = predictions.find((x) => x.id === id)
  const cust = customers.find((x) => x.id === p?.customerId)

  if (!p || !cust) return <Card><EmptyState icon={<FileSearch className="h-5 w-5" />} title="Prediction not found" text="It may have been removed, or the link is wrong. Check your prediction history." action={<Button onClick={() => navigate('/history')}>Go to history</Button>} /></Card>

  const bad = p.outcome === 'Delinquent'
  const i = p.input
  const util = i.creditLimit ? i.currentBalance / i.creditLimit : 0
  const dti = i.monthlyIncome ? i.monthlyDebtPayments / i.monthlyIncome : 0
  const chart = p.factors.slice(0, 7).map((f) => ({ ...f, abs: f.impact }))

  return (
    <>
      <Link to="/history" className="no-print mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"><ArrowLeft className="h-4 w-4" />Prediction history</Link>
      <div className="mb-6"><MockNotice>This outcome comes from a placeholder formula, not a trained model. Do not use it for real decisions.</MockNotice></div>

      <Card className={cx('mb-6 border-l-4', bad ? 'border-l-risk' : 'border-l-safe')}>
        <div className="flex flex-wrap items-center justify-between gap-6 p-6">
          <div>
            <p className="text-sm text-muted">Predicted outcome for {cust.name}</p>
            <p className={cx('mt-1 text-4xl font-semibold tracking-tight', bad ? 'text-risk' : 'text-safe')}>{p.outcome}</p>
            <p className="mt-2 text-sm text-muted">{p.id} · {dateTime(p.createdAt)}</p>
          </div>
          <div className="w-full sm:w-64">
            <div className="flex justify-between text-sm"><span className="text-muted">Delinquency probability</span><span className="font-semibold">{pct(p.probability)}</span></div>
            <div className="relative mt-2 h-2 rounded-full bg-line"><div className={cx('h-full rounded-full', bad ? 'bg-risk' : 'bg-safe')} style={{ width: `${p.probability * 100}%` }} /><span className="absolute -top-1 h-4 w-px bg-ink" style={{ left: '50%' }} title="50% decision threshold" /></div>
            <p className="mt-1.5 text-xs text-muted">Marked Delinquent at 50% or above.</p>
          </div>
        </div>
      </Card>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Customer" action={<Button className="!py-1" onClick={() => navigate('/customers')}>Open customers</Button>} />
          <dl className="grid gap-x-6 gap-y-3 p-5 text-sm sm:grid-cols-2">
            {[['Name', cust.name], ['ID', cust.id], ['Product', cust.product], ['Age', String(cust.age)], ['Employment', cust.employment], ['Annual income', money(cust.annualIncome)]].map(([k, v]) => <div key={k}><dt className="text-xs text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>)}
          </dl>
        </Card>
        <Card>
          <CardHeader title="Submitted details" />
          <dl className="grid gap-x-6 gap-y-3 p-5 text-sm sm:grid-cols-2">
            {[['Credit limit', money(i.creditLimit)], ['Current balance', money(i.currentBalance)], ['Utilization', pct(util, 0)], ['Debt-to-income', pct(dti, 0)], ['Late 30–59 / 60–89 / 90+', `${i.late30to59} / ${i.late60to89} / ${i.late90Plus}`], ['Open lines · Dependents', `${i.openCreditLines} · ${i.dependents}`]].map(([k, v]) => <div key={k}><dt className="text-xs text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>)}
          </dl>
        </Card>
      </div>

      <Card>
        <CardHeader title="Factors behind this result" sub="Bars to the right raised the risk; bars to the left lowered it. Placeholder weights, not model explanations." />
        <div className="h-72 p-4">
          <ResponsiveContainer>
            <BarChart data={chart} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid stroke={c.grid} horizontal={false} />
              <XAxis type="number" tick={{ fill: c.text, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="feature" width={140} tick={{ fill: c.text, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle(c)} cursor={{ fill: c.grid, opacity: 0.4 }} formatter={(v: number) => [v > 0 ? `+${v}` : v, 'Impact']} />
              <Bar dataKey="impact" radius={2}>{chart.map((f) => <Cell key={f.feature} fill={f.impact >= 0 ? c.risk : c.safe} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <div className="no-print mt-6 flex gap-2"><Button variant="primary" onClick={() => navigate(`/predictions/new?customer=${cust.id}`)}>Run another for {cust.name.split(' ')[0]}</Button><Button onClick={() => window.print()}>Print or save as PDF</Button></div>
    </>
  )
}
