import React, { useState } from 'react'
import './PlaceholderPage.css'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  totalOrders: number
  totalSpent: number
  avgOrderValue: number
  lastOrderDate: string
  status: 'active' | 'inactive'
  joinedDate: string
}

const SAMPLE_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-001',
    name: 'Emily Rodriguez',
    email: 'emily.r@email.com',
    phone: '+1-555-1001',
    totalOrders: 45,
    totalSpent: 2340.50,
    avgOrderValue: 52.01,
    lastOrderDate: '2024-06-05',
    status: 'active',
    joinedDate: '2024-01-15'
  },
  {
    id: 'CUST-002',
    name: 'Michael Chen',
    email: 'mchen@email.com',
    phone: '+1-555-1002',
    totalOrders: 67,
    totalSpent: 3890.75,
    avgOrderValue: 58.07,
    lastOrderDate: '2024-06-06',
    status: 'active',
    joinedDate: '2024-01-20'
  },
  {
    id: 'CUST-003',
    name: 'Sarah Williams',
    email: 'swilliams@email.com',
    phone: '+1-555-1003',
    totalOrders: 23,
    totalSpent: 1120.00,
    avgOrderValue: 48.70,
    lastOrderDate: '2024-06-04',
    status: 'active',
    joinedDate: '2024-02-10'
  },
  {
    id: 'CUST-004',
    name: 'David Park',
    email: 'dpark@email.com',
    phone: '+1-555-1004',
    totalOrders: 89,
    totalSpent: 5430.25,
    avgOrderValue: 61.01,
    lastOrderDate: '2024-06-07',
    status: 'active',
    joinedDate: '2024-01-05'
  },
  {
    id: 'CUST-005',
    name: 'Lisa Anderson',
    email: 'landerson@email.com',
    phone: '+1-555-1005',
    totalOrders: 12,
    totalSpent: 540.00,
    avgOrderValue: 45.00,
    lastOrderDate: '2024-04-20',
    status: 'inactive',
    joinedDate: '2024-03-15'
  },
  {
    id: 'CUST-006',
    name: 'Robert Taylor',
    email: 'rtaylor@email.com',
    phone: '+1-555-1006',
    totalOrders: 34,
    totalSpent: 1890.50,
    avgOrderValue: 55.60,
    lastOrderDate: '2024-06-03',
    status: 'active',
    joinedDate: '2024-02-01'
  },
  {
    id: 'CUST-007',
    name: 'Jennifer Lee',
    email: 'jlee@email.com',
    phone: '+1-555-1007',
    totalOrders: 56,
    totalSpent: 3210.00,
    avgOrderValue: 57.32,
    lastOrderDate: '2024-06-06',
    status: 'active',
    joinedDate: '2024-01-25'
  }
]

const CustomerAnalyticsPage: React.FC = () => {
  const [customers] = useState<Customer[]>(SAMPLE_CUSTOMERS)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredCustomers = customers.filter(customer => {
    return filterStatus === 'all' || customer.status === filterStatus
  })

  const getStatusBadgeClass = (status: string) => {
    return status === 'active' ? 'status-badge status-available' : 'status-badge status-offline'
  }

  const activeCount = customers.filter(c => c.status === 'active').length
  const totalCustomers = customers.length
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)
  const avgOrderValue = totalRevenue / customers.reduce((sum, c) => sum + c.totalOrders, 0)

  return (
    <div className="placeholder-page">
      <h1>Customer Analytics</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{totalCustomers}</div>
            <div className="stat-label">Total Customers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{activeCount}</div>
            <div className="stat-label">Active Customers</div>
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
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">${avgOrderValue.toFixed(2)}</div>
            <div className="stat-label">Avg Order Value</div>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Customers</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Orders</th>
              <th>Total Spent</th>
              <th>Avg Order</th>
              <th>Last Order</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.id}</td>
                <td>{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                <td>{customer.totalOrders}</td>
                <td>${customer.totalSpent.toLocaleString()}</td>
                <td>${customer.avgOrderValue.toFixed(2)}</td>
                <td>{new Date(customer.lastOrderDate).toLocaleDateString()}</td>
                <td>
                  <span className={getStatusBadgeClass(customer.status)}>
                    {customer.status}
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

export default CustomerAnalyticsPage
