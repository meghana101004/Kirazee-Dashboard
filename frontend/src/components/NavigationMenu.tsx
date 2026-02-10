import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Permission } from '../types'
import './NavigationMenu.css'

interface MenuItem {
  label: string
  path: string
  icon: string
  permissions: Permission[]
}

const MENU_ITEMS: MenuItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: '🏠',
    permissions: [], // All authenticated users can access dashboard
  },
  {
    label: 'Manager Dashboard',
    path: '/manager-dashboard',
    icon: '📊',
    permissions: [Permission.MANAGE_BUSINESSES], // Manager-specific dashboard
  },
  {
    label: 'User Management',
    path: '/user-management',
    icon: '👥',
    permissions: [Permission.MANAGE_USERS],
  },
  {
    label: 'Revenue Reports',
    path: '/revenue-reports',
    icon: '',
    permissions: [Permission.VIEW_REVENUE, Permission.VIEW_FINANCIAL_REPORTS],
  },
  {
    label: 'Order Management',
    path: '/order-management',
    icon: '',
    permissions: [Permission.VIEW_ORDERS, Permission.MANAGE_ORDERS],
  },
  {
    label: 'KYC Verification',
    path: '/kyc-verification',
    icon: '',
    permissions: [Permission.VIEW_KYC_QUEUE, Permission.VERIFY_KYC],
  },
  {
    label: 'System Logs',
    path: '/system-logs',
    icon: '',
    permissions: [Permission.VIEW_SYSTEM_LOGS, Permission.VIEW_API_ANALYTICS],
  },
  {
    label: 'Business Management',
    path: '/businesses',
    icon: '',
    permissions: [Permission.MANAGE_BUSINESSES],
  },
  {
    label: 'Delivery Partners',
    path: '/delivery-partners',
    icon: '',
    permissions: [Permission.VIEW_DELIVERY_PARTNERS],
  },
  {
    label: 'Customer Analytics',
    path: '/customers',
    icon: '',
    permissions: [Permission.VIEW_CUSTOMERS],
  },
  {
    label: 'Notifications',
    path: '/notifications',
    icon: '',
    permissions: [Permission.MANAGE_NOTIFICATIONS],
  },
]

const NavigationMenu: React.FC = () => {
  const { hasPermission } = useAuth()
  const location = useLocation()

  // Filter menu items based on user permissions
  const visibleMenuItems = MENU_ITEMS.filter((item) => {
    // If no permissions required, show to all authenticated users
    if (item.permissions.length === 0) {
      return true
    }
    // Check if user has at least one of the required permissions
    return item.permissions.some((permission) => hasPermission(permission))
  })

  return (
    <nav className="navigation-menu">
      <ul className="menu-list">
        {visibleMenuItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <li key={item.path} className="menu-item">
              <Link
                to={item.path}
                className={`menu-link ${isActive ? 'active' : ''}`}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default NavigationMenu
