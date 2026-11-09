import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart3, FileText, History, LayoutDashboard, LogOut, Menu, Moon, Settings, Sparkles, Sun, Users, X } from 'lucide-react';
import { useApp, useIsDark } from '../context/AppContext';
import { cx, initials } from '../utils/format';
const nav = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/customers', label: 'Customers', icon: Users },
    { to: '/predictions/new', label: 'New prediction', icon: Sparkles },
    { to: '/history', label: 'Prediction history', icon: History },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/reports', label: 'Reports', icon: FileText },
    { to: '/settings', label: 'Settings', icon: Settings },
];
export default function Layout() {
    const [open, setOpen] = useState(false);
    const { user, logout, setTheme } = useApp();
    const dark = useIsDark();
    const navigate = useNavigate();
    const links = (<nav className="flex flex-col gap-0.5 px-3">
      {nav.map(({ to, label, icon: Icon, end }) => (<NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => cx('flex items-center gap-3 rounded-md px-3 py-2 text-sm', isActive ? 'bg-brand/10 font-medium text-brand' : 'text-muted hover:bg-line/50 hover:text-ink')}>
          <Icon className="h-4 w-4"/>{label}
        </NavLink>))}
    </nav>);
    const brand = (<div className="flex h-14 items-center gap-2.5 px-6">
      <span className="grid h-7 w-7 place-items-center rounded bg-brand text-sm font-semibold text-white dark:text-bg">D</span>
      <span className="font-semibold tracking-tight">Delinquency Desk</span>
    </div>);
    return (<div className="min-h-screen lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="no-print sticky top-0 hidden h-screen flex-col border-r border-line bg-surface lg:flex">
        {brand}
        <div className="flex-1 overflow-y-auto pt-2">{links}</div>
        <div className="border-t border-line p-4 text-xs text-muted">Frontend preview · sample data</div>
      </aside>

      {open && (<div className="no-print fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40"/>
          <aside className="absolute left-0 top-0 h-full w-64 bg-surface" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pr-3">{brand}<button onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5"/></button></div>
            <div className="pt-2">{links}</div>
          </aside>
        </div>)}

      <div className="min-w-0">
        <header className="no-print sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface/90 px-4 backdrop-blur sm:px-8">
          <button className="rounded p-1.5 hover:bg-line/50 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5"/></button>
          <div className="hidden lg:block"/>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setTheme(dark ? 'light' : 'dark')} className="rounded-md p-2 text-muted hover:bg-line/50" aria-label="Toggle theme">
              {dark ? <Sun className="h-4 w-4"/> : <Moon className="h-4 w-4"/>}
            </button>
            <button onClick={() => navigate('/settings')} className="flex items-center gap-2.5 rounded-md py-1 pl-2 pr-1 hover:bg-line/50">
              <span className="hidden text-right leading-tight sm:block">
                <span className="block text-sm font-medium">{user?.name}</span>
                <span className="block text-xs text-muted">{user?.role}</span>
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand/15 text-xs font-semibold text-brand">{initials(user?.name ?? '')}</span>
            </button>
            <button onClick={() => { logout(); navigate('/login'); }} className="rounded-md p-2 text-muted hover:bg-line/50" aria-label="Sign out"><LogOut className="h-4 w-4"/></button>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8"><Outlet /></main>
      </div>
    </div>);
}
