import { Navigate, Route, Routes } from 'react-router-dom'
import { useApp } from './context/AppContext'
import Layout from './components/Layout'
import { Toasts } from './components/ui'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import NewPrediction from './pages/NewPrediction'
import PredictionResult from './pages/PredictionResult'
import History from './pages/History'
import Analytics from './pages/Analytics'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

function Protected() {
  const { user } = useApp()
  return user ? <Layout /> : <Navigate to="/login" replace />
}

export default function App() {
  const { user } = useApp()
  return (
    <>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route element={<Protected />}>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="predictions/new" element={<NewPrediction />} />
          <Route path="predictions/:id" element={<PredictionResult />} />
          <Route path="history" element={<History />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toasts />
    </>
  )
}
