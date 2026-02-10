import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Permission, OrdersResponse, Order, OrderStatus } from '../types'
import OrdersTable from '../components/OrdersTable'
import apiClient from '../utils/apiClient'
import './OrderManagementPage.css'

const OrderManagementPage: React.FC = () => {
  const { hasPermission } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)
  const [totalRevenue, setTotalRevenue] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [limit] = useState<number>(50)

  // Check permissions
  const canViewOrders = hasPermission(Permission.VIEW_ORDERS) || hasPermission(Permission.MANAGE_USERS)

  useEffect(() => {
    if (canViewOrders) {
      fetchOrders()
    }
  }, [statusFilter, currentPage, canViewOrders])

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)

    try {
      const params: any = {
        limit,
        offset: (currentPage - 1) * limit,
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter
      }

      const response = await apiClient.get<OrdersResponse>('/metrics/orders', { params })

      setOrders(response.data.orders)
      setTotalCount(response.data.total_count)
      
      // Calculate total revenue from orders
      const revenue = response.data.orders.reduce((sum, order) => sum + order.total, 0)
      setTotalRevenue(revenue)
    } catch (err: any) {
      console.error('Error fetching orders:', err)
      setError(err.response?.data?.error || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusFilterChange = (status: OrderStatus | 'all') => {
    setStatusFilter(status)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const totalPages = Math.ceil(totalCount / limit)

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  if (!canViewOrders) {
    return (
      <div className="order-management-page">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You do not have permission to view order management.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="order-management-page">
      <div className="page-header-order">
        <div className="header-left-section">
          <h2 className="page-title-order">Order Management</h2>
          <div className="stats-badges">
            <div className="total-orders-badge">
              <span className="total-number">{totalCount}</span>
              <span className="total-label">Total Orders</span>
            </div>
            <div className="total-revenue-badge">
              <span className="total-number">{formatCurrency(totalRevenue)}</span>
              <span className="total-label">Total Revenue</span>
            </div>
          </div>
        </div>
        <div className="filter-section-order">
          <label htmlFor="status-filter" className="filter-label">Filter by Status:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value as OrderStatus | 'all')}
            className="status-filter-select"
          >
            <option value="all">All Orders</option>
            <option value={OrderStatus.PENDING}>Pending</option>
            <option value={OrderStatus.IN_PROGRESS}>In Progress</option>
            <option value={OrderStatus.COMPLETED}>Completed</option>
            <option value={OrderStatus.CANCELLED}>Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <p>Loading orders...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p className="error-message">{error}</p>
          <button onClick={fetchOrders} className="btn-retry">
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="orders-table-wrapper">
            <OrdersTable orders={orders} />
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default OrderManagementPage
