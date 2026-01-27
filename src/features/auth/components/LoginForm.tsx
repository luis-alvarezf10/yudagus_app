import { useState } from 'react'
import type { FormEvent } from 'react'
import type { LoginCredentials } from '../types/auth.types'

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>
  loading?: boolean
  error?: string | null
}

export const LoginForm = ({ onSubmit, loading, error }: LoginFormProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await onSubmit({ email, password })
    } catch (err) {
      // Error is handled by the parent component
      console.error('Login failed:', err)
    }
  }

  return (
    <div className="w-full max-w-[480px] bg-[#1a2432] p-8 md:p-10 rounded-xl shadow-2xl border border-gray-800/50">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-white tracking-tight text-3xl font-bold leading-tight pb-2">
          YUDAGUS APP
        </h1>
        <p className="text-gray-400 text-base font-normal leading-normal">
          Ingresa tus credenciales para gestionar el progreso de tu equipo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-200 text-sm font-semibold leading-normal">
            Correo Electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex w-full rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-blue-500/50 border border-gray-700 bg-[#232e3e] h-14 placeholder:text-gray-500 px-4 text-base font-normal transition-all"
            placeholder="ej. gerente@empresa.com"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-gray-200 text-sm font-semibold leading-normal">
              Contraseña
            </label>
          </div>
          <div className="relative flex w-full items-stretch rounded-lg">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="flex w-full rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-blue-500/50 border border-gray-700 bg-[#232e3e] h-14 placeholder:text-gray-500 px-4 text-base font-normal transition-all"
              placeholder="Ingresa tu contraseña"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500 flex items-center justify-center transition-colors"
            >
              <span className="text-xl">{showPassword ? '👁️' : '👁️‍🗨️'}</span>
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-2 px-1">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-gray-700 bg-[#232e3e] text-blue-600 focus:ring-blue-500 focus:ring-offset-[#101822]"
          />
          <label htmlFor="remember" className="text-sm text-gray-400">
            Mantenerme conectado por 30 días
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-lg h-14 px-4 bg-blue-600 hover:bg-blue-700 text-white text-base font-bold leading-normal transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Iniciando sesión...
            </>
          ) : (
            'Iniciar Sesión'
          )}
        </button>
      </form>
    </div>
  )
}
