import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useApp, useChartColors } from '../context/AppContext';
import { Button, Card, CardHeader, MockNotice, OutcomeBadge, PageHeader, Skeleton } from '../components/ui';
import { OutcomeDonut, tooltipStyle } from '../components/charts';
import { monthlyTrend, summarize } from '../utils/stats';
import { dateShort, pct } from '../utils/format';
export default function Dashboard() {
    const { customers, predictions } = useApp();
    const c = useChartColors();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    useEffect(() => { const t = setTimeout(() => setLoading(false), 500); return () => clearTimeout(t); }, []);
    const s = summarize(predictions);
    const trend = monthlyTrend(predictions);
    const recent = predictions.slice(0, 6);
    const name = (id) => customers.find((x) => x.id === id)?.name ?? 'Unknown';
    return (<>
      <PageHeader title="Dashboard" sub="Portfolio overview across all predictions run so far." action={<Button variant="primary" icon={<Sparkles className="h-4 w-4"/>} onClick={() => navigate('/predictions/new')}>New prediction</Button>}/>
      <div className="mb-6"><MockNotice>These figures come from generated sample records, not from a trained model.</MockNotice></div>

      <Card className="mb-6">
        {loading ? (<div className="grid gap-6 p-5 sm:grid-cols-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14"/>)}</div>) : (<div className="grid divide-line sm:grid-cols-5 sm:divide-x">
            {[
                ['Customers', customers.length.toString()],
                ['Predictions run', s.total.toString()],
                ['Delinquent', s.delinquent.toString()],
                ['Not delinquent', s.notDelinquent.toString()],
            ].map(([l, v]) => (<div key={l} className="border-b border-line px-5 py-4 sm:border-b-0">
                <p className="text-sm text-muted">{l}</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight">{v}</p>
              </div>))}
            <div className="px-5 py-4">
              <p className="text-sm text-muted">Delinquency rate</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-risk">{pct(s.rate)}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-safe/25"><div className="h-full bg-risk" style={{ width: `${s.rate * 100}%` }}/></div>
            </div>
          </div>)}
      </Card>

      <div className="mb-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title="Predictions per month" sub="Last six months, split by outcome"/>
          <div className="h-64 p-4">
            {loading ? <Skeleton className="h-full"/> : (<ResponsiveContainer>
                <BarChart data={trend}>
                  <CartesianGrid stroke={c.grid} vertical={false}/>
                  <XAxis dataKey="month" tick={{ fill: c.text, fontSize: 12 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill: c.text, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} width={28}/>
                  <Tooltip {...tooltipStyle(c)} cursor={{ fill: c.grid, opacity: 0.4 }}/>
                  <Legend iconType="square" wrapperStyle={{ fontSize: 12 }}/>
                  <Bar dataKey="Not Delinquent" stackId="a" fill={c.safe}/>
                  <Bar dataKey="Delinquent" stackId="a" fill={c.risk} radius={[3, 3, 0, 0]}/>
                </BarChart>
              </ResponsiveContainer>)}
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Outcome split" sub="All predictions"/>
          <div className="flex h-64 items-center justify-center p-4">{loading ? <Skeleton className="h-36 w-36 !rounded-full"/> : <OutcomeDonut delinquent={s.delinquent} notDelinquent={s.notDelinquent}/>}</div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent predictions" action={<Link to="/history" className="inline-flex items-center gap-1 text-sm text-brand hover:underline">View all <ArrowRight className="h-3.5 w-3.5"/></Link>}/>
        <ul className="divide-y divide-line">
          {loading ? Array.from({ length: 4 }).map((_, i) => <li key={i} className="p-4"><Skeleton className="h-5"/></li>) : recent.map((p) => (<li key={p.id}>
              <Link to={`/predictions/${p.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-bg">
                <div className="min-w-0"><p className="truncate text-sm font-medium">{name(p.customerId)}</p><p className="text-xs text-muted">{p.id} · {dateShort(p.createdAt)}</p></div>
                <div className="flex items-center gap-4"><span className="hidden text-sm text-muted sm:block">{pct(p.probability, 0)} risk</span><OutcomeBadge outcome={p.outcome}/></div>
              </Link>
            </li>))}
        </ul>
      </Card>
    </>);
}
