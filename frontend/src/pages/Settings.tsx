import { useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Button, Card, CardHeader, Field, Input, PageHeader } from '../components/ui'
import { cx, initials } from '../utils/format'
import type { ThemePref } from '../types'

export default function Settings() {
  const { user, updateUser, theme, setTheme, notify } = useApp()
  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [pwErr, setPwErr] = useState('')

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) return notify('error', 'Enter your full name before saving.')
    updateUser({ name: name.trim(), phone }); notify('success', 'Profile saved.')
  }
  const savePw = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pw.current) return setPwErr('Enter your current password.')
    if (pw.next.length < 8) return setPwErr('New password must be at least 8 characters.')
    if (pw.next !== pw.confirm) return setPwErr('New password and confirmation do not match.')
    setPwErr(''); setPw({ current: '', next: '', confirm: '' }); notify('success', 'Password updated.')
  }
  const themes: { v: ThemePref; label: string; icon: typeof Sun }[] = [{ v: 'light', label: 'Light', icon: Sun }, { v: 'dark', label: 'Dark', icon: Moon }, { v: 'system', label: 'System', icon: Monitor }]

  return (
    <>
      <PageHeader title="Settings" sub="Manage your profile, password and appearance." />
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader title="Profile" />
          <form onSubmit={saveProfile} className="space-y-4 p-5">
            <div className="flex items-center gap-3"><span className="grid h-14 w-14 place-items-center rounded-full bg-brand/10 text-lg font-semibold text-brand">{initials(user?.name ?? '')}</span><div><p className="font-medium">{user?.name}</p><p className="text-sm text-muted">{user?.role}</p></div></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
              <Field label="Phone"><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
              <div className="sm:col-span-2"><Field label="Email" hint="Contact an administrator to change your sign-in email."><Input value={user?.email ?? ''} disabled /></Field></div>
            </div>
            <div className="flex justify-end"><Button type="submit" variant="primary">Save profile</Button></div>
          </form>
        </Card>
        <Card>
          <CardHeader title="Account" sub="Change your password" />
          <form onSubmit={savePw} className="space-y-4 p-5">
            {pwErr && <p className="text-sm text-risk">{pwErr}</p>}
            <Field label="Current password"><Input type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="New password" hint="At least 8 characters"><Input type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></Field>
              <Field label="Confirm new password"><Input type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></Field>
            </div>
            <div className="flex justify-end"><Button type="submit">Update password</Button></div>
          </form>
        </Card>
        <Card>
          <CardHeader title="Theme" sub="Applies on this device" />
          <div className="grid grid-cols-3 gap-3 p-5">
            {themes.map(({ v, label, icon: Icon }) => (
              <button key={v} onClick={() => setTheme(v)} aria-pressed={theme === v} className={cx('flex flex-col items-center gap-2 rounded-md border p-4 text-sm', theme === v ? 'border-brand bg-brand/5 font-medium text-brand' : 'border-line text-muted hover:bg-bg')}><Icon className="h-5 w-5" />{label}</button>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}
