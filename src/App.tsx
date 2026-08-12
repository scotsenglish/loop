import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { useTheme } from '@/hooks/useTheme'
import { LoadingScreen } from '@/components/LoadingScreen'
import { Layout } from '@/components/Layout'
import Login from '@/pages/Login'
import Home from '@/pages/Home'
import Transactions from '@/pages/Transactions'
import Stats from '@/pages/Stats'
import Budgets from '@/pages/Budgets'
import Categories from '@/pages/Categories'
import Settings from '@/pages/Settings'

function AuthedApp() {
  const { settings, ready } = useData()
  useTheme(settings.theme)

  if (!ready) return <LoadingScreen />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="stats" element={<Stats />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="categories" element={<Categories />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Login />

  return <AuthedApp />
}
