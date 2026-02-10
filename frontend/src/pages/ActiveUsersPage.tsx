import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './ActiveUsersPage.css'

interface UserData {
  total_users: number
  active_users: number
  new_users_today: number
  growth_rate: number
  user_activity: Array<{
    date: string
    active: number
    new: number
  }>
  top_users: Array<{
    id: string
    name: string
    orders: number
    revenue: number
    last_active: string
  }>
}

const ActiveUsersPage: React.FC = () => {
  const { user } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        
        // Mock data
        const mockData: UserData = {
          total_users: 12450,
          active_users: 8920,
          new_users_today: 145,
          growth_rate: 12.3,
          user_activity: [
            { date: '2026-02-03', active: 7850, new: 120 },
            { date: '2026-02-04', active: 8100, new: 135 },
            { date: '2026-02-05', active: 7920, new: 110 },
            { date: '2026-02-06', active: 8450, new: 150 },
            { date: '2026-02-07', active: 8650, new: 140 },
            { date: '2026-02-08', active: 8820, new: 155 },
            { date: '2026-02-09', active: 8920, new: 145 }
          ],
          top_users: [
            { id: 'U001', name: 'John Smith', orders: 45, revenue: 2850, last_active: '2 hours ago' },
            { id: 'U002', name: 'Sarah Johnson', orders: 38, revenue: 2450, last_active: '1 hour ago' },
            { id: 'U003', name: 'Mike Wilson', orders: 35, revenue: 2200, last_active: '3 hours ago' },
            { id: 'U004', name: 'Emily Brown', orders: 32, revenue: 2100, last_active: '30 mins ago' },
            { id: 'U005', name: 'David Lee', orders: 28, revenue: 1950, last_active: '4 hours ago' }
          ]
        }
        
        setUserData(mockData)
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  if (loading) {
    return (
      <div className="active-users-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading user data...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="active-users-page">
        <div className="error-state">
          <div className="error-icon"></div>
          <h3>No Data Available</h3>
          <p>Unable to load user data at this time.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="active-users-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Active Users</h1>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <span className="stat-value">{formatNumber(userData.active_users)}</span>
              <span className="stat-label">Active Users</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">+{userData.growth_rate}%</span>
              <span className="stat-label">Growth Rate</span>
            </div>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="metrics-section">
          <div className="metric-box">
            <h3>Total Users</h3>
            <p className="metric-number">{formatNumber(userData.total_users)}</p>
          </div>
          <div className="metric-box">
            <h3>Active Today</h3>
            <p className="metric-number">{formatNumber(userData.active_users)}</p>
          </div>
          <div className="metric-box">
            <h3>New Users Today</h3>
            <p className="metric-number">{formatNumber(userData.new_users_today)}</p>
          </div>
        </div>

        <div className="activity-chart-section">
          <h3>User Activity (Last 7 Days)</h3>
          <div className="activity-chart">
            {userData.user_activity.map((item, index) => (
              <div key={index} className="chart-bar-group">
                <div className="chart-bar" style={{ height: `${(item.active / 10000) * 100}%` }}>
                  <span className="bar-value">{formatNumber(item.active)}</span>
                </div>
                <span className="bar-label">{new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="top-users-section">
          <h3>Top Active Users</h3>
          <div className="users-table">
            <div className="table-header">
              <span>User ID</span>
              <span>Name</span>
              <span>Orders</span>
              <span>Revenue</span>
              <span>Last Active</span>
            </div>
            {userData.top_users.map((user) => (
              <div key={user.id} className="table-row">
                <span className="user-id">{user.id}</span>
                <span className="user-name">{user.name}</span>
                <span className="user-orders">{user.orders}</span>
                <span className="user-revenue">{formatCurrency(user.revenue)}</span>
                <span className="user-active">{user.last_active}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActiveUsersPage
