export interface User {
  id: string
  username: string
  email?: string
  created_at?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}
