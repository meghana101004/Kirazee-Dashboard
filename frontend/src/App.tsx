import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Permission } from './types'
import LoginPage from './pages/LoginPage'
import DashboardHome from './pages/DashboardHome'
import RevenueReportsPage from './pages/RevenueReportsPage'
import OrderManagementPage from './pages/OrderManagementPage'
import KYCVerificationPage from './pages/KYCVerificationPage'
import SystemLogsPage from './pages/SystemLogsPage'
import UserManagementPage from './pages/UserManagementPage'
import BusinessManagementPage from './pages/BusinessManagementPage'
import DeliveryPartnersPage from './pages/DeliveryPartnersPage'
import CustomerAnalyticsPage from './pages/CustomerAnalyticsPage'
import NotificationsPage from './pages/NotificationsPage'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'
import NavigationMenu from './components/NavigationMenu'
import ErrorBoundary from './components/ErrorBoundary'
import ErrorNotification from './components/ErrorNotification'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ErrorNotification />
        <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredPermissions={[]}>
              <DashboardLayout navigationMenu={<NavigationMenu />}>
                <DashboardHome />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/revenue-reports"
          element={
            <ProtectedRoute requiredPermissions={[Permission.VIEW_REVENUE]}>
              <DashboardLayout navigationMenu={<NavigationMenu />}>
                <RevenueReportsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-management"
          element={
            <ProtectedRoute requiredPermissions={[Permission.VIEW_ORDERS]}>
              <DashboardLayout navigationMenu={<NavigationMenu />}>
                <OrderManagementPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/kyc-verification"
          element={
            <ProtectedRoute requiredPermissions={[Permission.VIEW_KYC_QUEUE]}>
              <DashboardLayout navigationMenu={<NavigationMenu />}>
                <KYCVerificationPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/system-logs"
          element={
            <ProtectedRoute requiredPermissions={[Permission.VIEW_SYSTEM_LOGS]}>
              <DashboardLayout navigationMenu={<NavigationMenu />}>
                <SystemLogsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-management"
          element={
            <ProtectedRoute requiredPermissions={[Permission.MANAGE_USERS]}>
              <DashboardLayout navigationMenu={<NavigationMenu />}>
                <UserManagementPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/businesses"
          element={
            <ProtectedRoute requiredPermissions={[Permission.MANAGE_BUSINESSES]}>
              <DashboardLayout navigationMenu={<NavigationMenu />}>
                <BusinessManagementPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/delivery-partners"
          element={
            <ProtectedRoute requiredPermissions={[Permission.VIEW_DELIVERY_PARTNERS]}>
              <DashboardLayout navigationMenu={<NavigationMenu />}>
                <DeliveryPartnersPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute requiredPermissions={[Permission.VIEW_CUSTOMERS]}>
              <DashboardLayout navigationMenu={<NavigationMenu />}>
                <CustomerAnalyticsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute requiredPermissions={[Permission.MANAGE_NOTIFICATIONS]}>
              <DashboardLayout navigationMenu={<NavigationMenu />}>
                <NotificationsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
