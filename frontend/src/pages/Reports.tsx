import { useMemo, useState } from 'react'
import { Download, FileText, Printer } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Button, Card, CardHeader, EmptyState, Field, Input, MockNotice, OutcomeBadge, PageHeader, Select } from '../components/ui'
import { dateShort, downloadCsv, money, pct } from '../utils/format'
import { summarize } from '../utils/stats'

type Kind = 'predictions' | 'delinquent' | 'customers'
const titles: Record<Kind, string> = { predictions: 'Prediction summary', delinquent: 'Delinquent customers', customers: 'Customer register' }

export default function Reports() {
  const { predictions, customers, notify } = useApp()
  const [kind, setKind] = useState<Kind>('predictions')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [product, setProduct] = useState('')
  const [generated, setGenerated] = useState<{ kind: Kind; at: string } | null>(null)

  const data = useMemo(() => {
    const cust = (id: string) => customers.find((c) => c.id === id)!
    const inRange = (iso: string) => (!from || iso.slice(0, 10) >= from) && (!to || iso.slice(0, 10) <= to)
    if (kind === 'customers') {
      const list = customers.filter((c) => !product || c.product === product)
      return { headers: ['ID', 'Name', 'Email', 'Product', 'Employment', 'Annual income', 'Registered'], rows: list.map((c) => [c.id, c.name, c.email, c.product, c.employment, money(c.annualIncome), dateShort(c.createdAt)]), preds: [] }
    }
    const list = predictions.filter((p) => inRange(p.createdAt) && (kind === 'predictions' || p.outcome === 'Delinquent') && (!product || cust(p.customerId)?.product === product))
    return { headers: ['Prediction', 'Date', 'Customer ID', 'Customer', 'Product', 'Risk', 'Outcome'], rows: list.map((p) => [p.id, dateShort(p.createdAt), p.customerId, cust(p.customerId)?.name ?? '', cust(p.customerId)?.product ?? '', pct(p.probability, 0), p.outcome]), preds: list }
  }, [kind, from, to, product, predictions, customers])

  const s = summarize(data.preds)
  const shown = generated ? data : null

  const generate = () => { setGenerated({ kind, at: new Date().toISOString() }); notify('success', `${titles[kind]} generated with ${data.rows.length} records.`) }
  const exportCsv = () => { downloadCsv(`${kind}-report.csv`, data.headers, data.rows); notify('success', 'CSV downloaded.') }

  return (
    <>
      <PageHeader title="Reports" sub="Build a report, then export it as CSV or PDF." />
      <div className="mb-6 no-print"><MockNotice>Reports include sample records only until a real database is connected.</MockNotice></div>
      <Card className="no-print mb-6">
        <CardHeader title="Report options" />
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Report type"><Select value={kind} onChange={(e) => { setKind(e.target.value as Kind); setGenerated(null) }}>{(Object.keys(titles) as Kind[]).map((k) => <option key={k} value={k}>{titles[k]}</option>)}</Select></Field>
          <Field label="From"><Input type="date" disabled={kind === 'customers'} value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
          <Field label="To"><Input type="date" disabled={kind === 'customers'} value={to} onChange={(e) => setTo(e.target.value)} /></Field>
          <Field label="Product"><Select value={product} onChange={(e) => setProduct(e.target.value)}><option value="">All products</option><option>Credit Card</option><option>Loan</option></Select></Field>
        </div>
        <div className="flex justify-end border-t border-line px-5 py-3"><Button variant="primary" icon={<FileText className="h-4 w-4" />} onClick={generate}>Generate report</Button></div>
      </Card>

      <Card>
        {!shown ? <EmptyState icon={<FileText className="h-5 w-5" />} title="No report yet" text="Choose a report type and filters above, then select Generate report." /> : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
              <div><h2 className="font-semibold">{titles[generated!.kind]}</h2><p className="text-xs text-muted">Generated {dateShort(generated!.at)} · {data.rows.length} records{generated!.kind !== 'customers' && ` · ${pct(s.rate)} delinquent`}</p></div>
              <div className="no-print flex gap-2"><Button icon={<Download className="h-4 w-4" />} onClick={exportCsv} disabled={!data.rows.length}>Export CSV</Button><Button icon={<Printer className="h-4 w-4" />} onClick={() => window.print()} disabled={!data.rows.length}>Export PDF</Button></div>
            </div>
            {data.rows.length === 0 ? <EmptyState icon={<FileText className="h-5 w-5" />} title="No records in this report" text="Widen the date range or remove the product filter." /> : (
              <div className="overflow-x-auto"><table className="w-full text-left text-sm">
                <thead className="border-b border-line text-xs text-muted"><tr>{data.headers.map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-line">{data.rows.slice(0, 50).map((r, i) => <tr key={i}>{r.map((v, j) => <td key={j} className="px-4 py-2.5">{v === 'Delinquent' || v === 'Not Delinquent' ? <OutcomeBadge outcome={v} /> : v}</td>)}</tr>)}</tbody>
              </table></div>
            )}
            {data.rows.length > 50 && <p className="border-t border-line px-5 py-3 text-xs text-muted">Showing the first 50 of {data.rows.length} rows. The CSV export contains all of them.</p>}
          </>
        )}
      </Card>
    </>
  )
}
