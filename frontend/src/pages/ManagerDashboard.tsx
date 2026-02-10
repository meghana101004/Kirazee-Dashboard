import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import MetricCard from '../components/MetricCard'
import RevenueChart from '../components/RevenueChart'
import apiClient from '../utils/apiClient'
import { MetricsOverviewResponse, Permission, RevenueResponse } from '../types'
import './ManagerDashboard.css'

interface ManagerMetrics extends MetricsOverviewResponse {
  operational_insights?: {
    pending_orders: number
    cancelled_orders: number
    delayed_orders: number
    active_delivery_partners: number
  }
  support_tickets?: {
    open: number
    resolved: number
    pending_approval: number
    finance_settlements_pending: number
  }
  performance?: {
    peak_order_hours: string[]
    city_zone_performance: Array<{
      zone: string
      orders: number
      performance_score: number
    }>
    revenue_trend: {
      daily: number
      weekly: number
      monthly: number
    }
  }
}

const ManagerDashboard: React.FC = () => {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<ManagerMetrics | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch metrics and revenue data in parallel
        const [metricsResponse, revenueResponse] = await Promise.all([
          apiClient.get<ManagerMetrics>('/metrics/overview'),
          apiClient.get<RevenueResponse>('/revenue/daily?days=30')
        ])
        
        setMetrics(metricsResponse.data)
        setRevenueData(revenueResponse.data)
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err)
        setError(err.response?.data?.error || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  if (loading) {
    return (
      <div className="manager-dashboard">
        <div className="dashboard-header">
          <h1>Manager Dashboard</h1>
          <p className="welcome-message">Welcome back, {user?.username}!</p>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="manager-dashboard">
        <div className="dashboard-header">
          <h1>Manager Dashboard</h1>
          <p className="welcome-message">Welcome back, {user?.username}!</p>
        </div>
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Failed to Load Dashboard</h3>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="manager-dashboard">
      {/* Header with Key Stats */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Manager Dashboard</h1>
            <p className="welcome-message">Welcome back, {user?.username}!</p>
          </div>
          <div className="header-stats">
            <div className="header-stat-card">
              <div className="stat-icon orders-icon">📦</div>
              <div className="stat-content">
                <span className="stat-value">{metrics?.orders?.total || 0}</span>
                <span className="stat-title">Total Orders</span>
              </div>
            </div>
            <div className="header-stat-card">
              <div className="stat-icon revenue-icon">💰</div>
              <div className="stat-content">
                <span className="stat-value">{formatCurrency(metrics?.revenue?.total || 0)}</span>
                <span className="stat-title">Total Revenue</span>
              </div>
            </div>
            <div className="header-stat-card">
              <div className="stat-icon users-icon">👥</div>
              <div className="stat-content">
                <span className="stat-value">{metrics?.customers?.active || 0}</span>
                <span className="stat-title">Active Users</span>
              </div>
            </div>
            <div className="header-stat-card">
              <div className="stat-icon vendors-icon">🏪</div>
              <div className="stat-content">
                <span className="stat-value">{metrics?.businesses?.active || 0}</span>
                <span className="stat-title">Active Vendors</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Order Fulfillment Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">📋 Order Fulfillment</h2>
            <span className="section-badge">Operations</span>
          </div>
          <div className="metrics-row">
            <MetricCard
              title="Pending Orders"
              value={metrics?.orders?.pending?.toLocaleString() || '0'}
              iconType="order"
              trend={{
                value: -5,
                direction: 'down'
              }}
              permission={Permission.VIEW_ORDERS}
            />
            <MetricCard
              title="Cancelled Orders"
              value={metrics?.orders?.cancelled?.toLocaleString() || '0'}
              iconType="order"
              permission={Permission.VIEW_ORDERS}
            />
            <MetricCard
              title="Delayed Orders"
              value={metrics?.operational_insights?.delayed_orders?.toLocaleString() || '0'}
              iconType="order"
              permission={Permission.VIEW_ORDERS}
            />
            <MetricCard
              title="Active Delivery Partners"
              value={metrics?.delivery_partners?.active?.toLocaleString() || '0'}
              iconType="delivery"
              permission={Permission.VIEW_DELIVERY_PARTNERS}
            />
          </div>
        </div>

        {/* Revenue Analytics Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">📊 Revenue Analytics</h2>
            <span className="section-badge">Financial</span>
          </div>
          <div className="revenue-section">
            <div className="revenue-metrics">
              <MetricCard
                title="Revenue Trend (Daily)"
                value={`${metrics?.performance?.revenue_trend?.daily || 0}%`}
                iconType="chart"
                trend={{
                  value: metrics?.performance?.revenue_trend?.daily || 0,
                  direction: (metrics?.performance?.revenue_trend?.daily || 0) >= 0 ? 'up' : 'down'
                }}
                permission={Permission.VIEW_REVENUE}
              />
              <MetricCard
                title="Revenue Trend (Weekly)"
                value={`${metrics?.performance?.revenue_trend?.weekly || 0}%`}
                iconType="chart"
                trend={{
                  value: metrics?.performance?.revenue_trend?.weekly || 0,
                  direction: (metrics?.performance?.revenue_trend?.weekly || 0) >= 0 ? 'up' : 'down'
                }}
                permission={Permission.VIEW_REVENUE}
              />
              <MetricCard
                title="Revenue Trend (Monthly)"
                value={`${metrics?.performance?.revenue_trend?.monthly || 0}%`}
                iconType="chart"
                trend={{
                  value: metrics?.performance?.revenue_trend?.monthly || 0,
                  direction: (metrics?.performance?.revenue_trend?.monthly || 0) >= 0 ? 'up' : 'down'
                }}
                permission={Permission.VIEW_REVENUE}
              />
            </div>
            {revenueData && (
              <div className="revenue-chart-container">
                <RevenueChart data={revenueData.data} />
              </div>
            )}
          </div>
        </div>

        {/* City/Zone Performance Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">🗺️ City/Zone Performance</h2>
            <span className="section-badge">Geography</span>
          </div>
          <div className="zone-performance">
            {metrics?.performance?.city_zone_performance?.map((zone, index) => (
              <div key={index} className="zone-card">
                <div className="zone-header">
                  <h4>{zone.zone}</h4>
                  <span className={`performance-score ${zone.performance_score >= 80 ? 'high' : zone.performance_score >= 60 ? 'medium' : 'low'}`}>
                    {zone.performance_score}%
                  </span>
                </div>
                <div className="zone-orders">
                  <span className="orders-count">{zone.orders.toLocaleString()}</span>
                  <span className="orders-label">Orders</span>
                </div>
              </div>
            )) || (
              <div className="zone-card">
                <div className="zone-header">
                  <h4>Downtown</h4>
                  <span className="performance-score high">85%</span>
                </div>
                <div className="zone-orders">
                  <span className="orders-count">1,245</span>
                  <span className="orders-label">Orders</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Peak Order Hours Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">⏰ Peak Order Hours</h2>
            <span className="section-badge">Timing</span>
          </div>
          <div className="peak-hours">
            {metrics?.performance?.peak_order_hours?.map((hour, index) => (
              <div key={index} className="hour-card">
                <div className="hour-time">{hour}</div>
                <div className="hour-label">Peak Hour</div>
              </div>
            )) || (
              <>
                <div className="hour-card">
                  <div className="hour-time">12:00 PM</div>
                  <div className="hour-label">Lunch Rush</div>
                </div>
                <div className="hour-card">
                  <div className="hour-time">7:00 PM</div>
                  <div className="hour-label">Dinner Rush</div>
                </div>
                <div className="hour-card">
                  <div className="hour-time">9:00 PM</div>
                  <div className="hour-label">Evening Peak</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Operational Insights Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">🔍 Operational Insights</h2>
            <span className="section-badge">Analytics</span>
          </div>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-icon">📈</div>
              <div className="insight-content">
                <h4>Order Efficiency</h4>
                <p>Average delivery time: 28 minutes</p>
                <span className="insight-trend positive">↗ 12% improvement</span>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">🚚</div>
              <div className="insight-content">
                <h4>Delivery Performance</h4>
                <p>On-time delivery rate: 94%</p>
                <span className="insight-trend positive">↗ 3% increase</span>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">⭐</div>
              <div className="insight-content">
                <h4>Customer Satisfaction</h4>
                <p>Average rating: 4.7/5</p>
                <span className="insight-trend positive">↗ 0.2 points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Support Tickets Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">🎫 Support Tickets</h2>
            <span className="section-badge">Support</span>
          </div>
          <div className="metrics-row">
            <MetricCard
              title="Open Tickets"
              value={metrics?.support_tickets?.open?.toLocaleString() || '23'}
              iconType="support"
              permission={Permission.MANAGE_NOTIFICATIONS}
            />
            <MetricCard
              title="Resolved Tickets"
              value={metrics?.support_tickets?.resolved?.toLocaleString() || '156'}
              iconType="support"
              permission={Permission.MANAGE_NOTIFICATIONS}
            />
            <MetricCard
              title="KYC Pending Approval"
              value={metrics?.support_tickets?.pending_approval?.toLocaleString() || '8'}
              iconType="kyc"
              permission={Permission.VIEW_KYC_QUEUE}
            />
            <MetricCard
              title="Finance Settlements Pending"
              value={metrics?.support_tickets?.finance_settlements_pending?.toLocaleString() || '12'}
              iconType="finance"
              permission={Permission.VIEW_FINANCIAL_REPORTS}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManagerDashboard