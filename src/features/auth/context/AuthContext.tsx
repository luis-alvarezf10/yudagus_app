import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, LoginCredentials } from '../types/auth.types'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Obtener datos del empleado
        supabase
          .from('employees')
          .select('name, is_manager')
          .eq('id', session.user.id)
          .single()
          .then(({ data: employeeData }) => {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: employeeData?.name || session.user.email?.split('@')[0],
              is_manager: employeeData?.is_manager || false,
              created_at: session.user.created_at
            })
            setLoading(false)
          })
          .catch(() => {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: session.user.email?.split('@')[0],
              is_manager: false,
              created_at: session.user.created_at
            })
            setLoading(false)
          })
      } else {
        setUser(null)
        setLoading(false)
      }
    }).catch(() => {
      setUser(null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase
          .from('employees')
          .select('name, is_manager')
          .eq('id', session.user.id)
          .single()
          .then(({ data: employeeData }) => {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: employeeData?.name || session.user.email?.split('@')[0],
              is_manager: employeeData?.is_manager || false,
              created_at: session.user.created_at
            })
          })
          .catch(() => {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: session.user.email?.split('@')[0],
              is_manager: false,
              created_at: session.user.created_at
            })
          })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })
      
      if (authError) throw authError
      
      const { data: employeeData } = await supabase
        .from('employees')
        .select('name, is_manager')
        .eq('id', data.user.id)
        .single()
      
      setUser({
        id: data.user.id,
        email: data.user.email!,
        name: employeeData?.name || data.user.email?.split('@')[0],
        is_manager: employeeData?.is_manager || false,
        created_at: data.user.created_at
      })
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
      await supabase.auth.signOut()
      setUser(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cerrar sesión')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
