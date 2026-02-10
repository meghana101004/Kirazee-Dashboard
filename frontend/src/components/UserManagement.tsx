import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Permission, User, UserRole, CreateUserData, EditUserData } from '../types'
import './UserManagement.css'

interface UserManagementProps {
  users: User[]
  onCreateUser: (userData: CreateUserData) => void
  onEditUser: (userId: string, userData: EditUserData) => void
  onDeleteUser: (userId: string) => void
}

type ModalMode = 'create' | 'edit' | 'delete' | null

const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onCreateUser,
  onEditUser,
  onDeleteUser,
}) => {
  const { hasPermission } = useAuth()
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<CreateUserData>({
    username: '',
    password: '',
    role: UserRole.SUPPORT,
  })

  // Require Super_Admin permission only
  if (!hasPermission(Permission.MANAGE_USERS)) {
    return null
  }

  // Format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Open create modal
  const openCreateModal = () => {
    setFormData({
      username: '',
      password: '',
      role: UserRole.SUPPORT,
    })
    setSelectedUser(null)
    setModalMode('create')
  }

  // Open edit modal
  const openEditModal = (user: User) => {
    setFormData({
      username: user.username,
      password: '',
      role: user.role,
    })
    setSelectedUser(user)
    setModalMode('edit')
  }

  // Open delete modal
  const openDeleteModal = (user: User) => {
    setSelectedUser(user)
    setModalMode('delete')
  }

  // Close modal
  const closeModal = () => {
    setModalMode(null)
    setSelectedUser(null)
    setFormData({
      username: '',
      password: '',
      role: UserRole.SUPPORT,
    })
  }

  // Handle form input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle create user
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.username && formData.password && formData.role) {
      onCreateUser(formData)
      closeModal()
    }
  }

  // Handle edit user
  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedUser) {
      const editData: EditUserData = {
        username: formData.username !== selectedUser.username ? formData.username : undefined,
        password: formData.password || undefined,
        role: formData.role !== selectedUser.role ? formData.role : undefined,
      }
      onEditUser(selectedUser.id, editData)
      closeModal()
    }
  }

  // Handle delete user
  const handleDeleteUser = () => {
    if (selectedUser) {
      onDeleteUser(selectedUser.id)
      closeModal()
    }
  }

  // Get role badge class
  const getRoleClass = (role: UserRole): string => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'role-super-admin'
      case UserRole.MANAGER:
        return 'role-manager'
      case UserRole.SUPPORT:
        return 'role-support'
      case UserRole.KYC_ASSOCIATE:
        return 'role-kyc'
      case UserRole.CA_FINANCE:
        return 'role-finance'
      case UserRole.DEVELOPER:
        return 'role-developer'
      default:
        return ''
    }
  }

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <h3 className="management-title">User Management</h3>
        <button onClick={openCreateModal} className="btn-create-user">
          + Create User
        </button>
      </div>

      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Last Login</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="no-data">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="username-cell">{user.username}</td>
                  <td>
                    <span className={`role-badge ${getRoleClass(user.role)}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="date-cell">{formatDate(user.created_at)}</td>
                  <td className="date-cell">{formatDate(user.last_login)}</td>
                  <td>
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      onClick={() => openEditModal(user)}
                      className="btn-action btn-edit"
                      title="Edit user"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => openDeleteModal(user)}
                      className="btn-action btn-delete"
                      title="Delete user"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {(modalMode === 'create' || modalMode === 'edit') && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{modalMode === 'create' ? 'Create New User' : 'Edit User'}</h3>
            <form onSubmit={modalMode === 'create' ? handleCreateUser : handleEditUser}>
              <div className="form-group">
                <label htmlFor="username">Username *</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  minLength={3}
                  maxLength={50}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  Password {modalMode === 'create' ? '*' : '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={modalMode === 'create'}
                  minLength={8}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                >
                  <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                  <option value={UserRole.MANAGER}>Manager</option>
                  <option value={UserRole.SUPPORT}>Support</option>
                  <option value={UserRole.KYC_ASSOCIATE}>KYC Associate</option>
                  <option value={UserRole.CA_FINANCE}>CA Finance</option>
                  <option value={UserRole.DEVELOPER}>Developer</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-submit">
                  {modalMode === 'create' ? 'Create User' : 'Save Changes'}
                </button>
                <button type="button" onClick={closeModal} className="btn-cancel">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {modalMode === 'delete' && selectedUser && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content modal-delete" onClick={(e) => e.stopPropagation()}>
            <h3>Delete User</h3>
            <p className="modal-description">
              Are you sure you want to delete user <strong>{selectedUser.username}</strong>?
            </p>
            <p className="warning-text">
              This action cannot be undone and will invalidate all active tokens for this user.
            </p>
            <div className="modal-actions">
              <button onClick={closeModal} className="btn-cancel">
                Cancel
              </button>
              <button onClick={handleDeleteUser} className="btn-delete-confirm">
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement
