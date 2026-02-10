import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Permission, Order, OrderStatus } from '../types'
import './OrdersTable.css'

interface OrdersTableProps {
  orders: Order[]
  onStatusChange?: (orderId: string, status: OrderStatus) => void
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders, onStatusChange }) => {
  const { hasPermission } = useAuth()
  const [sortField, setSortField] = useState<keyof Order>('timestamp')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')

  // Require Manager, Support, or Super_Admin permission
  if (
    !hasPermission(Permission.VIEW_ORDERS) &&
    !hasPermission(Permission.MANAGE_USERS)
  ) {
    return null
  }

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Handle sorting
  const handleSort = (field: keyof Order) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Filter orders by status
  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus)

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  // Get status badge class
  const getStatusClass = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.COMPLETED:
        return 'status-completed'
      case OrderStatus.PENDING:
        return 'status-pending'
      case OrderStatus.CANCELLED:
        return 'status-cancelled'
      case OrderStatus.IN_PROGRESS:
        return 'status-in-progress'
      default:
        return ''
    }
  }

  return (
    <div className="orders-table-container">
      <div className="orders-table-header">
        <h3 className="table-title">Orders List</h3>
        <div className="table-actions">
          <div className="status-filter-pills">
            <button 
              className={`filter-pill ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All ({orders.length})
            </button>
            <button 
              className={`filter-pill ${filterStatus === OrderStatus.PENDING ? 'active' : ''}`}
              onClick={() => setFilterStatus(OrderStatus.PENDING)}
            >
              Pending ({orders.filter(o => o.status === OrderStatus.PENDING).length})
            </button>
            <button 
              className={`filter-pill ${filterStatus === OrderStatus.IN_PROGRESS ? 'active' : ''}`}
              onClick={() => setFilterStatus(OrderStatus.IN_PROGRESS)}
            >
              In Progress ({orders.filter(o => o.status === OrderStatus.IN_PROGRESS).length})
            </button>
            <button 
              className={`filter-pill ${filterStatus === OrderStatus.COMPLETED ? 'active' : ''}`}
              onClick={() => setFilterStatus(OrderStatus.COMPLETED)}
            >
              Completed ({orders.filter(o => o.status === OrderStatus.COMPLETED).length})
            </button>
            <button 
              className={`filter-pill ${filterStatus === OrderStatus.CANCELLED ? 'active' : ''}`}
              onClick={() => setFilterStatus(OrderStatus.CANCELLED)}
            >
              Cancelled ({orders.filter(o => o.status === OrderStatus.CANCELLED).length})
            </button>
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} className="sortable">
                Order ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('customer')} className="sortable">
                Customer {sortField === 'customer' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Items</th>
              <th onClick={() => handleSort('total')} className="sortable">
                Total {sortField === 'total' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('status')} className="sortable">
                Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('timestamp')} className="sortable">
                Date {sortField === 'timestamp' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="no-data">
                  {filterStatus === 'all' ? 'No orders found' : `No ${filterStatus.toLowerCase().replace('_', ' ')} orders found`}
                </td>
              </tr>
            ) : (
              sortedOrders.map((order) => (
                <tr key={order.id} className="order-row">
                  <td className="order-id">#{order.id}</td>
                  <td className="customer-cell">
                    <div className="customer-info">
                      <span className="customer-name">{order.customer}</span>
                    </div>
                  </td>
                  <td className="items-cell">
                    <div className="items-info">
                      {order.items.length > 2 ? (
                        <span title={order.items.join(', ')}>
                          {order.items.slice(0, 2).join(', ')} 
                          <span className="items-more">+{order.items.length - 2} more</span>
                        </span>
                      ) : (
                        order.items.join(', ')
                      )}
                    </div>
                  </td>
                  <td className="total-cell">
                    <span className="amount">{formatCurrency(order.total)}</span>
                  </td>
                  <td className="status-cell">
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="date-cell">
                    <span className="date-text">{formatDate(order.timestamp)}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <span className="results-count">
          Showing {sortedOrders.length} of {orders.length} orders
        </span>
      </div>
    </div>
  )
}

export default OrdersTable
