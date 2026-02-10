import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import apiClient from '../utils/apiClient'
import { User, UserRole, Permission, LoginResponse } from '../types'

// Role-Permission Mapping
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    Permission.VIEW_REVENUE,
    Permission.VIEW_ORDERS,
    Permission.VIEW_BUSINESSES,
    Permission.VIEW_CUSTOMERS,
    Permission.VIEW_DELIVERY_PARTNERS,
    Permission.VIEW_KYC_QUEUE,
    Permission.VIEW_SYSTEM_LOGS,
    Permission.VIEW_API_ANALYTICS,
    Permission.MANAGE_USERS,
    Permission.VERIFY_KYC,
    Permission.MANAGE_BUSINESSES,
    Permission.MANAGE_ORDERS,
    Permission.VIEW_FINANCIAL_REPORTS,
    Permission.MANAGE_NOTIFICATIONS,
  ],
  [UserRole.MANAGER]: [
    Permission.VIEW_ORDERS,
    Permission.VIEW_BUSINESSES,
    Permission.VIEW_DELIVERY_PARTNERS,
    Permission.MANAGE_BUSINESSES,
    Permission.MANAGE_ORDERS,
  ],
  [UserRole.SUPPORT]: [
    Permission.VIEW_ORDERS,
    Permission.VIEW_CUSTOMERS,
    Permission.MANAGE_NOTIFICATIONS,
  ],
  [UserRole.KYC_ASSOCIATE]: [
    Permission.VIEW_KYC_QUEUE,
    Permission.VERIFY_KYC,
  ],
  [UserRole.CA_FINANCE]: [
    Permission.VIEW_REVENUE,
    Permission.VIEW_FINANCIAL_REPORTS,
  ],
  [UserRole.DEVELOPER]: [
    Permission.VIEW_SYSTEM_LOGS,
    Permission.VIEW_API_ANALYTICS,
    Permission.VIEW_DELIVERY_PARTNERS,
  ],
}

interface AuthContextValue {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  hasPermission: (permission: Permission) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User
        setToken(storedToken)
        setUser(parsedUser)
        setIsAuthenticated(true)
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }, [])

  const login = async (username: string, password: string): Promise<void> => {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        username,
        password,
      })

      const { token: newToken, user: newUser } = response.data

      // Store token and user in localStorage
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(newUser))

      // Update state
      setToken(newToken)
      setUser(newUser)
      setIsAuthenticated(true)
    } catch (error: any) {
      // Clear any existing auth state
      setToken(null)
      setUser(null)
      setIsAuthenticated(false)
      
      // Re-throw error for component to handle
      throw error
    }
  }

  const logout = (): void => {
    // Call logout endpoint (fire and forget)
    if (token) {
      apiClient.post('/auth/logout').catch(() => {
        // Ignore errors on logout endpoint
      })
    }

    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    // Clear state
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
  }

  const hasPermission = (permission: Permission): boolean => {
    if (!user) {
      return false
    }

    const rolePermissions = ROLE_PERMISSIONS[user.role]
    return rolePermissions.includes(permission)
  }

  const value: AuthContextValue = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    hasPermission,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
