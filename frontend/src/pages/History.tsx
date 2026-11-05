import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { History as HistoryIcon, Search } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Badge, Button, Card, EmptyState, Input, OutcomeBadge, PageHeader, Pagination, Select } from '../components/ui'
import { dateTime, pct } from '../utils/format'

export default function History() {
  const { predictions, customers } = useApp()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [outcome, setOutcome] = useState('')
  const [product, setProduct] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)

  const rows = useMemo(() => predictions.map((p) => ({ p, c: customers.find((x) => x.id === p.customerId)! })).filter(({ p, c }) =>
    c && (!q || `${c.name} ${c.id} ${p.id}`.toLowerCase().includes(q.toLowerCase())) && (!outcome || p.outcome === outcome) && (!product || c.product === product) &&
    (!from || p.createdAt.slice(0, 10) >= from) && (!to || p.createdAt.slice(0, 10) <= to)), [predictions, customers, q, outcome, product, from, to])
  const per = 10
  const pages = Math.max(1, Math.ceil(rows.length / per))
  const view = rows.slice((page - 1) * per, page * per)
  const reset = () => { setQ(''); setOutcome(''); setProduct(''); setFrom(''); setTo(''); setPage(1) }
  const on = (fn: (v: string) => void) => (e: { target: { value: string } }) => { fn(e.target.value); setPage(1) }

  return (
    <>
      <PageHeader title="Prediction history" sub={`${rows.length} of ${predictions.length} predictions`} />
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <div className="relative min-w-[14rem] flex-1"><Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted" /><Input className="pl-9" placeholder="Search customer, customer ID or prediction ID" value={q} onChange={on(setQ)} aria-label="Search predictions" /></div>
          <Select className="!w-auto" value={outcome} onChange={on(setOutcome)} aria-label="Filter by outcome"><option value="">All outcomes</option><option>Delinquent</option><option>Not Delinquent</option></Select>
          <Select className="!w-auto" value={product} onChange={on(setProduct)} aria-label="Filter by product"><option value="">All products</option><option>Credit Card</option><option>Loan</option></Select>
          <Input type="date" className="!w-auto" value={from} onChange={on(setFrom)} aria-label="From date" />
          <Input type="date" className="!w-auto" value={to} onChange={on(setTo)} aria-label="To date" />
        </div>
        {view.length === 0 ? (
          <EmptyState icon={<HistoryIcon className="h-5 w-5" />} title="No predictions match" text="Adjust your filters, or run a new prediction." action={<div className="flex gap-2"><Button onClick={reset}>Clear filters</Button><Button variant="primary" onClick={() => navigate('/predictions/new')}>New prediction</Button></div>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-xs text-muted"><tr><th className="px-5 py-3 font-medium">Date</th><th className="px-3 py-3 font-medium">Customer</th><th className="hidden px-3 py-3 font-medium sm:table-cell">Product</th><th className="px-3 py-3 text-right font-medium">Risk</th><th className="px-5 py-3 font-medium">Outcome</th></tr></thead>
              <tbody className="divide-y divide-line">
                {view.map(({ p, c }) => (
                  <tr key={p.id} tabIndex={0} onClick={() => navigate(`/predictions/${p.id}`)} onKeyDown={(e) => e.key === 'Enter' && navigate(`/predictions/${p.id}`)} className="cursor-pointer hover:bg-bg">
                    <td className="whitespace-nowrap px-5 py-3 text-muted">{dateTime(p.createdAt)}</td>
                    <td className="px-3 py-3"><p className="font-medium">{c.name}</p><p className="text-xs text-muted">{c.id} · {p.id}</p></td>
                    <td className="hidden px-3 py-3 sm:table-cell"><Badge tone="brand">{c.product}</Badge></td>
                    <td className="px-3 py-3 text-right">{pct(p.probability, 0)}</td>
                    <td className="px-5 py-3"><OutcomeBadge outcome={p.outcome} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pages={pages} onChange={setPage} />
      </Card>
    </>
  )
}
