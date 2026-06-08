'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '@/services/auth.service'
import type { IUser } from '@/types/api.types'

interface AuthContextValue {
  user: IUser | null
  token: string | null
  isLoading: boolean
  login: (token: string, user: IUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null, token: null, isLoading: true,
  login: () => {}, logout: () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser]       = useState<IUser | null>(null)
  const [token, setToken]     = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('finfolio_token')
    if (!stored) { setIsLoading(false); return }
    setToken(stored)
    authService.me()
      .then(res => setUser(res.data))
      .catch(() => { localStorage.removeItem('finfolio_token'); setToken(null) })
      .finally(() => setIsLoading(false))
  }, [])

  const login = (t: string, u: IUser) => {
    localStorage.setItem('finfolio_token', t)
    setToken(t)
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem('finfolio_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
