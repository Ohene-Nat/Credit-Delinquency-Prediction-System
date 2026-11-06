import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Button, Card, CardHeader, ErrorBanner, Field, Input, MockNotice, PageHeader, Select } from '../components/ui'
import type { FinancialInput } from '../types'
import { money } from '../utils/format'

type Key = keyof FinancialInput
const fields: { key: Key; label: string; hint: string; min: number; max?: number; int?: boolean }[] = [
  { key: 'creditLimit', label: 'Credit limit (USD)', hint: 'Total approved limit', min: 1 },
  { key: 'currentBalance', label: 'Current balance (USD)', hint: 'Amount owed today', min: 0 },
  { key: 'monthlyIncome', label: 'Monthly income (USD)', hint: 'Before tax', min: 0 },
  { key: 'monthlyDebtPayments', label: 'Monthly debt payments (USD)', hint: 'All loans and cards combined', min: 0 },
  { key: 'openCreditLines', label: 'Open credit lines', hint: '0 to 50', min: 0, max: 50, int: true },
  { key: 'late30to59', label: 'Times 30–59 days late', hint: 'Past 2 years', min: 0, max: 30, int: true },
  { key: 'late60to89', label: 'Times 60–89 days late', hint: 'Past 2 years', min: 0, max: 30, int: true },
  { key: 'late90Plus', label: 'Times 90+ days late', hint: 'Past 2 years', min: 0, max: 30, int: true },
  { key: 'dependents', label: 'Dependents', hint: '0 to 15', min: 0, max: 15, int: true },
  { key: 'accountAgeMonths', label: 'Account age (months)', hint: 'Months since account opened', min: 0, max: 600, int: true },
]

export default function NewPrediction() {
  const { customers, runPrediction, notify } = useApp()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [customerId, setCustomerId] = useState(params.get('customer') ?? '')
  const [values, setValues] = useState<Record<Key, string>>(() => {
    const c = customers.find((x) => x.id === params.get('customer'))
    return Object.fromEntries(fields.map((f) => [f.key, f.key === 'monthlyIncome' && c ? String(Math.round(c.annualIncome / 12)) : ''])) as Record<Key, string>
  })
  const [errors, setErrors] = useState<Partial<Record<Key | 'customer', string>>>({})
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState('')

  const customer = customers.find((c) => c.id === customerId)

  const pickCustomer = (id: string) => {
    setCustomerId(id)
    const c = customers.find((x) => x.id === id)
    if (c && !values.monthlyIncome) setValues((v) => ({ ...v, monthlyIncome: String(Math.round(c.annualIncome / 12)) }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFailed('')
    const er: typeof errors = {}
    if (!customerId) er.customer = 'Choose a customer first.'
    fields.forEach((f) => {
      const raw = values[f.key]; const n = Number(raw)
      if (raw === '' || Number.isNaN(n)) er[f.key] = 'Required.'
      else if (n < f.min) er[f.key] = `Must be ${f.min} or more.`
      else if (f.max !== undefined && n > f.max) er[f.key] = `Must be ${f.max} or less.`
      else if (f.int && !Number.isInteger(n)) er[f.key] = 'Enter a whole number.'
    })
    setErrors(er)
    if (Object.keys(er).length) return
    setLoading(true)
    try {
      const input = Object.fromEntries(fields.map((f) => [f.key, Number(values[f.key])])) as unknown as FinancialInput
      const p = await runPrediction(customerId, input)
      notify('success', `Prediction ${p.id} complete.`)
      navigate(`/predictions/${p.id}`)
    } catch (err) {
      setFailed(err instanceof Error ? err.message : 'Something went wrong. Try again.')
      setLoading(false)
    }
  }

  const util = Number(values.creditLimit) > 0 && values.currentBalance !== '' ? Number(values.currentBalance) / Number(values.creditLimit) : null

  return (
    <>
      <PageHeader title="New prediction" sub="Select a customer and enter their current financial details." />
      <div className="mb-6"><MockNotice>Submitting runs a placeholder calculation. Results will come from the trained model once it is connected.</MockNotice></div>
      <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {failed && <ErrorBanner>{failed}</ErrorBanner>}
          <Card>
            <CardHeader title="Customer" />
            <div className="p-5">
              <Field label="Select customer" error={errors.customer}>
                <Select value={customerId} onChange={(e) => pickCustomer(e.target.value)} className={errors.customer ? 'border-risk' : ''}>
                  <option value="">Choose a customer…</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.id})</option>)}
                </Select>
              </Field>
            </div>
          </Card>
          <Card>
            <CardHeader title="Financial information" sub="All fields are required." />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              {fields.map((f) => (
                <Field key={f.key} label={f.label} hint={f.hint} error={errors[f.key]}>
                  <Input type="number" inputMode="decimal" min={f.min} max={f.max} step={f.int ? 1 : 'any'} invalid={!!errors[f.key]} value={values[f.key]} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} />
                </Field>
              ))}
            </div>
          </Card>
        </div>
        <aside className="space-y-6">
          <Card className="lg:sticky lg:top-20">
            <CardHeader title="Summary" />
            <div className="space-y-3 p-5 text-sm">
              {customer ? (
                <>
                  <div><p className="font-medium">{customer.name}</p><p className="text-xs text-muted">{customer.id} · {customer.product} · Age {customer.age}</p></div>
                  <p className="text-muted">{customer.employment}, income {money(customer.annualIncome)} per year</p>
                </>
              ) : <p className="text-muted">No customer selected.</p>}
              <div className="border-t border-line pt-3"><p className="text-xs text-muted">Credit utilization</p><p className="text-xl font-semibold">{util === null ? '—' : `${(util * 100).toFixed(0)}%`}</p></div>
              <Button type="submit" variant="primary" loading={loading} icon={<Sparkles className="h-4 w-4" />} className="w-full">{loading ? 'Running prediction' : 'Run prediction'}</Button>
              {loading && <p className="text-center text-xs text-muted">This usually takes a couple of seconds.</p>}
            </div>
          </Card>
        </aside>
      </form>
    </>
  )
}
