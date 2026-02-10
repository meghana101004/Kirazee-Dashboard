import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import App from './App'
import * as apiClient from './utils/apiClient'

// Mock the API client
vi.mock('./utils/apiClient', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
  registerErrorHandler: vi.fn(() => vi.fn()), // Returns unregister function
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Kirazee Dashboard')).toBeInTheDocument()
  })

  describe('Complete Authentication Flow', () => {
    it('redirects to dashboard after successful login', async () => {
      const user = userEvent.setup()
      
      // Mock successful login
      vi.mocked(apiClient.default.post).mockResolvedValueOnce({
        data: {
          token: 'mock-jwt-token',
          user: {
            id: '1',
            username: 'testuser',
            role: 'super_admin',
          },
        },
      })

      // Mock metrics endpoint
      vi.mocked(apiClient.default.get).mockResolvedValueOnce({
        data: {
          revenue: { total: 125430.50, average_order_value: 45.20, trend: 12.5 },
          orders: { total: 2775, pending: 450, completed: 2100, cancelled: 225 },
        },
      })

      render(
        <MemoryRouter initialEntries={['/login']}>
          <App />
        </MemoryRouter>
      )

      // Fill in login form
      const usernameInput = screen.getByLabelText(/username/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const loginButton = screen.getByRole('button', { name: /login/i })

      await user.type(usernameInput, 'testuser')
      await user.type(passwordInput, 'password123')
      await user.click(loginButton)

      // Wait for redirect to dashboard and verify dashboard content
      await waitFor(() => {
        expect(screen.getByText('Welcome back, testuser!')).toBeInTheDocument()
      })
    })

    it('redirects to login when accessing protected route without authentication', async () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <App />
        </MemoryRouter>
      )

      // Should redirect to login page
      await waitFor(() => {
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
      })
    })

    it('shows access denied when user lacks required permissions', async () => {
      // Set up authenticated state with limited permissions (support role)
      localStorage.setItem('token', 'mock-jwt-token')
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        username: 'support',
        role: 'support',
      }))

      render(
        <MemoryRouter initialEntries={['/user-management']}>
          <App />
        </MemoryRouter>
      )

      // Should show access denied message
      await waitFor(() => {
        expect(screen.getByText(/access denied/i)).toBeInTheDocument()
      })
    })

    it('allows access to protected route with correct permissions', async () => {
      // Set up authenticated state with super_admin role
      localStorage.setItem('token', 'mock-jwt-token')
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        username: 'superadmin',
        role: 'super_admin',
      }))

      // Mock users endpoint
      vi.mocked(apiClient.default.get).mockResolvedValueOnce({
        data: {
          users: [
            { id: '1', username: 'superadmin', role: 'super_admin', created_at: '2024-01-01', last_login: '2024-01-15' },
          ],
        },
      })

      render(
        <MemoryRouter initialEntries={['/user-management']}>
          <App />
        </MemoryRouter>
      )

      // Should render user management page
      await waitFor(() => {
        expect(screen.getByText(/user management/i)).toBeInTheDocument()
      })
    })
  })
})
