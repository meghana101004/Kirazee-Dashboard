import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from './LoginPage'
import { AuthProvider } from '../contexts/AuthContext'
import apiClient from '../utils/apiClient'

// Mock apiClient
vi.mock('../utils/apiClient')

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  const renderLoginPage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )
  }

  it('renders login form', () => {
    renderLoginPage()

    expect(screen.getByText('Kirazee Dashboard')).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('handles form submission with valid credentials', async () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      role: 'manager',
    }
    const mockToken = 'test-token'

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        token: mockToken,
        user: mockUser,
      },
    } as any)

    renderLoginPage()

    const usernameInput = screen.getByLabelText('Username')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /login/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('displays error message on invalid credentials', async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce({
      response: {
        data: {
          error: 'Invalid credentials',
        },
      },
    })

    renderLoginPage()

    const usernameInput = screen.getByLabelText('Username')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /login/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials')
    })
  })

  it('displays network error message', async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce({
      request: {},
    })

    renderLoginPage()

    const usernameInput = screen.getByLabelText('Username')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /login/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Network error')
    })
  })

  it('disables form during submission', async () => {
    vi.mocked(apiClient.post).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    renderLoginPage()

    const usernameInput = screen.getByLabelText('Username') as HTMLInputElement
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement
    const submitButton = screen.getByRole('button', { name: /login/i }) as HTMLButtonElement

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password' } })
    fireEvent.click(submitButton)

    // Check that form is disabled during submission
    expect(usernameInput.disabled).toBe(true)
    expect(passwordInput.disabled).toBe(true)
    expect(submitButton.disabled).toBe(true)
    expect(submitButton.textContent).toBe('Logging in...')
  })

  it('displays sample credentials', () => {
    renderLoginPage()

    expect(screen.getByText(/sample credentials for testing/i)).toBeInTheDocument()
    expect(screen.getByText(/superadmin \/ admin123/i)).toBeInTheDocument()
    expect(screen.getByText(/manager \/ manager123/i)).toBeInTheDocument()
  })
})
