"""
API URL configuration
"""
from django.urls import path
from api.views import (
    LoginView, 
    LogoutView, 
    VerifyTokenView,
    MetricsOverviewView,
    RevenueMetricsView,
    OrdersMetricsView,
    KYCPendingView,
    KYCVerifyView,
    SystemLogsView,
    APIAnalyticsView,
    UsersListView,
    UserCreateView,
    UserUpdateView
)

urlpatterns = [
    # Authentication endpoints
    path('auth/login', LoginView.as_view(), name='login'),
    path('auth/logout', LogoutView.as_view(), name='logout'),
    path('auth/verify', VerifyTokenView.as_view(), name='verify'),
    
    # Metrics endpoints
    path('metrics/overview', MetricsOverviewView.as_view(), name='metrics-overview'),
    path('metrics/revenue', RevenueMetricsView.as_view(), name='metrics-revenue'),
    path('metrics/orders', OrdersMetricsView.as_view(), name='metrics-orders'),
    
    # KYC endpoints
    path('kyc/pending', KYCPendingView.as_view(), name='kyc-pending'),
    path('kyc/verify/<str:verification_id>', KYCVerifyView.as_view(), name='kyc-verify'),
    
    # System endpoints
    path('system/logs', SystemLogsView.as_view(), name='system-logs'),
    path('system/api-analytics', APIAnalyticsView.as_view(), name='api-analytics'),
    
    # User management endpoints
    path('users', UsersListView.as_view(), name='users-list'),
    path('users', UserCreateView.as_view(), name='users-create'),
    path('users/<str:user_id>', UserUpdateView.as_view(), name='users-update-delete'),
]
