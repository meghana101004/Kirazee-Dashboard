import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import MetricCard from '../components/MetricCard'
import apiClient from '../utils/apiClient'
import { MetricsOverviewResponse, Permission } from '../types'
import './DashboardHome.css'

const DashboardHome: React.FC = () => {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<MetricsOverviewResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiClient.get<MetricsOverviewResponse>('/metrics/overview')
        setMetrics(response.data)
      } catch (err: any) {
        console.error('Failed to fetch metrics:', err)
        setError(err.response?.data?.error || 'Failed to load dashboard metrics')
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  if (loading) {
    return (
      <div className="dashboard-home">
        <div className="dashboard-home-header">
          <h1>Dashboard</h1>
          <p className="welcome-message">Welcome back, {user?.username}!</p>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading dashboard metrics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-home">
        <div className="dashboard-home-header">
          <h1>Dashboard</h1>
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
    <div className="dashboard-home">
      <div className="dashboard-home-header">
        <div className="header-stat-card">
          <div className="stat-icon orders-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{metrics?.orders?.total || 0}</span>
            <span className="stat-title">Total Orders</span>
          </div>
        </div>
        <div className="header-stat-card">
          <div className="stat-icon business-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{metrics?.businesses?.active || 0}</span>
            <span className="stat-title">Active Businesses</span>
          </div>
        </div>
        <div className="header-stat-card">
          <div className="stat-icon customers-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{metrics?.customers?.active || 0}</span>
            <span className="stat-title">Active Customers</span>
          </div>
        </div>
      </div>

      <div className="dashboard-home-content">
        {/* Revenue Section */}
        {metrics?.revenue && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Revenue Analytics</h2>
              <span className="section-badge">Financial</span>
            </div>
            <div className="metrics-row">
              <MetricCard
                title="Total Revenue"
                value={formatCurrency(metrics.revenue.total)}
                iconType="revenue"
                trend={{
                  value: metrics.revenue.trend,
                  direction: metrics.revenue.trend >= 0 ? 'up' : 'down',
                }}
                permission={Permission.VIEW_REVENUE}
              />
              <MetricCard
                title="Average Order Value"
                value={formatCurrency(metrics.revenue.average_order_value)}
                iconType="chart"
                permission={Permission.VIEW_REVENUE}
              />
            </div>
          </div>
        )}

        {/* Orders Section */}
        {metrics?.orders && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Order Management</h2>
              <span className="section-badge">Operations</span>
            </div>
            <div className="metrics-row">
              <MetricCard
                title="Total Orders"
                value={metrics.orders.total.toLocaleString()}
                iconType="order"
                permission={Permission.VIEW_ORDERS}
              />
              <MetricCard
                title="Pending Orders"
                value={metrics.orders.pending.toLocaleString()}
                iconType="order"
                permission={Permission.VIEW_ORDERS}
              />
              <MetricCard
                title="Completed Orders"
                value={metrics.orders.completed.toLocaleString()}
                iconType="order"
                permission={Permission.VIEW_ORDERS}
              />
              <MetricCard
                title="Cancelled Orders"
                value={metrics.orders.cancelled.toLocaleString()}
                iconType="order"
                permission={Permission.VIEW_ORDERS}
              />
            </div>
          </div>
        )}

        {/* Business & Partners Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Business & Partners</h2>
            <span className="section-badge">Network</span>
          </div>
          <div className="metrics-row">
            {metrics?.businesses && (
              <>
                <MetricCard
                  title="Active Businesses"
                  value={metrics.businesses.active.toLocaleString()}
                  iconType="business"
                  permission={Permission.VIEW_BUSINESSES}
                />
                <MetricCard
                  title="Pending Approval"
                  value={metrics.businesses.pending_approval.toLocaleString()}
                  iconType="business"
                  permission={Permission.VIEW_BUSINESSES}
                />
              </>
            )}
            {metrics?.delivery_partners && (
              <>
                <MetricCard
                  title="Active Delivery Partners"
                  value={metrics.delivery_partners.active.toLocaleString()}
                  iconType="delivery"
                  permission={Permission.VIEW_DELIVERY_PARTNERS}
                />
                <MetricCard
                  title="Available Partners"
                  value={metrics.delivery_partners.available.toLocaleString()}
                  iconType="delivery"
                  permission={Permission.VIEW_DELIVERY_PARTNERS}
                />
              </>
            )}
          </div>
        </div>

        {/* Customer & KYC Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Customer & Verification</h2>
            <span className="section-badge">Users</span>
          </div>
          <div className="metrics-row">
            {metrics?.customers && (
              <>
                <MetricCard
                  title="Unique Customers"
                  value={metrics.customers.unique.toLocaleString()}
                  iconType="customer"
                  permission={Permission.VIEW_CUSTOMERS}
                />
                <MetricCard
                  title="Active Customers"
                  value={metrics.customers.active.toLocaleString()}
                  iconType="customer"
                  permission={Permission.VIEW_CUSTOMERS}
                />
              </>
            )}
            {metrics?.kyc_pending && (
              <>
                <MetricCard
                  title="Business KYC Pending"
                  value={metrics.kyc_pending.businesses.toLocaleString()}
                  icon="📋"
                  permission={Permission.VIEW_KYC_QUEUE}
                />
                <MetricCard
                  title="Delivery Partner KYC Pending"
                  value={metrics.kyc_pending.delivery_partners.toLocaleString()}
                  icon="🆔"
                  permission={Permission.VIEW_KYC_QUEUE}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome
