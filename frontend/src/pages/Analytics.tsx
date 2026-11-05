import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart, Legend } from 'recharts'
import { useApp, useChartColors } from '../context/AppContext'
import { Card, CardHeader, MockNotice, PageHeader } from '../components/ui'
import { OutcomeDonut, tooltipStyle } from '../components/charts'
import { monthlyTrend, summarize } from '../utils/stats'
import { sampleModelStats as m } from '../data/mock'
import { pct } from '../utils/format'

export default function Analytics() {
  const { predictions } = useApp()
  const c = useChartColors()
  const s = summarize(predictions)
  const trend = monthlyTrend(predictions)
  const axis = { tick: { fill: c.text, fontSize: 12 }, axisLine: false, tickLine: false } as const
  const cm = m.confusion

  return (
    <>
      <PageHeader title="Analytics" sub="Prediction patterns and model quality." />
      <div className="mb-6"><MockNotice>Model performance and feature importance below are sample values for layout only. They will be replaced with measured results after training in a later phase.</MockNotice></div>

      <div className="mb-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2"><CardHeader title="Delinquency distribution" sub="Share of all predictions" /><div className="flex h-60 items-center justify-center p-4"><OutcomeDonut delinquent={s.delinquent} notDelinquent={s.notDelinquent} /></div></Card>
        <Card className="lg:col-span-3">
          <CardHeader title="Delinquency rate trend" sub="Percent of each month’s predictions marked Delinquent" />
          <div className="h-60 p-4">
            <ResponsiveContainer><LineChart data={trend}><CartesianGrid stroke={c.grid} vertical={false} /><XAxis dataKey="month" {...axis} /><YAxis {...axis} unit="%" width={36} /><Tooltip {...tooltipStyle(c)} formatter={(v: number) => [`${v}%`, 'Delinquency rate']} /><Line type="monotone" dataKey="rate" stroke={c.risk} strokeWidth={2} dot={{ r: 3, fill: c.risk }} /></LineChart></ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader title="Model performance" sub="Sample values on a held-out test set" />
        <div className="grid divide-line sm:grid-cols-5 sm:divide-x">
          {([['Accuracy', m.accuracy], ['Precision', m.precision], ['Recall', m.recall], ['F1 score', m.f1], ['ROC-AUC', m.rocAuc]] as const).map(([l, v]) => (
            <div key={l} className="border-b border-line px-5 py-4 sm:border-b-0"><p className="text-sm text-muted">{l}</p><p className="mt-1 text-2xl font-semibold">{pct(v)}</p></div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Confusion matrix" sub="Sample counts" />
          <div className="p-5">
            <div className="grid grid-cols-[auto_1fr_1fr] gap-2 text-center text-sm">
              <div /><div className="text-xs text-muted">Predicted Not Delinquent</div><div className="text-xs text-muted">Predicted Delinquent</div>
              <div className="self-center text-left text-xs text-muted">Actually Not Delinquent</div>
              <div className="rounded-md bg-safe/15 p-4"><p className="text-2xl font-semibold">{cm.tn.toLocaleString()}</p><p className="text-xs text-muted">Correct</p></div>
              <div className="rounded-md bg-risk/10 p-4"><p className="text-2xl font-semibold">{cm.fp.toLocaleString()}</p><p className="text-xs text-muted">False alarm</p></div>
              <div className="self-center text-left text-xs text-muted">Actually Delinquent</div>
              <div className="rounded-md bg-risk/10 p-4"><p className="text-2xl font-semibold">{cm.fn.toLocaleString()}</p><p className="text-xs text-muted">Missed</p></div>
              <div className="rounded-md bg-safe/15 p-4"><p className="text-2xl font-semibold">{cm.tp.toLocaleString()}</p><p className="text-xs text-muted">Correct</p></div>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Most important features" sub="Sample share of model decisions" />
          <div className="h-72 p-4">
            <ResponsiveContainer><BarChart data={m.featureImportance} layout="vertical" margin={{ left: 20 }}><CartesianGrid stroke={c.grid} horizontal={false} /><XAxis type="number" {...axis} tickFormatter={(v) => `${Math.round(v * 100)}%`} /><YAxis type="category" dataKey="feature" width={140} {...axis} /><Tooltip {...tooltipStyle(c)} formatter={(v: number) => [pct(v, 0), 'Importance']} cursor={{ fill: c.grid, opacity: 0.4 }} /><Legend wrapperStyle={{ display: 'none' }} /><Bar dataKey="value" fill={c.brand} radius={2} /></BarChart></ResponsiveContainer>
          </div>
        </Card>
      </div>
    </>
  )
}
