import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

// Error types for better error handling
export interface ApiError {
  message: string
  status?: number
  type: 'auth' | 'authorization' | 'network' | 'server' | 'validation' | 'unknown'
  originalError?: AxiosError
}

// Error handler callback type
type ErrorHandler = (error: ApiError) => void

// Global error handlers
const errorHandlers: ErrorHandler[] = []

// Register a global error handler
export const registerErrorHandler = (handler: ErrorHandler): (() => void) => {
  errorHandlers.push(handler)
  // Return unregister function
  return () => {
    const index = errorHandlers.indexOf(handler)
    if (index > -1) {
      errorHandlers.splice(index, 1)
    }
  }
}

// Notify all registered error handlers
const notifyErrorHandlers = (error: ApiError): void => {
  errorHandlers.forEach(handler => {
    try {
      handler(error)
    } catch (err) {
      console.error('Error in error handler:', err)
    }
  })
}

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add JWT token to headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem('token')
    
    // Add token to Authorization header if it exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error: AxiosError) => {
    // Handle request error
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return successful response
    return response
  },
  (error: AxiosError) => {
    let apiError: ApiError

    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const status = error.response.status
      const data = error.response.data as any
      
      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          apiError = {
            message: data?.error || 'Your session has expired. Please log in again.',
            status,
            type: 'auth',
            originalError: error,
          }
          
          // Clear token and redirect to login
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          
          // Only redirect if not already on login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          break
          
        case 403:
          // Forbidden - insufficient permissions
          apiError = {
            message: data?.error || 'You do not have permission to access this resource.',
            status,
            type: 'authorization',
            originalError: error,
          }
          break
          
        case 404:
          // Not found
          apiError = {
            message: data?.error || 'The requested resource was not found.',
            status,
            type: 'validation',
            originalError: error,
          }
          break
          
        case 429:
          // Too many requests - rate limited
          apiError = {
            message: data?.error || 'Too many requests. Please try again later.',
            status,
            type: 'validation',
            originalError: error,
          }
          break
          
        case 400:
          // Bad request - validation error
          apiError = {
            message: data?.error || 'Invalid request. Please check your input.',
            status,
            type: 'validation',
            originalError: error,
          }
          break
          
        case 500:
        case 502:
        case 503:
          // Server errors
          apiError = {
            message: data?.error || 'Server error. Please try again later.',
            status,
            type: 'server',
            originalError: error,
          }
          break
          
        default:
          apiError = {
            message: data?.error || `Request failed with status ${status}`,
            status,
            type: 'unknown',
            originalError: error,
          }
      }
    } else if (error.request) {
      // Request was made but no response received
      apiError = {
        message: 'Network error. Please check your connection and try again.',
        type: 'network',
        originalError: error,
      }
    } else {
      // Something else happened
      apiError = {
        message: error.message || 'An unexpected error occurred.',
        type: 'unknown',
        originalError: error,
      }
    }
    
    // Notify all registered error handlers
    notifyErrorHandlers(apiError)
    
    return Promise.reject(apiError)
  }
)

export default apiClient
