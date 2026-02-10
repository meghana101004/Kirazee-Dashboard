// User and Role Types
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  MANAGER = 'manager',
  SUPPORT = 'support',
  KYC_ASSOCIATE = 'kyc_associate',
  CA_FINANCE = 'ca_finance',
  DEVELOPER = 'developer',
}

export enum Permission {
  // Dashboard metrics
  VIEW_REVENUE = 'view_revenue',
  VIEW_ORDERS = 'view_orders',
  VIEW_BUSINESSES = 'view_businesses',
  VIEW_CUSTOMERS = 'view_customers',
  VIEW_DELIVERY_PARTNERS = 'view_delivery_partners',
  VIEW_KYC_QUEUE = 'view_kyc_queue',
  VIEW_SYSTEM_LOGS = 'view_system_logs',
  VIEW_API_ANALYTICS = 'view_api_analytics',
  
  // Actions
  MANAGE_USERS = 'manage_users',
  VERIFY_KYC = 'verify_kyc',
  MANAGE_BUSINESSES = 'manage_businesses',
  MANAGE_ORDERS = 'manage_orders',
  VIEW_FINANCIAL_REPORTS = 'view_financial_reports',
  MANAGE_NOTIFICATIONS = 'manage_notifications',
}

export interface User {
  id: string
  username: string
  role: UserRole
  created_at?: string
  last_login?: string
  is_active?: boolean
}

// Authentication Types
export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface AuthVerifyResponse {
  valid: boolean
  user?: User
  error?: string
}

// User Management Types
export interface CreateUserData {
  username: string
  password: string
  role: UserRole
}

export interface EditUserData {
  username?: string
  password?: string
  role?: UserRole
}

export interface UserListResponse {
  users: User[]
}

export interface UserResponse {
  message: string
  user: User
}

// Dashboard Metrics Types
export interface RevenueMetrics {
  total: number
  average_order_value: number
  trend: number
}

export interface OrderMetrics {
  total: number
  pending: number
  completed: number
  cancelled: number
}

export interface BusinessMetrics {
  active: number
  pending_approval: number
}

export interface CustomerMetrics {
  unique: number
  active: number
}

export interface DeliveryMetrics {
  active: number
  available: number
}

export interface KYCMetrics {
  businesses: number
  delivery_partners: number
}

export interface MetricsOverviewResponse {
  revenue?: RevenueMetrics
  orders?: OrderMetrics
  businesses?: BusinessMetrics
  customers?: CustomerMetrics
  delivery_partners?: DeliveryMetrics
  kyc_pending?: KYCMetrics
}

// Revenue Types
export interface DailyRevenue {
  date: string
  revenue: number
  orders: number
}

export interface RevenueResponse {
  data: DailyRevenue[]
  total: number
  average: number
}

// Order Types
export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  IN_PROGRESS = 'in_progress',
}

export interface Order {
  id: string
  customer: string
  items: string[]
  total: number
  status: OrderStatus
  timestamp: string
}

export interface OrdersResponse {
  orders: Order[]
  total_count: number
}

// KYC Types
export enum KYCType {
  BUSINESS = 'business',
  DELIVERY_PARTNER = 'delivery_partner',
}

export interface Document {
  type: string
  url: string
  uploaded_at: string
}

export interface KYCVerification {
  id: string
  type: KYCType
  name: string
  documents: Document[]
  submitted_at: string
}

export interface KYCPendingResponse {
  verifications: KYCVerification[]
}

export interface KYCVerifyRequest {
  action: 'approve' | 'reject'
  reason?: string
}

export interface KYCVerifyResponse {
  message: string
  verification_id: string
  status: string
}

// System Metrics Types
export interface SystemLog {
  timestamp: string
  level: 'info' | 'warning' | 'error'
  message: string
  source: string
}

export interface SystemLogsResponse {
  logs: SystemLog[]
}

export interface APIAnalytics {
  total_requests: number
  requests_by_endpoint: Record<string, number>
  average_response_time: number
  error_rate: number
}

export interface APIAnalyticsResponse extends APIAnalytics {}

// Error Response Type
export interface ErrorResponse {
  error: string
  message?: string
  details?: Record<string, string[]>
}

// API Response Wrapper
export type ApiResponse<T> = T | ErrorResponse

// Helper type guard
export function isErrorResponse(response: any): response is ErrorResponse {
  return response && typeof response === 'object' && 'error' in response
}
