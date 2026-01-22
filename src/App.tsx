import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './features/auth'
import { LoginPage } from './features/auth'
import { DashboardPage, ManagerDashboardPage } from './features/dashboard'
import { ScheduleReviewPage } from './features/reviews'

function App() {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  // Rutas para gerentes
  if (user?.is_manager) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/dashboard" element={<ManagerDashboardPage />} />
          <Route path="/reviews/schedule" element={<ScheduleReviewPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    )
  }

  // Rutas para empleados regulares
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
