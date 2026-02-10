import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Permission, RevenueResponse, DailyRevenue } from '../types'
import RevenueChart from '../components/RevenueChart'
import apiClient from '../utils/apiClient'
import './RevenueReportsPage.css'

type TimeRange = 'day' | 'week' | 'month' | 'year'

const RevenueReportsPage: React.FC = () => {
  const { hasPermission } = useAuth()
  const [timeRange, setTimeRange] = useState<TimeRange>('week')
  const [revenueData, setRevenueData] = useState<DailyRevenue[]>([])
  const [totalRevenue, setTotalRevenue] = useState<number>(0)
  const [averageRevenue, setAverageRevenue] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Check permissions
  const canViewRevenue = hasPermission(Permission.VIEW_REVENUE) || hasPermission(Permission.MANAGE_USERS)

  useEffect(() => {
    if (canViewRevenue) {
      fetchRevenueData()
    }
  }, [timeRange, canViewRevenue])

  const fetchRevenueData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.get<RevenueResponse>('/metrics/revenue', {
        params: { time_range: timeRange }
      })

      setRevenueData(response.data.data)
      setTotalRevenue(response.data.total)
      setAverageRevenue(response.data.average)
    } catch (err: any) {
      console.error('Error fetching revenue data:', err)
      setError(err.response?.data?.error || 'Failed to load revenue data')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  if (!canViewRevenue) {
    return (
      <div className="revenue-reports-page">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You do not have permission to view revenue reports.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="revenue-reports-page">
      <div className="page-header">
        <h2>Revenue Reports</h2>
        <div className="time-range-selector">
          <label htmlFor="time-range">Time Range:</label>
          <select
            id="time-range"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="time-range-select"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <p>Loading revenue data...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p className="error-message">{error}</p>
          <button onClick={fetchRevenueData} className="btn-retry">
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="revenue-summary">
            <div className="summary-card">
              <h3>Total Revenue</h3>
              <p className="summary-value">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="summary-card">
              <h3>Average Revenue</h3>
              <p className="summary-value">{formatCurrency(averageRevenue)}</p>
            </div>
            <div className="summary-card">
              <h3>Total Orders</h3>
              <p className="summary-value">
                {revenueData.reduce((sum, item) => sum + item.orders, 0)}
              </p>
            </div>
          </div>

          <div className="chart-container">
            <RevenueChart data={revenueData} timeRange={timeRange} />
          </div>
        </>
      )}
    </div>
  )
}

export default RevenueReportsPage
