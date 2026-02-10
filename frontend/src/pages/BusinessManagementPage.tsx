import React, { useState } from 'react'
import './BusinessManagementPage.css'

interface Business {
  id: string
  name: string
  category: 'retail' | 'food' | 'clothing'
  owner: string
  status: 'active' | 'pending' | 'suspended'
  revenue: number
  orders: number
  joinedDate: string
}

const SAMPLE_BUSINESSES: Business[] = [
  {
    id: 'BUS-001',
    name: 'Fresh Mart Grocery',
    category: 'retail',
    owner: 'John Smith',
    status: 'active',
    revenue: 45230.50,
    orders: 342,
    joinedDate: '2024-01-15'
  },
  {
    id: 'BUS-002',
    name: 'Spice Kitchen Restaurant',
    category: 'food',
    owner: 'Maria Garcia',
    status: 'active',
    revenue: 67890.25,
    orders: 521,
    joinedDate: '2024-02-20'
  },
  {
    id: 'BUS-003',
    name: 'Fashion Hub Boutique',
    category: 'clothing',
    owner: 'Sarah Johnson',
    status: 'active',
    revenue: 32450.00,
    orders: 198,
    joinedDate: '2024-03-10'
  },
  {
    id: 'BUS-004',
    name: 'Tech Store Plus',
    category: 'retail',
    owner: 'David Lee',
    status: 'pending',
    revenue: 0,
    orders: 0,
    joinedDate: '2024-06-01'
  },
  {
    id: 'BUS-005',
    name: 'Pizza Palace',
    category: 'food',
    owner: 'Tony Romano',
    status: 'active',
    revenue: 54320.75,
    orders: 678,
    joinedDate: '2024-01-25'
  },
  {
    id: 'BUS-006',
    name: 'Urban Threads',
    category: 'clothing',
    owner: 'Emma Wilson',
    status: 'active',
    revenue: 28900.50,
    orders: 156,
    joinedDate: '2024-04-05'
  },
  {
    id: 'BUS-007',
    name: 'Green Grocers',
    category: 'retail',
    owner: 'Michael Brown',
    status: 'suspended',
    revenue: 12340.00,
    orders: 89,
    joinedDate: '2024-02-14'
  },
  {
    id: 'BUS-008',
    name: 'Sushi Express',
    category: 'food',
    owner: 'Yuki Tanaka',
    status: 'active',
    revenue: 43210.00,
    orders: 432,
    joinedDate: '2024-03-20'
  }
]

const BusinessManagementPage: React.FC = () => {
  const [businesses] = useState<Business[]>(SAMPLE_BUSINESSES)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredBusinesses = businesses.filter(business => {
    const categoryMatch = filterCategory === 'all' || business.category === filterCategory
    const statusMatch = filterStatus === 'all' || business.status === filterStatus
    return categoryMatch && statusMatch
  })

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'status-badge status-active'
      case 'pending': return 'status-badge status-pending'
      case 'suspended': return 'status-badge status-suspended'
      default: return 'status-badge'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'retail': return '🛒'
      case 'food': return '🍽️'
      case 'clothing': return '👕'
      default: return '🏢'
    }
  }

  const totalRevenue = businesses.filter(b => b.status === 'active').reduce((sum, b) => sum + b.revenue, 0)
  const totalOrders = businesses.filter(b => b.status === 'active').reduce((sum, b) => sum + b.orders, 0)
  const activeCount = businesses.filter(b => b.status === 'active').length
  const pendingCount = businesses.filter(b => b.status === 'pending').length

  return (
    <div className="business-management-page">
      <h1>Business Management</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <div className="stat-value">{activeCount}</div>
            <div className="stat-label">Active Businesses</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-label">Pending Approval</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">${totalRevenue.toLocaleString()}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{totalOrders.toLocaleString()}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Category:</label>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="retail">Retail</option>
            <option value="food">Food</option>
            <option value="clothing">Clothing</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="businesses-table-container">
        <table className="businesses-table">
          <thead>
            <tr>
              <th>Business ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Revenue</th>
              <th>Orders</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBusinesses.map((business) => (
              <tr key={business.id}>
                <td>{business.id}</td>
                <td>
                  <div className="business-name">
                    <span className="category-icon">{getCategoryIcon(business.category)}</span>
                    {business.name}
                  </div>
                </td>
                <td>
                  <span className="category-badge">{business.category}</span>
                </td>
                <td>{business.owner}</td>
                <td>
                  <span className={getStatusBadgeClass(business.status)}>
                    {business.status}
                  </span>
                </td>
                <td>${business.revenue.toLocaleString()}</td>
                <td>{business.orders}</td>
                <td>{new Date(business.joinedDate).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-view" title="View Details">👁️</button>
                    <button className="btn-edit" title="Edit">✏️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default BusinessManagementPage
