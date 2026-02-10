import React from 'react'
import { useNavigate } from 'react-router-dom'
import './AccessDenied.css'

interface AccessDeniedProps {
  message?: string
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ 
  message = 'You do not have permission to access this page.' 
}) => {
  const navigate = useNavigate()

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleGoToDashboard = () => {
    navigate('/dashboard')
  }

  return (
    <div className="access-denied">
      <div className="access-denied-content">
        <div className="access-denied-icon">🔒</div>
        <h1 className="access-denied-title">Access Denied</h1>
        <p className="access-denied-message">{message}</p>
        <div className="access-denied-actions">
          <button
            className="access-denied-button access-denied-button-primary"
            onClick={handleGoToDashboard}
          >
            Go to Dashboard
          </button>
          <button
            className="access-denied-button access-denied-button-secondary"
            onClick={handleGoBack}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}

export default AccessDenied
