import React, { useState } from 'react'
import './PlaceholderPage.css'

interface DeliveryPartner {
  id: string
  name: string
  phone: string
  vehicle: string
  status: 'available' | 'on_delivery' | 'offline'
  rating: number
  completedDeliveries: number
  earnings: number
  joinedDate: string
}

const SAMPLE_PARTNERS: DeliveryPartner[] = [
  {
    id: 'DP-001',
    name: 'Alex Kumar',
    phone: '+1-555-0101',
    vehicle: 'Motorcycle',
    status: 'available',
    rating: 4.8,
    completedDeliveries: 342,
    earnings: 5430.50,
    joinedDate: '2024-01-10'
  },
  {
    id: 'DP-002',
    name: 'Maria Santos',
    phone: '+1-555-0102',
    vehicle: 'Car',
    status: 'on_delivery',
    rating: 4.9,
    completedDeliveries: 521,
    earnings: 8210.75,
    joinedDate: '2024-01-15'
  },
  {
    id: 'DP-003',
    name: 'James Wilson',
    phone: '+1-555-0103',
    vehicle: 'Bicycle',
    status: 'available',
    rating: 4.7,
    completedDeliveries: 198,
    earnings: 3120.00,
    joinedDate: '2024-02-20'
  },
  {
    id: 'DP-004',
    name: 'Chen Wei',
    phone: '+1-555-0104',
    vehicle: 'Motorcycle',
    status: 'on_delivery',
    rating: 4.6,
    completedDeliveries: 287,
    earnings: 4560.25,
    joinedDate: '2024-02-05'
  },
  {
    id: 'DP-005',
    name: 'Sarah Johnson',
    phone: '+1-555-0105',
    vehicle: 'Car',
    status: 'available',
    rating: 4.9,
    completedDeliveries: 456,
    earnings: 7230.50,
    joinedDate: '2024-01-20'
  },
  {
    id: 'DP-006',
    name: 'Mohammed Ali',
    phone: '+1-555-0106',
    vehicle: 'Motorcycle',
    status: 'offline',
    rating: 4.5,
    completedDeliveries: 167,
    earnings: 2650.00,
    joinedDate: '2024-03-10'
  }
]

const DeliveryPartnersPage: React.FC = () => {
  const [partners] = useState<DeliveryPartner[]>(SAMPLE_PARTNERS)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredPartners = partners.filter(partner => {
    return filterStatus === 'all' || partner.status === filterStatus
  })

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'available': return 'status-badge status-available'
      case 'on_delivery': return 'status-badge status-busy'
      case 'offline': return 'status-badge status-offline'
      default: return 'status-badge'
    }
  }

  const getVehicleIcon = (vehicle: string) => {
    switch (vehicle.toLowerCase()) {
      case 'motorcycle': return '🏍️'
      case 'car': return '🚗'
      case 'bicycle': return '🚲'
      default: return '🚚'
    }
  }

  const availableCount = partners.filter(p => p.status === 'available').length
  const busyCount = partners.filter(p => p.status === 'on_delivery').length
  const totalDeliveries = partners.reduce((sum, p) => sum + p.completedDeliveries, 0)
  const totalEarnings = partners.reduce((sum, p) => sum + p.earnings, 0)

  return (
    <div className="placeholder-page">
      <h1>Delivery Partners</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{availableCount}</div>
            <div className="stat-label">Available</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚚</div>
          <div className="stat-content">
            <div className="stat-value">{busyCount}</div>
            <div className="stat-label">On Delivery</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{totalDeliveries}</div>
            <div className="stat-label">Total Deliveries</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">${totalEarnings.toLocaleString()}</div>
            <div className="stat-label">Total Earnings</div>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="on_delivery">On Delivery</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Partner ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Vehicle</th>
              <th>Status</th>
              <th>Rating</th>
              <th>Deliveries</th>
              <th>Earnings</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {filteredPartners.map((partner) => (
              <tr key={partner.id}>
                <td>{partner.id}</td>
                <td>{partner.name}</td>
                <td>{partner.phone}</td>
                <td>
                  <span className="vehicle-info">
                    {getVehicleIcon(partner.vehicle)} {partner.vehicle}
                  </span>
                </td>
                <td>
                  <span className={getStatusBadgeClass(partner.status)}>
                    {partner.status.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <span className="rating">⭐ {partner.rating}</span>
                </td>
                <td>{partner.completedDeliveries}</td>
                <td>${partner.earnings.toLocaleString()}</td>
                <td>{new Date(partner.joinedDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DeliveryPartnersPage
