import { useAuth } from '../context/AuthContext'
import { LoginForm } from '../components/LoginForm'

export const LoginPage = () => {
  const { login, loading, error } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Revisión Técnica Formal
          </h1>
          <p className="text-gray-600">
            Inicia sesión para continuar
          </p>
        </div>

        <LoginForm 
          onSubmit={login}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  )
}
