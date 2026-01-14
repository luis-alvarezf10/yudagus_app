import { useState, useEffect } from 'react'
import { authService } from '../services/auth.service'
import type { User, LoginCredentials } from '../types/auth.types'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is logged in
    authService.getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser)
      })
      .catch((err) => {
        console.error('Error loading user:', err)
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true)
      setError(null)
      const userData = await authService.login(credentials)
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      setError(null)
      await authService.logout()
      setUser(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cerrar sesión')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  }
}
