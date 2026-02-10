import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'
import apiClient from '../utils/apiClient'
import { UserRole, Permission } from '../types'

// Mock apiClient
vi.mock('../utils/apiClient')

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Clear all mocks
    vi.clearAllMocks()
  })

  it('initializes with unauthenticated state', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
  })

  it('restores authentication state from localStorage', () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      role: UserRole.MANAGER,
    }
    const mockToken = 'test-token'

    localStorage.setItem('token', mockToken)
    localStorage.setItem('user', JSON.stringify(mockUser))

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.token).toBe(mockToken)
  })

  it('logs in successfully with valid credentials', async () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      role: UserRole.MANAGER,
    }
    const mockToken = 'test-token'

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        token: mockToken,
        user: mockUser,
      },
    } as any)

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await act(async () => {
      await result.current.login('testuser', 'password')
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.token).toBe(mockToken)
    expect(localStorage.getItem('token')).toBe(mockToken)
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser))
  })

  it('handles login failure', async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Invalid credentials'))

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await expect(
      act(async () => {
        await result.current.login('testuser', 'wrongpassword')
      })
    ).rejects.toThrow()

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
  })

  it('logs out and clears state', async () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      role: UserRole.MANAGER,
    }
    const mockToken = 'test-token'

    localStorage.setItem('token', mockToken)
    localStorage.setItem('user', JSON.stringify(mockUser))

    vi.mocked(apiClient.post).mockResolvedValueOnce({} as any)

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    act(() => {
      result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('checks permissions correctly for Super Admin', () => {
    const mockUser = {
      id: '1',
      username: 'superadmin',
      role: UserRole.SUPER_ADMIN,
    }

    localStorage.setItem('token', 'test-token')
    localStorage.setItem('user', JSON.stringify(mockUser))

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    // Super Admin should have all permissions
    expect(result.current.hasPermission(Permission.VIEW_REVENUE)).toBe(true)
    expect(result.current.hasPermission(Permission.MANAGE_USERS)).toBe(true)
    expect(result.current.hasPermission(Permission.VIEW_SYSTEM_LOGS)).toBe(true)
  })

  it('checks permissions correctly for Manager', () => {
    const mockUser = {
      id: '1',
      username: 'manager',
      role: UserRole.MANAGER,
    }

    localStorage.setItem('token', 'test-token')
    localStorage.setItem('user', JSON.stringify(mockUser))

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    // Manager should have specific permissions
    expect(result.current.hasPermission(Permission.VIEW_ORDERS)).toBe(true)
    expect(result.current.hasPermission(Permission.MANAGE_BUSINESSES)).toBe(true)
    
    // Manager should NOT have these permissions
    expect(result.current.hasPermission(Permission.VIEW_REVENUE)).toBe(false)
    expect(result.current.hasPermission(Permission.MANAGE_USERS)).toBe(false)
  })

  it('returns false for permissions when not authenticated', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    expect(result.current.hasPermission(Permission.VIEW_REVENUE)).toBe(false)
    expect(result.current.hasPermission(Permission.MANAGE_USERS)).toBe(false)
  })
})
