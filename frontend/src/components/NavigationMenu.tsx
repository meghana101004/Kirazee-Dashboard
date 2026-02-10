import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Permission } from '../types'
import './NavigationMenu.css'

interface SubMenuItem {
  label: string
  path: string
  icon: string
}

interface MenuItem {
  label: string
  path: string
  icon: string
  permissions: Permission[]
  subItems?: SubMenuItem[]
}

const MENU_ITEMS: MenuItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: '',
    permissions: [], // All authenticated users can access dashboard
  },
  {
    label: 'Business Overview',
    path: '/manager-dashboard',
    icon: '',
    permissions: [Permission.MANAGE_BUSINESSES], // Manager-specific dashboard
    subItems: [
      {
        label: 'Orders',
        path: '/orders',
        icon: ''
      },
      {
        label: 'Total Revenue',
        path: '/total-revenue',
        icon: ''
      },
      {
        label: 'Active Users',
        path: '/active-users',
        icon: ''
      },
      {
        label: 'Order Fulfillment',
        path: '/order-fulfillment',
        icon: ''
      }
    ]
  },
  {
    label: 'User Management',
    path: '/user-management',
    icon: '',
    permissions: [Permission.MANAGE_USERS],
  },
  {
    label: 'Revenue Reports',
    path: '/revenue-reports',
    icon: '',
    permissions: [Permission.VIEW_REVENUE, Permission.VIEW_FINANCIAL_REPORTS],
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
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([])

  // Filter menu items based on user permissions
  const visibleMenuItems = MENU_ITEMS.filter((item) => {
    // If no permissions required, show to all authenticated users
    if (item.permissions.length === 0) {
      return true
    }
    // Check if user has at least one of the required permissions
    return item.permissions.some((permission) => hasPermission(permission))
  })

  const toggleDropdown = (itemPath: string) => {
    setOpenDropdowns(prev => 
      prev.includes(itemPath) 
        ? prev.filter(path => path !== itemPath)
        : [...prev, itemPath]
    )
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className="navigation-menu">
      <ul className="menu-list">
        {visibleMenuItems.map((item) => {
          const isActive = location.pathname === item.path
          const isDropdownOpen = openDropdowns.includes(item.path)
          
          return (
            <li key={item.path} className="menu-item">
              {item.subItems ? (
                // Dropdown menu item
                <div className="dropdown-container">
                  <div
                    className={`menu-link dropdown-toggle ${isActive ? 'active' : ''}`}
                    onClick={() => toggleDropdown(item.path)}
                  >
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-label">{item.label}</span>
                    <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
                  </div>
                  {isDropdownOpen && (
                    <ul className="dropdown-menu">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.path} className="dropdown-item">
                          <Link
                            to={subItem.path.split('#')[0]}
                            className="dropdown-link"
                            onClick={() => {
                              const sectionId = subItem.path.split('#')[1]
                              if (sectionId) {
                                setTimeout(() => scrollToSection(sectionId), 100)
                              }
                            }}
                          >
                            <span className="menu-icon">{subItem.icon}</span>
                            <span className="menu-label">{subItem.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                // Regular menu item
                <Link
                  to={item.path}
                  className={`menu-link ${isActive ? 'active' : ''}`}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-label">{item.label}</span>
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default NavigationMenu
