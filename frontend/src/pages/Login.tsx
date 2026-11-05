import { useState, type FormEvent } from 'react'
import { useApp } from '../context/AppContext'
import { Button, ErrorBanner, Field, Input, Modal } from '../components/ui'

export default function Login() {
  const { login, notify } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgot, setForgot] = useState(false)
  const [resetEmail, setResetEmail] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address, like name@company.com.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    setLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    login(email, remember)
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_28rem]">
      <div className="hidden flex-col justify-between bg-brand p-12 text-white dark:text-bg lg:flex">
        <div className="flex items-center gap-2.5 font-semibold"><span className="grid h-7 w-7 place-items-center rounded bg-white/20 text-sm">D</span>Delinquency Desk</div>
        <div className="max-w-md">
          <p className="text-3xl font-semibold leading-snug tracking-tight">Know which accounts are likely to miss payments before they do.</p>
          <p className="mt-4 text-sm opacity-80">Register customers, submit their financial details, and review each delinquency prediction in one place.</p>
        </div>
        <p className="text-xs opacity-70">Authorized staff only.</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5" noValidate>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            <p className="mt-1 text-sm text-muted">Use your work email to continue.</p>
          </div>
          {error && <ErrorBanner>{error}</ErrorBanner>}
          <Field label="Email"><Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" /></Field>
          <Field label="Password"><Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-[rgb(var(--brand))]" />Remember me</label>
            <button type="button" onClick={() => setForgot(true)} className="text-brand hover:underline">Forgot password?</button>
          </div>
          <Button type="submit" variant="primary" loading={loading} className="w-full">{loading ? 'Signing in' : 'Sign in'}</Button>
          <p className="text-center text-xs text-muted">Preview build: any valid email and a password of 6+ characters will work.</p>
        </form>
      </div>

      <Modal open={forgot} onClose={() => setForgot(false)} title="Reset your password">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setForgot(false); notify('success', `If ${resetEmail || 'that address'} has an account, a reset link is on its way.`) }}>
          <p className="text-sm text-muted">Enter your email and we'll send a reset link.</p>
          <Field label="Email"><Input type="email" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} /></Field>
          <div className="flex justify-end gap-2"><Button type="button" onClick={() => setForgot(false)}>Cancel</Button><Button type="submit" variant="primary">Send reset link</Button></div>
        </form>
      </Modal>
    </div>
  )
}
