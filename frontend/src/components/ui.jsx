import { forwardRef, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, FlaskConical, Loader2, X, XCircle } from 'lucide-react';
import { cx } from '../utils/format';
import { useApp } from '../context/AppContext';
export function Button({ variant = 'secondary', loading, icon, children, className, disabled, ...p }) {
    const v = {
        primary: 'bg-brand text-white hover:opacity-90 dark:text-bg',
        secondary: 'border border-line bg-surface hover:bg-bg',
        ghost: 'hover:bg-line/50',
        danger: 'bg-risk text-white hover:opacity-90 dark:text-bg',
    }[variant];
    return (<button {...p} disabled={disabled || loading} className={cx('inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50', v, className)}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : icon}
      {children}
    </button>);
}
export const Card = ({ children, className }) => (<section className={cx('rounded-lg border border-line bg-surface', className)}>{children}</section>);
export const CardHeader = ({ title, sub, action }) => (<div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
    <div>
      <h2 className="text-sm font-semibold">{title}</h2>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
    {action}
  </div>);
export function PageHeader({ title, sub, action }) {
    return (<div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {action}
    </div>);
}
export const inputCls = 'w-full rounded-md border border-line bg-surface px-3 py-2 text-sm placeholder:text-muted/70 disabled:opacity-60';
export const Input = forwardRef(({ invalid, className, ...p }, ref) => (<input ref={ref} {...p} className={cx(inputCls, invalid && 'border-risk', className)}/>));
export const Select = ({ className, children, ...p }) => (<select {...p} className={cx(inputCls, className)}>{children}</select>);
export function Field({ label, error, hint, children }) {
    return (<label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-risk">{error}</span> : hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>);
}
export function Badge({ tone = 'neutral', children }) {
    const t = { neutral: 'bg-line/60 text-muted', risk: 'bg-risk/10 text-risk', safe: 'bg-safe/10 text-safe', brand: 'bg-brand/10 text-brand' }[tone];
    return <span className={cx('inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium', t)}>{children}</span>;
}
export const OutcomeBadge = ({ outcome }) => (<Badge tone={outcome === 'Delinquent' ? 'risk' : 'safe'}>
    <span className={cx('h-1.5 w-1.5 rounded-full', outcome === 'Delinquent' ? 'bg-risk' : 'bg-safe')}/>
    {outcome}
  </Badge>);
export function Modal({ open, onClose, title, children, wide }) {
    useEffect(() => {
        if (!open)
            return;
        const h = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [open, onClose]);
    if (!open)
        return null;
    return (<div className="no-print fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onMouseDown={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div onMouseDown={(e) => e.stopPropagation()} className={cx('max-h-[92vh] w-full overflow-y-auto rounded-t-xl border border-line bg-surface shadow-xl sm:rounded-xl', wide ? 'sm:max-w-2xl' : 'sm:max-w-md')}>
        <div className="sticky top-0 flex items-center justify-between border-b border-line bg-surface px-5 py-3.5">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded p-1 text-muted hover:bg-line/50" aria-label="Close"><X className="h-4 w-4"/></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>);
}
export function EmptyState({ icon, title, text, action }) {
    return (<div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-3 rounded-full bg-line/50 p-3 text-muted">{icon}</div>
      <p className="font-medium">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>);
}
export const Skeleton = ({ className }) => <div className={cx('skeleton', className)}/>;
export function MockNotice({ children }) {
    return (<div className="flex items-start gap-2.5 rounded-md border border-brand/30 bg-brand/5 px-3.5 py-2.5 text-sm">
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-brand"/>
      <p className="text-muted"><span className="font-medium text-ink">Sample data. </span>{children ?? 'No machine learning model is connected yet. Figures shown are placeholders for layout purposes.'}</p>
    </div>);
}
export function Toasts() {
    const { toasts, dismissToast } = useApp();
    return (<div className="no-print fixed bottom-4 right-4 z-[60] flex w-[min(92vw,22rem)] flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (<div key={t.id} className={cx('flex items-start gap-2.5 rounded-md border bg-surface px-3.5 py-3 text-sm shadow-lg', t.tone === 'success' ? 'border-safe/40' : 'border-risk/40')}>
          {t.tone === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-safe"/> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-risk"/>}
          <p className="flex-1">{t.message}</p>
          <button onClick={() => dismissToast(t.id)} aria-label="Dismiss" className="text-muted"><X className="h-4 w-4"/></button>
        </div>))}
    </div>);
}
export const ErrorBanner = ({ children }) => (<div className="flex items-start gap-2 rounded-md border border-risk/40 bg-risk/5 px-3.5 py-2.5 text-sm text-risk">
    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0"/><p>{children}</p>
  </div>);
export function Pagination({ page, pages, onChange }) {
    if (pages <= 1)
        return null;
    return (<div className="flex items-center justify-between border-t border-line px-5 py-3 text-sm text-muted">
      <span>Page {page} of {pages}</span>
      <div className="flex gap-2">
        <Button className="!py-1" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</Button>
        <Button className="!py-1" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</Button>
      </div>
    </div>);
}
