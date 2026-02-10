import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Permission, KYCPendingResponse, KYCVerification, KYCType, KYCVerifyRequest } from '../types'
import KYCVerificationQueue from '../components/KYCVerificationQueue'
import apiClient from '../utils/apiClient'
import './KYCVerificationPage.css'

const KYCVerificationPage: React.FC = () => {
  const { hasPermission } = useAuth()
  const [verifications, setVerifications] = useState<KYCVerification[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<KYCType | 'all'>('all')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Check permissions
  const canViewKYC = hasPermission(Permission.VIEW_KYC_QUEUE) || hasPermission(Permission.MANAGE_USERS)

  useEffect(() => {
    if (canViewKYC) {
      fetchVerifications()
    }
  }, [typeFilter, canViewKYC])

  const fetchVerifications = async () => {
    setLoading(true)
    setError(null)

    try {
      const params: any = {
        type: typeFilter,
      }

      const response = await apiClient.get<KYCPendingResponse>('/kyc/pending', { params })

      setVerifications(response.data.verifications)
    } catch (err: any) {
      console.error('Error fetching KYC verifications:', err)
      setError(err.response?.data?.error || 'Failed to load KYC verifications')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const request: KYCVerifyRequest = {
        action: 'approve',
      }

      await apiClient.post(`/kyc/verify/${id}`, request)

      setSuccessMessage('Verification approved successfully')
      setTimeout(() => setSuccessMessage(null), 3000)

      // Refresh the list
      fetchVerifications()
    } catch (err: any) {
      console.error('Error approving verification:', err)
      setError(err.response?.data?.error || 'Failed to approve verification')
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleReject = async (id: string, reason: string) => {
    try {
      const request: KYCVerifyRequest = {
        action: 'reject',
        reason,
      }

      await apiClient.post(`/kyc/verify/${id}`, request)

      setSuccessMessage('Verification rejected successfully')
      setTimeout(() => setSuccessMessage(null), 3000)

      // Refresh the list
      fetchVerifications()
    } catch (err: any) {
      console.error('Error rejecting verification:', err)
      setError(err.response?.data?.error || 'Failed to reject verification')
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleTypeFilterChange = (type: KYCType | 'all') => {
    setTypeFilter(type)
  }

  if (!canViewKYC) {
    return (
      <div className="kyc-verification-page">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You do not have permission to view KYC verifications.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="kyc-verification-page">
      <div className="page-header">
        <div className="header-content">
          <h2>KYC Verification</h2>
          <div className="header-stats">
            <span className="quick-stat">
              <span className="stat-number">{verifications.length}</span>
              <span className="stat-text">Pending</span>
            </span>
            <span className="quick-stat">
              <span className="stat-number">{verifications.filter(v => v.type === KYCType.BUSINESS).length}</span>
              <span className="stat-text">Business</span>
            </span>
            <span className="quick-stat">
              <span className="stat-number">{verifications.filter(v => v.type === KYCType.DELIVERY_PARTNER).length}</span>
              <span className="stat-text">Delivery</span>
            </span>
          </div>
        </div>
        <div className="filter-section">
          <div className="filter-group">
            <label htmlFor="type-filter">Filter by Type:</label>
            <select
              id="type-filter"
              value={typeFilter}
              onChange={(e) => handleTypeFilterChange(e.target.value as KYCType | 'all')}
              className="type-filter-select"
            >
              <option value="all">All Types</option>
              <option value={KYCType.BUSINESS}>Business</option>
              <option value={KYCType.DELIVERY_PARTNER}>Delivery Partner</option>
            </select>
          </div>
        </div>
      </div>

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
          <p>Loading KYC verifications...</p>
        </div>
      ) : (
        <div className="kyc-queue-wrapper">
          <KYCVerificationQueue
            pendingVerifications={verifications}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>
      )}
    </div>
  )
}

export default KYCVerificationPage
