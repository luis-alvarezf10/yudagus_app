import { supabase } from '@/lib/supabase'
import type { LoginCredentials, User } from '../types/auth.types'

export const authService = {
  async login({ username, password }: LoginCredentials) {
    try {
      console.log('Intentando login con:', { username, password })
      
      // First, check if user exists
      const { data: users, error: searchError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
      
      console.log('Búsqueda de usuario:', { users, searchError })
      
      if (searchError) {
        console.error('Error buscando usuario:', searchError)
        throw new Error(`Error de base de datos: ${searchError.message}`)
      }
      
      if (!users || users.length === 0) {
        throw new Error('Usuario no encontrado')
      }
      
      // Check password
      const user = users.find(u => u.password === password)
      
      if (!user) {
        throw new Error('Contraseña incorrecta')
      }
      
      console.log('Login exitoso:', user)
      return user as User
    } catch (err) {
      console.error('Login error:', err)
      throw err
    }
  },

  async logout() {
    localStorage.removeItem('user')
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const userStr = localStorage.getItem('user')
      if (!userStr) return null
      return JSON.parse(userStr) as User
    } catch (err) {
      console.error('Error getting current user:', err)
      localStorage.removeItem('user')
      return null
    }
  }
}
