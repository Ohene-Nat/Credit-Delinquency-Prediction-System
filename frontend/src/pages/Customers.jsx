import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Plus, Search, Sparkles, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge, Button, Card, EmptyState, Field, Input, Modal, OutcomeBadge, PageHeader, Pagination, Select } from '../components/ui';
import { dateShort, initials, money } from '../utils/format';
const EMPLOYMENT = ['Employed', 'Self-employed', 'Unemployed', 'Retired', 'Student'];
const blank = { name: '', email: '', phone: '', age: '', city: '', employment: 'Employed', annualIncome: '', product: 'Credit Card' };
function CustomerForm({ initial, onSave, onCancel }) {
    const [d, setD] = useState(initial ? { ...initial, age: String(initial.age), annualIncome: String(initial.annualIncome) } : blank);
    const [errors, setErrors] = useState({});
    const set = (k, v) => setD((x) => ({ ...x, [k]: v }));
    const submit = (e) => {
        e.preventDefault();
        const er = {};
        if (d.name.trim().length < 2)
            er.name = 'Enter the customer’s full name.';
        if (!/^\S+@\S+\.\S+$/.test(d.email))
            er.email = 'Enter a valid email address.';
        if (d.phone.replace(/\D/g, '').length < 9)
            er.phone = 'Enter a phone number with at least 9 digits.';
        const age = Number(d.age);
        if (!Number.isInteger(age) || age < 18 || age > 100)
            er.age = 'Age must be between 18 and 100.';
        if (!d.city.trim())
            er.city = 'Enter a city.';
        const inc = Number(d.annualIncome);
        if (!(inc >= 0) || d.annualIncome === '')
            er.annualIncome = 'Enter annual income of 0 or more.';
        setErrors(er);
        if (Object.keys(er).length)
            return;
        onSave({ ...d, name: d.name.trim(), city: d.city.trim(), age, annualIncome: inc });
    };
    return (<form onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><Field label="Full name" error={errors.name}><Input invalid={!!errors.name} value={d.name} onChange={(e) => set('name', e.target.value)}/></Field></div>
        <Field label="Email" error={errors.email}><Input type="email" invalid={!!errors.email} value={d.email} onChange={(e) => set('email', e.target.value)}/></Field>
        <Field label="Phone" error={errors.phone}><Input invalid={!!errors.phone} value={d.phone} onChange={(e) => set('phone', e.target.value)}/></Field>
        <Field label="Age" error={errors.age}><Input type="number" invalid={!!errors.age} value={d.age} onChange={(e) => set('age', e.target.value)}/></Field>
        <Field label="City" error={errors.city}><Input invalid={!!errors.city} value={d.city} onChange={(e) => set('city', e.target.value)}/></Field>
        <Field label="Employment status"><Select value={d.employment} onChange={(e) => set('employment', e.target.value)}>{EMPLOYMENT.map((x) => <option key={x}>{x}</option>)}</Select></Field>
        <Field label="Annual income (USD)" error={errors.annualIncome}><Input type="number" min={0} invalid={!!errors.annualIncome} value={d.annualIncome} onChange={(e) => set('annualIncome', e.target.value)}/></Field>
        <Field label="Product" hint="Credit cards are the primary focus; loans use the same fields for now."><Select value={d.product} onChange={(e) => set('product', e.target.value)}><option>Credit Card</option><option>Loan</option></Select></Field>
      </div>
      <div className="flex justify-end gap-2 pt-2"><Button type="button" onClick={onCancel}>Cancel</Button><Button type="submit" variant="primary">{initial ? 'Save changes' : 'Add customer'}</Button></div>
    </form>);
}
export default function Customers() {
    const { customers, predictions, addCustomer, updateCustomer, notify } = useApp();
    const navigate = useNavigate();
    const [q, setQ] = useState('');
    const [product, setProduct] = useState('');
    const [employment, setEmployment] = useState('');
    const [page, setPage] = useState(1);
    const [mode, setMode] = useState(null);
    const filtered = useMemo(() => customers.filter((c) => (!q || `${c.name} ${c.email} ${c.id} ${c.city}`.toLowerCase().includes(q.toLowerCase())) && (!product || c.product === product) && (!employment || c.employment === employment)), [customers, q, product, employment]);
    const per = 8;
    const pages = Math.max(1, Math.ceil(filtered.length / per));
    const rows = filtered.slice((page - 1) * per, page * per);
    const lastOutcome = (id) => predictions.find((p) => p.customerId === id);
    const view = mode?.type === 'view' ? mode.c : null;
    const viewPreds = view ? predictions.filter((p) => p.customerId === view.id) : [];
    return (<>
      <PageHeader title="Customers" sub={`${customers.length} registered customers`} action={<Button variant="primary" icon={<Plus className="h-4 w-4"/>} onClick={() => setMode({ type: 'add' })}>Add customer</Button>}/>
      <Card>
        <div className="flex flex-wrap gap-3 border-b border-line p-4">
          <div className="relative min-w-[14rem] flex-1"><Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted"/><Input className="pl-9" placeholder="Search by name, email, ID or city" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} aria-label="Search customers"/></div>
          <Select className="!w-auto" value={product} onChange={(e) => { setProduct(e.target.value); setPage(1); }} aria-label="Filter by product"><option value="">All products</option><option>Credit Card</option><option>Loan</option></Select>
          <Select className="!w-auto" value={employment} onChange={(e) => { setEmployment(e.target.value); setPage(1); }} aria-label="Filter by employment"><option value="">All employment</option>{EMPLOYMENT.map((x) => <option key={x}>{x}</option>)}</Select>
        </div>
        {rows.length === 0 ? (<EmptyState icon={<Users className="h-5 w-5"/>} title="No customers found" text="Try a different search or clear the filters, or add a new customer." action={<Button onClick={() => { setQ(''); setProduct(''); setEmployment(''); }}>Clear filters</Button>}/>) : (<div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-xs text-muted"><tr><th className="px-5 py-3 font-medium">Customer</th><th className="px-3 py-3 font-medium">Product</th><th className="hidden px-3 py-3 font-medium md:table-cell">Employment</th><th className="hidden px-3 py-3 text-right font-medium md:table-cell">Annual income</th><th className="px-3 py-3 font-medium">Latest outcome</th><th className="px-5 py-3 text-right font-medium">Actions</th></tr></thead>
              <tbody className="divide-y divide-line">
                {rows.map((c) => {
                const lp = lastOutcome(c.id);
                return (<tr key={c.id} className="hover:bg-bg">
                    <td className="px-5 py-3"><div className="flex items-center gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand/10 text-xs font-semibold text-brand">{initials(c.name)}</span><div className="min-w-0"><p className="truncate font-medium">{c.name}</p><p className="truncate text-xs text-muted">{c.id} · {c.email}</p></div></div></td>
                    <td className="px-3 py-3"><Badge tone="brand">{c.product}</Badge></td>
                    <td className="hidden px-3 py-3 text-muted md:table-cell">{c.employment}</td>
                    <td className="hidden px-3 py-3 text-right md:table-cell">{money(c.annualIncome)}</td>
                    <td className="px-3 py-3">{lp ? <OutcomeBadge outcome={lp.outcome}/> : <span className="text-muted">Not assessed</span>}</td>
                    <td className="px-5 py-3"><div className="flex justify-end gap-1">
                      <button className="rounded p-1.5 text-muted hover:bg-line/50" aria-label={`View ${c.name}`} onClick={() => setMode({ type: 'view', c })}><Eye className="h-4 w-4"/></button>
                      <button className="rounded p-1.5 text-muted hover:bg-line/50" aria-label={`Edit ${c.name}`} onClick={() => setMode({ type: 'edit', c })}><Pencil className="h-4 w-4"/></button>
                      <button className="rounded p-1.5 text-brand hover:bg-brand/10" aria-label={`New prediction for ${c.name}`} onClick={() => navigate(`/predictions/new?customer=${c.id}`)}><Sparkles className="h-4 w-4"/></button>
                    </div></td>
                  </tr>);
            })}
              </tbody>
            </table>
          </div>)}
        <Pagination page={page} pages={pages} onChange={setPage}/>
      </Card>

      <Modal open={mode?.type === 'add'} onClose={() => setMode(null)} title="Add customer" wide>
        <CustomerForm onCancel={() => setMode(null)} onSave={(d) => { const n = addCustomer(d); setMode(null); notify('success', `${n.name} added as ${n.id}.`); }}/>
      </Modal>
      <Modal open={mode?.type === 'edit'} onClose={() => setMode(null)} title="Edit customer" wide>
        {mode?.type === 'edit' && <CustomerForm initial={mode.c} onCancel={() => setMode(null)} onSave={(d) => { updateCustomer({ ...mode.c, ...d }); setMode(null); notify('success', `${d.name} updated.`); }}/>}
      </Modal>
      <Modal open={!!view} onClose={() => setMode(null)} title="Customer details" wide>
        {view && (<div className="space-y-5">
            <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-full bg-brand/10 font-semibold text-brand">{initials(view.name)}</span><div><p className="text-lg font-semibold">{view.name}</p><p className="text-sm text-muted">{view.id} · Registered {dateShort(view.createdAt)}</p></div></div>
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {[['Email', view.email], ['Phone', view.phone], ['Age', String(view.age)], ['City', view.city], ['Employment', view.employment], ['Annual income', money(view.annualIncome)], ['Product', view.product]].map(([k, v]) => (<div key={k}><dt className="text-xs text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>))}
            </dl>
            <div>
              <p className="mb-2 text-sm font-semibold">Prediction history ({viewPreds.length})</p>
              {viewPreds.length === 0 ? <p className="text-sm text-muted">No predictions yet for this customer.</p> : (<ul className="divide-y divide-line rounded-md border border-line">{viewPreds.slice(0, 4).map((p) => (<li key={p.id}><button onClick={() => navigate(`/predictions/${p.id}`)} className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-bg"><span className="text-muted">{p.id} · {dateShort(p.createdAt)}</span><OutcomeBadge outcome={p.outcome}/></button></li>))}</ul>)}
            </div>
            <div className="flex justify-end gap-2"><Button onClick={() => setMode({ type: 'edit', c: view })} icon={<Pencil className="h-4 w-4"/>}>Edit</Button><Button variant="primary" icon={<Sparkles className="h-4 w-4"/>} onClick={() => navigate(`/predictions/new?customer=${view.id}`)}>New prediction</Button></div>
          </div>)}
      </Modal>
    </>);
}
