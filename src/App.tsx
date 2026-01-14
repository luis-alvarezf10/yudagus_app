import { useAuth } from './features/auth'
import { LoginPage } from './features/auth'
import { DashboardPage } from './features/dashboard'

function App() {
  const { isAuthenticated, loading, user } = useAuth()

  console.log('App render:', { isAuthenticated, loading, user })

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

  return isAuthenticated ? <DashboardPage /> : <LoginPage />
}

export default App
