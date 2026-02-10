import React, { useState, ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './DashboardLayout.css'

interface DashboardLayoutProps {
  children: ReactNode
  navigationMenu?: ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, navigationMenu }) => {
  const { user, logout } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen)
  }

  const closeProfileDropdown = () => {
    setIsProfileDropdownOpen(false)
  }

  const handleLogout = () => {
    closeProfileDropdown()
    logout()
  }

  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <button 
            className="hamburger-menu" 
            onClick={toggleSidebar}
            aria-label="Toggle navigation menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <h1 className="dashboard-title">Kirazee Dashboard</h1>
        </div>
        <div className="header-right">
          <div className="user-profile-wrapper">
            <button 
              className="user-profile-button" 
              onClick={toggleProfileDropdown}
              aria-label="User menu"
            >
              <div className="user-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            </button>
            
            {isProfileDropdownOpen && (
              <>
                <div className="dropdown-overlay" onClick={closeProfileDropdown}></div>
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-user-avatar">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <div className="dropdown-user-info">
                      <span className="dropdown-username">{user?.username}</span>
                      <span className="dropdown-role">{user?.role.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout-item" onClick={handleLogout}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        {navigationMenu}
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      {/* Main Content */}
      <main className="dashboard-content">
        {children}
      </main>
    </div>
  )
}

export default DashboardLayout
