import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './TotalRevenuePage.css'

interface RevenueData {
  total_revenue: number
  categories: {
    food: {
      amount: number
      percentage: number
      growth: number
      orders: number
    }
    retail: {
      amount: number
      percentage: number
      growth: number
      orders: number
    }
    pharmacy: {
      amount: number
      percentage: number
      growth: number
      orders: number
    }
  }
  monthly_trend: Array<{
    month: string
    food: number
    retail: number
    pharmacy: number
    total: number
  }>
  top_performing_items: Array<{
    name: string
    category: string
    revenue: number
    orders: number
  }>
}

const TotalRevenuePage: React.FC = () => {
  const { user } = useAuth()
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'food' | 'retail' | 'pharmacy'>('all')

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true)
        
        // Mock data - in real app this would come from API
        const mockData: RevenueData = {
          total_revenue: 255000,
          categories: {
            food: {
              amount: 125000,
              percentage: 49,
              growth: 15.2,
              orders: 8450
            },
            retail: {
              amount: 85000,
              percentage: 33,
              growth: 8.7,
              orders: 3200
            },
            pharmacy: {
              amount: 45000,
              percentage: 18,
              growth: 22.1,
              orders: 1850
            }
          },
          monthly_trend: [
            { month: 'Jan', food: 98000, retail: 72000, pharmacy: 38000, total: 208000 },
            { month: 'Feb', food: 125000, retail: 85000, pharmacy: 45000, total: 255000 },
            { month: 'Mar', food: 115000, retail: 78000, pharmacy: 42000, total: 235000 },
            { month: 'Apr', food: 132000, retail: 92000, pharmacy: 48000, total: 272000 },
            { month: 'May', food: 128000, retail: 88000, pharmacy: 46000, total: 262000 },
            { month: 'Jun', food: 135000, retail: 95000, pharmacy: 52000, total: 282000 }
          ],
          top_performing_items: [
            { name: 'Premium Burger Combo', category: 'food', revenue: 15420, orders: 1285 },
            { name: 'Wireless Headphones', category: 'retail', revenue: 12850, orders: 428 },
            { name: 'Vitamin D Supplements', category: 'pharmacy', revenue: 8950, orders: 895 },
            { name: 'Pizza Margherita', category: 'food', revenue: 11200, orders: 1400 },
            { name: 'Smartphone Case', category: 'retail', revenue: 7650, orders: 765 }
          ]
        }
        
        setRevenueData(mockData)
      } catch (error) {
        console.error('Failed to fetch revenue data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRevenueData()
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

  const getCategoryIcon = (category: string): JSX.Element => {
    switch (category) {
      case 'food':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.5 8.5C8.5 9.60457 7.60457 10.5 6.5 10.5C5.39543 10.5 4.5 9.60457 4.5 8.5C4.5 7.39543 5.39543 6.5 6.5 6.5C7.60457 6.5 8.5 7.39543 8.5 8.5Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M19.5 8.5C19.5 9.60457 18.6046 10.5 17.5 10.5C16.3954 10.5 15.5 9.60457 15.5 8.5C15.5 7.39543 16.3954 6.5 17.5 6.5C18.6046 6.5 19.5 7.39543 19.5 8.5Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M6.5 10.5V20.5H17.5V10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M8 14H16M8 17H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )
      case 'retail':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 7H16V6C16 4.34315 14.6569 3 13 3H11C9.34315 3 8 4.34315 8 6V7H5C3.89543 7 3 7.89543 3 9V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V9C21 7.89543 20.1046 7 19 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 7V6C10 5.44772 10.4477 5 11 5H13C13.5523 5 14 5.44772 14 6V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      case 'pharmacy':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.5 12.75L6 11.25L10.5 15.75L18 8.25L19.5 9.75L10.5 18.75L4.5 12.75Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      default:
        return <span></span>
    }
  }

  if (loading) {
    return (
      <div className="revenue-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading revenue data...</p>
        </div>
      </div>
    )
  }

  if (!revenueData) {
    return (
      <div className="revenue-page">
        <div className="error-state">
          <div className="error-icon"></div>
          <h3>No Data Available</h3>
          <p>Unable to load revenue data at this time.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="revenue-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-info">
            <div className="header-text">
              <h1>Total Revenue</h1>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <span className="stat-value">{formatCurrency(revenueData.total_revenue)}</span>
              <span className="stat-label">Total Revenue</span>
            </div>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Category Overview */}
        <div className="categories-section">
          <h3>Revenue by Category</h3>
          <div className="categories-grid">
            <div className="category-card food">
              <div className="category-header">
                <div className="category-info">
                  <h4>Food & Beverages</h4>
                  <span className="category-percentage">{revenueData.categories.food.percentage}%</span>
                </div>
              </div>
              <div className="category-metrics">
                <div className="metric">
                  <span className="metric-value">{formatCurrency(revenueData.categories.food.amount)}</span>
                  <span className="metric-label">Revenue</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{formatNumber(revenueData.categories.food.orders)}</span>
                  <span className="metric-label">Orders</span>
                </div>
                <div className="metric">
                  <span className="metric-value growth positive">+{revenueData.categories.food.growth}%</span>
                  <span className="metric-label">Growth</span>
                </div>
              </div>
            </div>

            <div className="category-card retail">
              <div className="category-header">
                <div className="category-info">
                  <h4>Retail & Shopping</h4>
                  <span className="category-percentage">{revenueData.categories.retail.percentage}%</span>
                </div>
              </div>
              <div className="category-metrics">
                <div className="metric">
                  <span className="metric-value">{formatCurrency(revenueData.categories.retail.amount)}</span>
                  <span className="metric-label">Revenue</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{formatNumber(revenueData.categories.retail.orders)}</span>
                  <span className="metric-label">Orders</span>
                </div>
                <div className="metric">
                  <span className="metric-value growth positive">+{revenueData.categories.retail.growth}%</span>
                  <span className="metric-label">Growth</span>
                </div>
              </div>
            </div>

            <div className="category-card pharmacy">
              <div className="category-header">
                <div className="category-info">
                  <h4>Pharmacy & Health</h4>
                  <span className="category-percentage">{revenueData.categories.pharmacy.percentage}%</span>
                </div>
              </div>
              <div className="category-metrics">
                <div className="metric">
                  <span className="metric-value">{formatCurrency(revenueData.categories.pharmacy.amount)}</span>
                  <span className="metric-label">Revenue</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{formatNumber(revenueData.categories.pharmacy.orders)}</span>
                  <span className="metric-label">Orders</span>
                </div>
                <div className="metric">
                  <span className="metric-value growth positive">+{revenueData.categories.pharmacy.growth}%</span>
                  <span className="metric-label">Growth</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div className="trend-section">
          <h3>Monthly Revenue Trend</h3>
          <div className="trend-chart">
            {revenueData.monthly_trend.map((item, index) => (
              <div key={index} className="trend-bar-group">
                <div className="trend-bars">
                  <div 
                    className="trend-bar food" 
                    style={{ height: `${(item.food / 150000) * 100}%` }}
                    title={`Food: ${formatCurrency(item.food)}`}
                  ></div>
                  <div 
                    className="trend-bar retail" 
                    style={{ height: `${(item.retail / 150000) * 100}%` }}
                    title={`Retail: ${formatCurrency(item.retail)}`}
                  ></div>
                  <div 
                    className="trend-bar pharmacy" 
                    style={{ height: `${(item.pharmacy / 150000) * 100}%` }}
                    title={`Pharmacy: ${formatCurrency(item.pharmacy)}`}
                  ></div>
                </div>
                <span className="trend-label">{item.month}</span>
                <span className="trend-total">{formatCurrency(item.total)}</span>
              </div>
            ))}
          </div>
          <div className="trend-legend">
            <div className="legend-item">
              <div className="legend-color food"></div>
              <span>Food & Beverages</span>
            </div>
            <div className="legend-item">
              <div className="legend-color retail"></div>
              <span>Retail & Shopping</span>
            </div>
            <div className="legend-item">
              <div className="legend-color pharmacy"></div>
              <span>Pharmacy & Health</span>
            </div>
          </div>
        </div>

        {/* Top Performing Items */}
        <div className="top-items-section">
          <h3>Top Performing Items</h3>
          <div className="items-grid">
            {revenueData.top_performing_items.map((item, index) => (
              <div key={index} className={`item-card ${item.category}`}>
                <div className="item-rank">#{index + 1}</div>
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <span className="item-category">{item.category}</span>
                </div>
                <div className="item-metrics">
                  <div className="item-revenue">{formatCurrency(item.revenue)}</div>
                  <div className="item-orders">{formatNumber(item.orders)} orders</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TotalRevenuePage