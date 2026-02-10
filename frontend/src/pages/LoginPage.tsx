import React, { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AxiosError } from 'axios'
import './LoginPage.css'

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login(username, password)
      // Redirect based on user role - managers go to manager dashboard
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (user.role === 'manager') {
        navigate('/manager-dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      // Handle login error
      const axiosError = err as AxiosError<{ error?: string; message?: string }>
      
      if (axiosError.response) {
        const errorMessage = 
          axiosError.response.data?.error || 
          axiosError.response.data?.message || 
          'Invalid credentials. Please try again.'
        setError(errorMessage)
      } else if (axiosError.request) {
        setError('Network error. Please check your connection and try again.')
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h1 style={styles.title}>Kirazee Dashboard</h1>
        <h2 style={styles.subtitle}>Login</h2>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="username" style={styles.label}>
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
              style={styles.input}
              placeholder="Enter your username"
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              style={styles.input}
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div style={styles.errorMessage} role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.button,
              ...(isLoading ? styles.buttonDisabled : {}),
            }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={styles.helpText}>
          <p>Sample credentials for testing:</p>
          <ul style={styles.credentialsList}>
            <li>Super Admin: admin1 / admin123</li>
            <li>Manager: manager1 / manager123</li>
            <li>Support: support1 / support123</li>
            <li>KYC Associate: kyc1 / kyc12345</li>
            <li>Finance: finance1 / finance123</li>
            <li>Developer: dev1 / dev12345</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Inline styles for simplicity
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  loginBox: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '450px',
  },
  title: {
    margin: '0 0 10px 0',
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    margin: '0 0 30px 0',
    fontSize: '20px',
    fontWeight: 'normal',
    color: '#666',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  button: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    fontWeight: '500',
    color: 'white',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
    cursor: 'not-allowed',
  },
  errorMessage: {
    padding: '12px',
    marginBottom: '20px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
    borderRadius: '4px',
    fontSize: '14px',
  },
  helpText: {
    marginTop: '30px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#666',
  },
  credentialsList: {
    margin: '10px 0 0 0',
    paddingLeft: '20px',
    lineHeight: '1.8',
  },
}

export default LoginPage
