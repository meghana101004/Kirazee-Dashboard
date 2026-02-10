import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Permission, UserListResponse, User, CreateUserData, EditUserData, UserResponse } from '../types'
import UserManagement from '../components/UserManagement'
import apiClient from '../utils/apiClient'
import './UserManagementPage.css'

const UserManagementPage: React.FC = () => {
  const { hasPermission } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Check permissions - only Super_Admin can access
  const canManageUsers = hasPermission(Permission.MANAGE_USERS)

  useEffect(() => {
    if (canManageUsers) {
      fetchUsers()
    }
  }, [canManageUsers])

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.get<UserListResponse>('/users')
      setUsers(response.data.users)
    } catch (err: any) {
      console.error('Error fetching users:', err)
      setError(err.response?.data?.error || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      await apiClient.post<UserResponse>('/users', userData)

      setSuccessMessage(`User "${userData.username}" created successfully`)
      setTimeout(() => setSuccessMessage(null), 3000)

      // Refresh the user list
      fetchUsers()
    } catch (err: any) {
      console.error('Error creating user:', err)
      const errorMsg = err.response?.data?.error || 'Failed to create user'
      setError(errorMsg)
      setTimeout(() => setError(null), 3000)
      throw err // Re-throw to let the component handle it
    }
  }

  const handleEditUser = async (userId: string, userData: EditUserData) => {
    try {
      await apiClient.put<UserResponse>(`/users/${userId}`, userData)

      setSuccessMessage('User updated successfully')
      setTimeout(() => setSuccessMessage(null), 3000)

      // Refresh the user list
      fetchUsers()
    } catch (err: any) {
      console.error('Error updating user:', err)
      const errorMsg = err.response?.data?.error || 'Failed to update user'
      setError(errorMsg)
      setTimeout(() => setError(null), 3000)
      throw err // Re-throw to let the component handle it
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await apiClient.delete(`/users/${userId}`)

      setSuccessMessage('User deleted successfully')
      setTimeout(() => setSuccessMessage(null), 3000)

      // Refresh the user list
      fetchUsers()
    } catch (err: any) {
      console.error('Error deleting user:', err)
      const errorMsg = err.response?.data?.error || 'Failed to delete user'
      setError(errorMsg)
      setTimeout(() => setError(null), 3000)
      throw err // Re-throw to let the component handle it
    }
  }

  if (!canManageUsers) {
    return (
      <div className="user-management-page">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You do not have permission to manage users. This feature is only available to Super Admins.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="user-management-page">
      {successMessage && (
        <div className="success-banner">
          <p>{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="error-banner">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <p>Loading users...</p>
        </div>
      ) : (
        <div className="user-management-wrapper">
          <UserManagement
            users={users}
            onCreateUser={handleCreateUser}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
          />
        </div>
      )}
    </div>
  )
}

export default UserManagementPage
