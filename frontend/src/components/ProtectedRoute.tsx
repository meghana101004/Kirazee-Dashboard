import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Permission } from '../types'
import AccessDenied from './AccessDenied'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: Permission[]
  redirectTo?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  redirectTo = '/login',
}) => {
  const { isAuthenticated, hasPermission } = useAuth()

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  // Check if user has required permissions
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every((permission) =>
      hasPermission(permission)
    )

    if (!hasAllPermissions) {
      // User is authenticated but doesn't have required permissions
      return <AccessDenied />
    }
  }

  // User is authenticated and has required permissions
  return <>{children}</>
}

export default ProtectedRoute
