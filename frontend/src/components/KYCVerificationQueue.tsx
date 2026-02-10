import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Permission, KYCVerification } from '../types'
import './KYCVerificationQueue.css'

interface KYCVerificationQueueProps {
  pendingVerifications: KYCVerification[]
  onApprove: (id: string) => void
  onReject: (id: string, reason: string) => void
}

const KYCVerificationQueue: React.FC<KYCVerificationQueueProps> = ({
  pendingVerifications,
  onApprove,
  onReject,
}) => {
  const { hasPermission } = useAuth()
  const [selectedVerification, setSelectedVerification] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState<string>('')
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false)

  // Require KYC_Associate or Super_Admin permission
  if (
    !hasPermission(Permission.VIEW_KYC_QUEUE) &&
    !hasPermission(Permission.MANAGE_USERS)
  ) {
    return null
  }

  const canVerify = hasPermission(Permission.VERIFY_KYC) || hasPermission(Permission.MANAGE_USERS)

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Handle approve
  const handleApprove = (id: string) => {
    if (canVerify) {
      onApprove(id)
    }
  }

  // Handle reject - show modal
  const handleRejectClick = (id: string) => {
    setSelectedVerification(id)
    setRejectReason('')
    setShowRejectModal(true)
  }

  // Submit rejection
  const submitRejection = () => {
    if (selectedVerification && rejectReason.trim()) {
      onReject(selectedVerification, rejectReason)
      setShowRejectModal(false)
      setSelectedVerification(null)
      setRejectReason('')
    }
  }

  // Cancel rejection
  const cancelRejection = () => {
    setShowRejectModal(false)
    setSelectedVerification(null)
    setRejectReason('')
  }

  return (
    <div className="kyc-queue-container">
      <div className="queue-header">
        <h3 className="queue-title">Verification Queue</h3>
        {pendingVerifications.length > 0 && (
          <span className="queue-count">{pendingVerifications.length} pending</span>
        )}
      </div>

      {pendingVerifications.length === 0 ? (
        <div className="no-verifications">
          <div className="empty-icon">📋</div>
          <h4>No Pending Verifications</h4>
          <p>All KYC verifications have been processed</p>
        </div>
      ) : (
        <div className="verifications-grid">
          {pendingVerifications.map((verification) => (
            <div key={verification.id} className="verification-card">
              <div className="verification-header">
                <div className="verification-info">
                  <h4 className="verification-name">{verification.name}</h4>
                  <span className={`verification-type type-${verification.type}`}>
                    {verification.type.replace('_', ' ')}
                  </span>
                </div>
                <div className="verification-meta">
                  <span className="verification-id">#{verification.id}</span>
                  <span className="verification-date">
                    {formatDate(verification.submitted_at)}
                  </span>
                </div>
              </div>

              <div className="verification-documents">
                <div className="documents-header">
                  <h5>Documents ({verification.documents.length})</h5>
                </div>
                <div className="documents-grid">
                  {verification.documents.map((doc, index) => (
                    <div key={index} className="document-item">
                      <div className="document-info">
                        <span className="document-type">{doc.type}</span>
                        <span className="document-date">
                          {formatDate(doc.uploaded_at)}
                        </span>
                      </div>
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="document-link"
                      >
                        <span className="link-icon">📄</span>
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {canVerify && (
                <div className="verification-actions">
                  <button
                    onClick={() => handleApprove(verification.id)}
                    className="btn-approve"
                  >
                    <span className="btn-icon">✓</span>
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectClick(verification.id)}
                    className="btn-reject"
                  >
                    <span className="btn-icon">✗</span>
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={cancelRejection}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reject Verification</h3>
              <button className="modal-close" onClick={cancelRejection}>×</button>
            </div>
            <div className="modal-body">
              <p>Please provide a reason for rejection:</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="reject-reason-input"
                rows={4}
              />
            </div>
            <div className="modal-actions">
              <button
                onClick={submitRejection}
                disabled={!rejectReason.trim()}
                className="btn-submit"
              >
                Submit Rejection
              </button>
              <button onClick={cancelRejection} className="btn-cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default KYCVerificationQueue
