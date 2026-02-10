import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './OrderFulfillmentPage.css'

interface FulfillmentData {
  overall_rate: number
  total_orders: number
  fulfilled_orders: number
  pending_orders: number
  delayed_orders: number
  category_rates: {
    food: number
    retail: number
    pharmacy: number
  }
  daily_performance: Array<{
    date: string
    rate: number
    orders: number
  }>
}

const OrderFulfillmentPage: React.FC = () => {
  const { user } = useAuth()
  const [fulfillmentData, setFulfillmentData] = useState<FulfillmentData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFulfillmentData = async () => {
      try {
        setLoading(true)
        
        // Mock data
        const mockData: FulfillmentData = {
          overall_rate: 94.5,
          total_orders: 15420,
          fulfilled_orders: 14570,
          pending_orders: 650,
          delayed_orders: 200,
          category_rates: {
            food: 96.2,
            retail: 93.8,
            pharmacy: 92.5
          },
          daily_performance: [
            { date: '2026-02-03', rate: 93.2, orders: 2100 },
            { date: '2026-02-04', rate: 94.1, orders: 2250 },
            { date: '2026-02-05', rate: 92.8, orders: 2050 },
            { date: '2026-02-06', rate: 95.3, orders: 2400 },
            { date: '2026-02-07', rate: 94.7, orders: 2300 },
            { date: '2026-02-08', rate: 95.8, orders: 2450 },
            { date: '2026-02-09', rate: 94.5, orders: 2200 }
          ]
        }
        
        setFulfillmentData(mockData)
      } catch (error) {
        console.error('Failed to fetch fulfillment data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFulfillmentData()
  }, [])

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  if (loading) {
    return (
      <div className="fulfillment-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading fulfillment data...</p>
        </div>
      </div>
    )
  }

  if (!fulfillmentData) {
    return (
      <div className="fulfillment-page">
        <div className="error-state">
          <div className="error-icon"></div>
          <h3>No Data Available</h3>
          <p>Unable to load fulfillment data at this time.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fulfillment-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Order Fulfillment</h1>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <span className="stat-value">{fulfillmentData.overall_rate}%</span>
              <span className="stat-label">Fulfillment Rate</span>
            </div>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="metrics-section">
          <div className="metric-box total">
            <h3>Total Orders</h3>
            <p className="metric-number">{formatNumber(fulfillmentData.total_orders)}</p>
          </div>
          <div className="metric-box fulfilled">
            <h3>Fulfilled Orders</h3>
            <p className="metric-number">{formatNumber(fulfillmentData.fulfilled_orders)}</p>
          </div>
          <div className="metric-box pending">
            <h3>Pending Orders</h3>
            <p className="metric-number">{formatNumber(fulfillmentData.pending_orders)}</p>
          </div>
          <div className="metric-box delayed">
            <h3>Delayed Orders</h3>
            <p className="metric-number">{formatNumber(fulfillmentData.delayed_orders)}</p>
          </div>
        </div>

        <div className="category-rates-section">
          <h3>Fulfillment Rate by Category</h3>
          <div className="category-grid">
            <div className="category-rate-card food">
              <h4>Food & Beverages</h4>
              <div className="rate-circle">
                <span className="rate-value">{fulfillmentData.category_rates.food}%</span>
              </div>
            </div>
            <div className="category-rate-card retail">
              <h4>Retail & Shopping</h4>
              <div className="rate-circle">
                <span className="rate-value">{fulfillmentData.category_rates.retail}%</span>
              </div>
            </div>
            <div className="category-rate-card pharmacy">
              <h4>Pharmacy & Health</h4>
              <div className="rate-circle">
                <span className="rate-value">{fulfillmentData.category_rates.pharmacy}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="performance-chart-section">
          <h3>Daily Performance (Last 7 Days)</h3>
          <div className="performance-chart">
            {fulfillmentData.daily_performance.map((item, index) => (
              <div key={index} className="chart-bar-group">
                <div className="chart-bar" style={{ height: `${item.rate}%` }}>
                  <span className="bar-value">{item.rate}%</span>
                </div>
                <span className="bar-label">{new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                <span className="bar-orders">{formatNumber(item.orders)} orders</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderFulfillmentPage
