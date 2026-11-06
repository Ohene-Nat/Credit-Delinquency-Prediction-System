import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Customer, FinancialInput, Prediction, ThemePref, User } from '../types'
import { seedCustomers, seedPredictions } from '../data/mock'
import { mockScore } from '../data/mockEngine'

interface Toast { id: number; tone: 'success' | 'error'; message: string }

interface Ctx {
  user: User | null
  login: (email: string, remember: boolean) => void
  logout: () => void
  updateUser: (u: Partial<User>) => void
  theme: ThemePref
  setTheme: (t: ThemePref) => void
  customers: Customer[]
  addCustomer: (c: Omit<Customer, 'id' | 'createdAt'>) => Customer
  updateCustomer: (c: Customer) => void
  predictions: Prediction[]
  runPrediction: (customerId: string, input: FinancialInput) => Promise<Prediction>
  toasts: Toast[]
  notify: (tone: Toast['tone'], message: string) => void
  dismissToast: (id: number) => void
}

const AppCtx = createContext<Ctx | null>(null)
export const useApp = () => {
  const c = useContext(AppCtx)
  if (!c) throw new Error('useApp must be used inside AppProvider')
  return c
}

const store = {
  get: (k: string) => { try { return localStorage.getItem(k) ?? sessionStorage.getItem(k) } catch { return null } },
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = store.get('dd_user')
    return raw ? (JSON.parse(raw) as User) : null
  })
  const [theme, setThemeState] = useState<ThemePref>(() => (store.get('dd_theme') as ThemePref) || 'system')
  const [customers, setCustomers] = useState<Customer[]>(seedCustomers)
  const [predictions, setPredictions] = useState<Prediction[]>(seedPredictions)
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => document.documentElement.classList.toggle('dark', theme === 'dark' || (theme === 'system' && mq.matches))
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])

  const setTheme = (t: ThemePref) => { setThemeState(t); try { localStorage.setItem('dd_theme', t) } catch { /* ignore */ } }

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])
  const notify = useCallback((tone: Toast['tone'], message: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, tone, message }])
    setTimeout(() => dismissToast(id), 4500)
  }, [dismissToast])

  const login = (email: string, remember: boolean) => {
    const u: User = { name: 'Efua Danquah', email, role: 'Credit Risk Analyst', phone: '+233 20 555 0142' }
    setUser(u)
    try { (remember ? localStorage : sessionStorage).setItem('dd_user', JSON.stringify(u)) } catch { /* ignore */ }
  }
  const logout = () => { setUser(null); try { localStorage.removeItem('dd_user'); sessionStorage.removeItem('dd_user') } catch { /* ignore */ } }
  const updateUser = (p: Partial<User>) => setUser((u) => (u ? { ...u, ...p } : u))

  const addCustomer: Ctx['addCustomer'] = (c) => {
    const n: Customer = { ...c, id: `C-${1001 + customers.length}`, createdAt: new Date().toISOString() }
    setCustomers((l) => [n, ...l])
    return n
  }
  const updateCustomer = (c: Customer) => setCustomers((l) => l.map((x) => (x.id === c.id ? c : x)))

  const runPrediction: Ctx['runPrediction'] = async (customerId, input) => {
    await new Promise((r) => setTimeout(r, 1500))
    const c = customers.find((x) => x.id === customerId)
    if (!c) throw new Error('Customer not found')
    const s = mockScore(input, c.age)
    const p: Prediction = { id: `P-${5001 + predictions.length}`, customerId, createdAt: new Date().toISOString(), input, ...s, source: 'mock' }
    setPredictions((l) => [p, ...l])
    return p
  }

  const value = useMemo(
    () => ({ user, login, logout, updateUser, theme, setTheme, customers, addCustomer, updateCustomer, predictions, runPrediction, toasts, notify, dismissToast }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, theme, customers, predictions, toasts],
  )
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

/** Resolved light/dark flag for chart colours */
export function useIsDark() {
  const { theme } = useApp()
  const [sys, setSys] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const h = () => setSys(mq.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return theme === 'dark' || (theme === 'system' && sys)
}

export function useChartColors() {
  const dark = useIsDark()
  return dark
    ? { brand: '#4cb8b0', risk: '#f08054', safe: '#5abe8c', grid: '#28343e', text: '#8e9da8', surface: '#151d25' }
    : { brand: '#0f6b6b', risk: '#be4614', safe: '#267854', grid: '#dee2de', text: '#62707a', surface: '#ffffff' }
}
