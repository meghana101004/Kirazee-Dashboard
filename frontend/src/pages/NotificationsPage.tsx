import React, { useState } from 'react'
import './PlaceholderPage.css'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  recipients: string
  sentDate: string
  status: 'sent' | 'pending' | 'failed'
  readCount: number
  totalRecipients: number
}

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: 'NOT-001',
    title: 'New Order Received',
    message: 'You have received a new order #12345',
    type: 'info',
    recipients: 'All Businesses',
    sentDate: '2024-06-07 10:30',
    status: 'sent',
    readCount: 142,
    totalRecipients: 156
  },
  {
    id: 'NOT-002',
    title: 'Payment Processed',
    message: 'Your payment of $1,234.56 has been processed successfully',
    type: 'success',
    recipients: 'Business: Fresh Mart',
    sentDate: '2024-06-07 09:15',
    status: 'sent',
    readCount: 1,
    totalRecipients: 1
  },
  {
    id: 'NOT-003',
    title: 'Delivery Delayed',
    message: 'Order #12340 delivery has been delayed due to traffic',
    type: 'warning',
    recipients: 'Customer: Emily Rodriguez',
    sentDate: '2024-06-07 08:45',
    status: 'sent',
    readCount: 1,
    totalRecipients: 1
  },
  {
    id: 'NOT-004',
    title: 'System Maintenance',
    message: 'Scheduled maintenance on June 10, 2024 from 2:00 AM to 4:00 AM',
    type: 'warning',
    recipients: 'All Users',
    sentDate: '2024-06-06 18:00',
    status: 'sent',
    readCount: 523,
    totalRecipients: 678
  },
  {
    id: 'NOT-005',
    title: 'KYC Verification Required',
    message: 'Please complete your KYC verification to continue',
    type: 'error',
    recipients: 'Business: Tech Store Plus',
    sentDate: '2024-06-06 14:20',
    status: 'sent',
    readCount: 0,
    totalRecipients: 1
  },
  {
    id: 'NOT-006',
    title: 'Weekly Report Available',
    message: 'Your weekly performance report is now available',
    type: 'info',
    recipients: 'All Businesses',
    sentDate: '2024-06-05 09:00',
    status: 'sent',
    readCount: 134,
    totalRecipients: 156
  },
  {
    id: 'NOT-007',
    title: 'Promotional Campaign',
    message: 'New promotional campaign starting next week',
    type: 'info',
    recipients: 'All Customers',
    sentDate: '2024-06-07 11:00',
    status: 'pending',
    readCount: 0,
    totalRecipients: 8432
  }
]

const NotificationsPage: React.FC = () => {
  const [notifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredNotifications = notifications.filter(notification => {
    const typeMatch = filterType === 'all' || notification.type === filterType
    const statusMatch = filterStatus === 'all' || notification.status === filterStatus
    return typeMatch && statusMatch
  })

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'info': return 'type-badge type-info'
      case 'success': return 'type-badge type-success'
      case 'warning': return 'type-badge type-warning'
      case 'error': return 'type-badge type-error'
      default: return 'type-badge'
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'sent': return 'status-badge status-available'
      case 'pending': return 'status-badge status-busy'
      case 'failed': return 'status-badge status-offline'
      default: return 'status-badge'
    }
  }

  const sentCount = notifications.filter(n => n.status === 'sent').length
  const pendingCount = notifications.filter(n => n.status === 'pending').length
  const totalRecipients = notifications.reduce((sum, n) => sum + n.totalRecipients, 0)
  const totalReads = notifications.reduce((sum, n) => sum + n.readCount, 0)

  return (
    <div className="placeholder-page">
      <h1>Notifications</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{sentCount}</div>
            <div className="stat-label">Sent</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{totalRecipients.toLocaleString()}</div>
            <div className="stat-label">Total Recipients</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👁️</div>
          <div className="stat-content">
            <div className="stat-value">{totalReads.toLocaleString()}</div>
            <div className="stat-label">Total Reads</div>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Type:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="sent">Sent</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <button className="btn-primary">📤 Send New Notification</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Message</th>
              <th>Type</th>
              <th>Recipients</th>
              <th>Sent Date</th>
              <th>Status</th>
              <th>Read Rate</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotifications.map((notification) => (
              <tr key={notification.id}>
                <td>{notification.id}</td>
                <td><strong>{notification.title}</strong></td>
                <td className="message-cell">{notification.message}</td>
                <td>
                  <span className={getTypeBadgeClass(notification.type)}>
                    {notification.type}
                  </span>
                </td>
                <td>{notification.recipients}</td>
                <td>{notification.sentDate}</td>
                <td>
                  <span className={getStatusBadgeClass(notification.status)}>
                    {notification.status}
                  </span>
                </td>
                <td>
                  {notification.readCount}/{notification.totalRecipients}
                  <span className="read-percentage">
                    ({((notification.readCount / notification.totalRecipients) * 100).toFixed(0)}%)
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default NotificationsPage
