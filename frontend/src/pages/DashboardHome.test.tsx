import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import DashboardHome from './DashboardHome'
import { AuthProvider } from '../contexts/AuthContext'
import apiClient from '../utils/apiClient'
import { UserRole } from '../types'

// Mock the apiClient
vi.mock('../utils/apiClient')

const mockApiClient = apiClient as any

// Mock user for AuthContext
const mockUser = {
  id: '1',
  username: 'testuser',
  role: UserRole.SUPER_ADMIN,
}

// Mock metrics data
const mockMetricsData = {
  revenue: {
    total: 125430.5,
    average_order_value: 45.2,
    trend: 12.5,
  },
  orders: {
    total: 2775,
    pending: 450,
    completed: 2100,
    cancelled: 225,
  },
  businesses: {
    active: 156,
    pending_approval: 12,
  },
  customers: {
    unique: 8432,
    active: 1234,
  },
  delivery_partners: {
    active: 89,
    available: 67,
  },
  kyc_pending: {
    businesses: 8,
    delivery_partners: 5,
  },
}

// Helper to render component with providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  )
}

describe('DashboardHome', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock localStorage
    Storage.prototype.getItem = vi.fn((key) => {
      if (key === 'user') return JSON.stringify(mockUser)
      if (key === 'token') return 'mock-token'
      return null
    })
  })

  it('renders loading state initially', () => {
    mockApiClient.get = vi.fn(() => new Promise(() => {})) // Never resolves

    renderWithProviders(<DashboardHome />)

    expect(screen.getByText(/loading dashboard metrics/i)).toBeInTheDocument()
  })

  it('fetches and displays metrics on mount', async () => {
    mockApiClient.get = vi.fn().mockResolvedValue({
      data: mockMetricsData,
    })

    renderWithProviders(<DashboardHome />)

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading dashboard metrics/i)).not.toBeInTheDocument()
    })

    // Verify API was called
    expect(mockApiClient.get).toHaveBeenCalledWith('/metrics/overview')

    // Verify dashboard header
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText(/welcome back, testuser/i)).toBeInTheDocument()

    // Verify some metric cards are rendered (checking for formatted values)
    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('$125,430.50')).toBeInTheDocument()
    expect(screen.getByText('Total Orders')).toBeInTheDocument()
    expect(screen.getByText('2,775')).toBeInTheDocument()
  })

  it('displays error state when API call fails', async () => {
    const errorMessage = 'Failed to fetch metrics'
    mockApiClient.get = vi.fn().mockRejectedValue({
      response: {
        data: {
          error: errorMessage,
        },
      },
    })

    renderWithProviders(<DashboardHome />)

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/failed to load dashboard/i)).toBeInTheDocument()
    })

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('displays generic error message when API error has no message', async () => {
    mockApiClient.get = vi.fn().mockRejectedValue(new Error('Network error'))

    renderWithProviders(<DashboardHome />)

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /failed to load dashboard/i })).toBeInTheDocument()
    })

    expect(screen.getByText('Failed to load dashboard metrics')).toBeInTheDocument()
  })

  it('formats currency values correctly', async () => {
    mockApiClient.get = vi.fn().mockResolvedValue({
      data: {
        revenue: {
          total: 1234.56,
          average_order_value: 78.9,
          trend: 5.5,
        },
      },
    })

    renderWithProviders(<DashboardHome />)

    await waitFor(() => {
      expect(screen.getByText('$1,234.56')).toBeInTheDocument()
      expect(screen.getByText('$78.90')).toBeInTheDocument()
    })
  })

  it('renders metric cards only when data is available', async () => {
    // Only provide revenue data
    mockApiClient.get = vi.fn().mockResolvedValue({
      data: {
        revenue: {
          total: 1000,
          average_order_value: 50,
          trend: 10,
        },
      },
    })

    renderWithProviders(<DashboardHome />)

    await waitFor(() => {
      expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    })

    // Orders metrics should not be rendered
    expect(screen.queryByText('Total Orders')).not.toBeInTheDocument()
  })
})
