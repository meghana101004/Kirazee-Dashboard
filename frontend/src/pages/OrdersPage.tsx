import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './OrdersPage.css'

interface OrderData {
  total: number
  today: number
  weekly: number
  monthly: number
  yearly: number
  growth_rate: number
  status_breakdown: {
    pending: number
    completed: number
    cancelled: number
    processing: number
  }
  recent_orders: Array<{
    id: string
    customer: string
    amount: number
    status: string
    date: string
  }>
}

const OrdersPage: React.FC = () => {
  const { user } = useAuth()
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'weekly' | 'monthly' | 'yearly'>('today')

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true)
        
        // Mock data - in real app this would come from API
        const mockData: OrderData = {
          total: 15420,
          today: 245,
          weekly: 1680,
          monthly: 7250,
          yearly: 89400,
          growth_rate: 12.5,
          status_breakdown: {
            pending: 156,
            completed: 14890,
            cancelled: 234,
            processing: 140
          },
          recent_orders: [
            { id: 'ORD-001', customer: 'John Doe', amount: 125.50, status: 'completed', date: '2026-02-10' },
            { id: 'ORD-002', customer: 'Jane Smith', amount: 89.25, status: 'processing', date: '2026-02-10' },
            { id: 'ORD-003', customer: 'Mike Johnson', amount: 234.75, status: 'pending', date: '2026-02-09' },
            { id: 'ORD-004', customer: 'Sarah Wilson', amount: 156.00, status: 'completed', date: '2026-02-09' },
            { id: 'ORD-005', customer: 'David Brown', amount: 78.50, status: 'cancelled', date: '2026-02-08' }
          ]
        }
        
        setOrderData(mockData)
      } catch (error) {
        console.error('Failed to fetch order data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderData()
  }, [])

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed': return '#10B981'
      case 'processing': return '#F59E0B'
      case 'pending': return '#6B7280'
      case 'cancelled': return '#EF4444'
      default: return '#6B7280'
    }
  }

  const getPeriodValue = (): number => {
    if (!orderData) return 0
    switch (selectedPeriod) {
      case 'today': return orderData.today
      case 'weekly': return orderData.weekly
      case 'monthly': return orderData.monthly
      case 'yearly': return orderData.yearly
      default: return orderData.today
    }
  }

  if (loading) {
    return (
      <div className="orders-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading order data...</p>
        </div>
      </div>
    )
  }

  if (!orderData) {
    return (
      <div className="orders-page">
        <div className="error-state">
          <div className="error-icon"></div>
          <h3>No Data Available</h3>
          <p>Unable to load order data at this time.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="orders-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-info">
            <div className="page-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 16.1 19 15 19H9C7.9 19 7 18.1 7 17V13M9 21C9.6 21 10 20.6 10 20S9.6 19 9 19 8 19.4 8 20 8.4 21 9 21ZM20 21C20.6 21 21 20.6 21 20S20.6 19 20 19 19 19.4 19 20 19.4 21 20 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="header-text">
              <h1>Orders Management</h1>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-content">
                <span className="stat-value">{formatNumber(orderData.total)}</span>
                <span className="stat-label">Total Orders</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-content">
                <span className="stat-value">+{orderData.growth_rate}%</span>
                <span className="stat-label">Growth Rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Period Selector */}
        <div className="period-selector">
          <h3>Order Statistics</h3>
          <div className="period-buttons">
            <button 
              className={selectedPeriod === 'today' ? 'active' : ''}
              onClick={() => setSelectedPeriod('today')}
            >
              Today
            </button>
            <button 
              className={selectedPeriod === 'weekly' ? 'active' : ''}
              onClick={() => setSelectedPeriod('weekly')}
            >
              Weekly
            </button>
            <button 
              className={selectedPeriod === 'monthly' ? 'active' : ''}
              onClick={() => setSelectedPeriod('monthly')}
            >
              Monthly
            </button>
            <button 
              className={selectedPeriod === 'yearly' ? 'active' : ''}
              onClick={() => setSelectedPeriod('yearly')}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Main Metrics */}
        <div className="metrics-section">
          <div className="main-metric-card">
            <div className="metric-header">
              <h2>Orders ({selectedPeriod})</h2>
              <div className="metric-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="metric-value">{formatNumber(getPeriodValue())}</div>
            <div className="metric-trend positive">↗ +{orderData.growth_rate}% from last period</div>
          </div>

          {/* Status Breakdown */}
          <div className="status-breakdown">
            <h3>Order Status Breakdown</h3>
            <div className="status-grid">
              <div className="status-card completed">
                <div className="status-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="status-info">
                  <span className="status-count">{formatNumber(orderData.status_breakdown.completed)}</span>
                  <span className="status-label">Completed</span>
                </div>
              </div>
              <div className="status-card processing">
                <div className="status-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="status-info">
                  <span className="status-count">{formatNumber(orderData.status_breakdown.processing)}</span>
                  <span className="status-label">Processing</span>
                </div>
              </div>
              <div className="status-card pending">
                <div className="status-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="status-info">
                  <span className="status-count">{formatNumber(orderData.status_breakdown.pending)}</span>
                  <span className="status-label">Pending</span>
                </div>
              </div>
              <div className="status-card cancelled">
                <div className="status-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="status-info">
                  <span className="status-count">{formatNumber(orderData.status_breakdown.cancelled)}</span>
                  <span className="status-label">Cancelled</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="recent-orders-section">
          <h3>Recent Orders</h3>
          <div className="orders-table">
            <div className="table-header">
              <span>Order ID</span>
              <span>Customer</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Date</span>
            </div>
            {orderData.recent_orders.map((order) => (
              <div key={order.id} className="table-row">
                <span className="order-id">{order.id}</span>
                <span className="customer-name">{order.customer}</span>
                <span className="order-amount">{formatCurrency(order.amount)}</span>
                <span className="order-status">
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                </span>
                <span className="order-date">{new Date(order.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrdersPage