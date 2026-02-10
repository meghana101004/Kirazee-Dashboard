import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './ManagerDashboard.css'

interface OrderStats {
    today: number
    week: number
    month: number
    year: number
}

interface RevenueByCategory {
    food: number
    retail: number
    pharmacy: number
}

interface OperationalInsights {
    pending_orders: number
    cancelled_orders: number
    delayed_orders: number
    active_orders: number
}

interface TeamManagement {
    support_tickets_opened: number
    support_tickets_resolved: number
    kyc_pending: number
    kyc_approved: number
    finance_settlements_pending: number
}

interface BusinessAnalytics {
    revenue_trend: Array<{ date: string; revenue: number }>
    peak_order_hours: Array<{ hour: string; orders: number }>
}

interface ManagerDashboardData {
    total_orders: OrderStats
    total_revenue: RevenueByCategory
    active_users: number
    order_fulfillment_rate: number
    operational_insights: OperationalInsights
    team_management: TeamManagement
    business_analytics: BusinessAnalytics
}

const ManagerDashboard: React.FC = () => {
    const { user } = useAuth()
    const [dashboardData, setDashboardData] = useState<ManagerDashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('today')

    useEffect(() => {
        // Simulate API call with mock data for manager dashboard
        const fetchManagerData = async () => {
            try {
                setLoading(true)

                // Mock data - in real app this would come from API
                const mockData: ManagerDashboardData = {
                    total_orders: {
                        today: 245,
                        week: 1680,
                        month: 7250,
                        year: 89400
                    },
                    total_revenue: {
                        food: 125000,
                        retail: 85000,
                        pharmacy: 45000
                    },
                    active_users: 12450,
                    order_fulfillment_rate: 94.5,
                    operational_insights: {
                        pending_orders: 23,
                        cancelled_orders: 12,
                        delayed_orders: 8,
                        active_orders: 156
                    },
                    team_management: {
                        support_tickets_opened: 45,
                        support_tickets_resolved: 38,
                        kyc_pending: 15,
                        kyc_approved: 28,
                        finance_settlements_pending: 7
                    },
                    business_analytics: {
                        revenue_trend: [
                            { date: '2026-02-03', revenue: 12500 },
                            { date: '2026-02-04', revenue: 13200 },
                            { date: '2026-02-05', revenue: 11800 },
                            { date: '2026-02-06', revenue: 14500 },
                            { date: '2026-02-07', revenue: 13900 },
                            { date: '2026-02-08', revenue: 15200 },
                            { date: '2026-02-09', revenue: 14800 },
                            { date: '2026-02-10', revenue: 16100 }
                        ],
                        peak_order_hours: [
                            { hour: '12:00 PM', orders: 89 },
                            { hour: '1:00 PM', orders: 76 },
                            { hour: '7:00 PM', orders: 94 },
                            { hour: '8:00 PM', orders: 82 }
                        ]
                    }
                }

                setDashboardData(mockData)
            } catch (error) {
                console.error('Failed to fetch manager dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchManagerData()
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

    if (!dashboardData) {
        return (
            <div className="manager-dashboard">
                <div className="dashboard-header">
                    <h1>Manager Dashboard</h1>
                    <p className="welcome-message">Welcome back, {user?.username}!</p>
                </div>
                <div className="error-state">
                    <div className="error-icon"></div>
                    <h3>No Data Available</h3>
                    <p>Unable to load dashboard data at this time.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="manager-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="header-text">
                        <h1>Business Overview</h1>
                        <p className="welcome-message">Welcome back, {user?.username}! Here's your business performance summary.</p>
                    </div>
                    <div className="time-range-selector">
                        <button
                            className={selectedTimeRange === 'today' ? 'active' : ''}
                            onClick={() => setSelectedTimeRange('today')}
                        >
                            Today
                        </button>
                        <button
                            className={selectedTimeRange === 'week' ? 'active' : ''}
                            onClick={() => setSelectedTimeRange('week')}
                        >
                            Week
                        </button>
                        <button
                            className={selectedTimeRange === 'month' ? 'active' : ''}
                            onClick={() => setSelectedTimeRange('month')}
                        >
                            Month
                        </button>
                        <button
                            className={selectedTimeRange === 'year' ? 'active' : ''}
                            onClick={() => setSelectedTimeRange('year')}
                        >
                            Year
                        </button>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                {/* 1. Total Orders Section */}
                <div id="total-orders" className="dashboard-section">
                    <div className="section-header">
                        <h2 className="section-title">Total Orders</h2>
                        <span className="section-badge">Orders</span>
                    </div>
                    <div className="metrics-grid">
                        <div className="metric-card">
                            <div className="metric-icon"></div>
                            <div className="metric-content">
                                <h3>{formatNumber(dashboardData.total_orders.today)}</h3>
                                <p>Today</p>
                            </div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-icon"></div>
                            <div className="metric-content">
                                <h3>{formatNumber(dashboardData.total_orders.week)}</h3>
                                <p>This Week</p>
                            </div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-icon"></div>
                            <div className="metric-content">
                                <h3>{formatNumber(dashboardData.total_orders.month)}</h3>
                                <p>This Month</p>
                            </div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-icon"></div>
                            <div className="metric-content">
                                <h3>{formatNumber(dashboardData.total_orders.year)}</h3>
                                <p>This Year</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Total Revenue by Categories */}
                <div id="total-revenue" className="dashboard-section">
                    <div className="section-header">
                        <h2 className="section-title">Total Revenue by Category</h2>
                        <span className="section-badge">Revenue</span>
                    </div>
                    <div className="revenue-categories">
                        <div className="category-card food">
                            <div className="category-icon"></div>
                            <div className="category-content">
                                <h3>{formatCurrency(dashboardData.total_revenue.food)}</h3>
                                <p>Food & Beverages</p>
                                <span className="category-percentage">49%</span>
                            </div>
                        </div>
                        <div className="category-card retail">
                            <div className="category-icon"></div>
                            <div className="category-content">
                                <h3>{formatCurrency(dashboardData.total_revenue.retail)}</h3>
                                <p>Retail & Shopping</p>
                                <span className="category-percentage">33%</span>
                            </div>
                        </div>
                        <div className="category-card pharmacy">
                            <div className="category-icon"></div>
                            <div className="category-content">
                                <h3>{formatCurrency(dashboardData.total_revenue.pharmacy)}</h3>
                                <p>Pharmacy & Health</p>
                                <span className="category-percentage">18%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Active Users & Order Fulfillment */}
                <div id="active-users" className="dashboard-section">
                    <div className="section-header">
                        <h2 className="section-title">User Metrics & Fulfillment</h2>
                        <span className="section-badge">Performance</span>
                    </div>
                    <div className="metrics-grid">
                        <div id="order-fulfillment" className="metric-card large">
                            <div className="metric-icon"></div>
                            <div className="metric-content">
                                <h3>{formatNumber(dashboardData.active_users)}</h3>
                                <p>Active Users</p>
                                <span className="trend positive">↗ +12% from last month</span>
                            </div>
                        </div>
                        <div className="metric-card large">
                            <div className="metric-icon"></div>
                            <div className="metric-content">
                                <h3>{dashboardData.order_fulfillment_rate}%</h3>
                                <p>Order Fulfillment Rate</p>
                                <span className="trend positive">↗ +2.3% from last week</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Business Analysis */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2 className="section-title">Business Analysis</h2>
                        <span className="section-badge">Analytics</span>
                    </div>
                    <div className="business-analysis">
                        <div className="revenue-trend-chart">
                            <h4>Revenue Trend (Last 7 Days)</h4>
                            <div className="chart-container">
                                {dashboardData.business_analytics.revenue_trend.map((item, index) => (
                                    <div key={index} className="chart-bar">
                                        <div
                                            className="bar"
                                            style={{ height: `${(item.revenue / 20000) * 100}%` }}
                                        ></div>
                                        <span className="bar-label">{new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                        <span className="bar-value">{formatCurrency(item.revenue)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="peak-hours-analysis">
                            <h4>Peak Order Hours</h4>
                            <div className="peak-hours-grid">
                                {dashboardData.business_analytics.peak_order_hours.map((item, index) => (
                                    <div key={index} className="peak-hour-card">
                                        <div className="hour-time">{item.hour}</div>
                                        <div className="hour-orders">{item.orders} orders</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Operational Insights */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2 className="section-title">Operational Insights</h2>
                        <span className="section-badge">Operations</span>
                    </div>
                    <div className="operational-grid">
                        <div className="operational-card pending">
                            <div className="op-icon"></div>
                            <div className="op-content">
                                <h3>{dashboardData.operational_insights.pending_orders}</h3>
                                <p>Pending Orders</p>
                            </div>
                        </div>
                        <div className="operational-card cancelled">
                            <div className="op-icon"></div>
                            <div className="op-content">
                                <h3>{dashboardData.operational_insights.cancelled_orders}</h3>
                                <p>Cancelled Orders</p>
                            </div>
                        </div>
                        <div className="operational-card delayed">
                            <div className="op-icon"></div>
                            <div className="op-content">
                                <h3>{dashboardData.operational_insights.delayed_orders}</h3>
                                <p>Delayed Orders</p>
                            </div>
                        </div>
                        <div className="operational-card active">
                            <div className="op-icon"></div>
                            <div className="op-content">
                                <h3>{dashboardData.operational_insights.active_orders}</h3>
                                <p>Active Orders</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 6. Team Management */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2 className="section-title">Team Management</h2>
                        <span className="section-badge">Team</span>
                    </div>
                    <div className="team-management-grid">
                        <div className="team-card support">
                            <div className="team-header">
                                <h4>Support Tickets</h4>
                                <div className="team-icon"></div>
                            </div>
                            <div className="team-stats">
                                <div className="stat">
                                    <span className="stat-number">{dashboardData.team_management.support_tickets_opened}</span>
                                    <span className="stat-label">Opened</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-number">{dashboardData.team_management.support_tickets_resolved}</span>
                                    <span className="stat-label">Resolved</span>
                                </div>
                            </div>
                        </div>
                        <div className="team-card kyc">
                            <div className="team-header">
                                <h4>KYC Management</h4>
                                <div className="team-icon"></div>
                            </div>
                            <div className="team-stats">
                                <div className="stat">
                                    <span className="stat-number">{dashboardData.team_management.kyc_pending}</span>
                                    <span className="stat-label">Pending</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-number">{dashboardData.team_management.kyc_approved}</span>
                                    <span className="stat-label">Approved</span>
                                </div>
                            </div>
                        </div>
                        <div className="team-card finance">
                            <div className="team-header">
                                <h4>Finance Settlements</h4>
                                <div className="team-icon"></div>
                            </div>
                            <div className="team-stats">
                                <div className="stat">
                                    <span className="stat-number">{dashboardData.team_management.finance_settlements_pending}</span>
                                    <span className="stat-label">Pending</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ManagerDashboard