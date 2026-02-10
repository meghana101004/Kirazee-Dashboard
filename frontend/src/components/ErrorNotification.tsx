import React, { useState, useEffect } from 'react'
import { registerErrorHandler, ApiError } from '../utils/apiClient'
import './ErrorNotification.css'

interface ErrorNotificationProps {
  autoHideDuration?: number // milliseconds
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({ autoHideDuration = 5000 }) => {
  const [errors, setErrors] = useState<Array<ApiError & { id: string; timestamp: number }>>([])

  useEffect(() => {
    // Register error handler
    const unregister = registerErrorHandler((error: ApiError) => {
      // Don't show auth errors as notifications (they redirect to login)
      if (error.type === 'auth') {
        return
      }

      const errorWithId = {
        ...error,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
      }

      setErrors(prev => [...prev, errorWithId])

      // Auto-hide after duration
      if (autoHideDuration > 0) {
        setTimeout(() => {
          setErrors(prev => prev.filter(e => e.id !== errorWithId.id))
        }, autoHideDuration)
      }
    })

    // Cleanup on unmount
    return unregister
  }, [autoHideDuration])

  const handleDismiss = (id: string) => {
    setErrors(prev => prev.filter(e => e.id !== id))
  }

  const handleRetry = () => {
    // Reload the page to retry
    window.location.reload()
  }

  if (errors.length === 0) {
    return null
  }

  return (
    <div className="error-notification-container">
      {errors.map(error => (
        <div key={error.id} className={`error-notification error-notification-${error.type}`}>
          <div className="error-notification-content">
            <div className="error-notification-icon">
              {error.type === 'authorization' && '🔒'}
              {error.type === 'network' && '📡'}
              {error.type === 'server' && '⚠️'}
              {error.type === 'validation' && 'ℹ️'}
              {error.type === 'unknown' && '❌'}
            </div>
            <div className="error-notification-message">
              <strong>
                {error.type === 'authorization' && 'Access Denied'}
                {error.type === 'network' && 'Network Error'}
                {error.type === 'server' && 'Server Error'}
                {error.type === 'validation' && 'Validation Error'}
                {error.type === 'unknown' && 'Error'}
              </strong>
              <p>{error.message}</p>
            </div>
            <div className="error-notification-actions">
              {(error.type === 'network' || error.type === 'server') && (
                <button
                  className="error-notification-button error-notification-retry"
                  onClick={handleRetry}
                >
                  Retry
                </button>
              )}
              <button
                className="error-notification-button error-notification-close"
                onClick={() => handleDismiss(error.id)}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ErrorNotification
