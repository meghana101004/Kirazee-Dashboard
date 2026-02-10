"""
Tests for dashboard metrics API endpoints
"""
import pytest
from django.test import TestCase
from rest_framework.test import APIClient
from api.jwt_utils import generate_jwt_token
from api.models import UserRole


class TestMetricsEndpoints(TestCase):
    """Test dashboard metrics API endpoints"""
    
    def setUp(self):
        """Set up test client and tokens for different roles"""
        self.client = APIClient()
        
        # Generate tokens for different roles
        self.super_admin_token = generate_jwt_token(
            user_id="test-super-admin",
            username="superadmin",
            role=UserRole.SUPER_ADMIN.value
        )
        
        self.manager_token = generate_jwt_token(
            user_id="test-manager",
            username="manager",
            role=UserRole.MANAGER.value
        )
        
        self.support_token = generate_jwt_token(
            user_id="test-support",
            username="support",
            role=UserRole.SUPPORT.value
        )
        
        self.kyc_token = generate_jwt_token(
            user_id="test-kyc",
            username="kyc",
            role=UserRole.KYC_ASSOCIATE.value
        )
        
        self.finance_token = generate_jwt_token(
            user_id="test-finance",
            username="finance",
            role=UserRole.CA_FINANCE.value
        )
        
        self.developer_token = generate_jwt_token(
            user_id="test-developer",
            username="developer",
            role=UserRole.DEVELOPER.value
        )
    
    def test_metrics_overview_super_admin(self):
        """Test that super admin can access overview and sees all metrics"""
        response = self.client.get(
            '/api/metrics/overview',
            HTTP_AUTHORIZATION=f'Bearer {self.super_admin_token}'
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Super admin should see all metric categories
        assert 'revenue' in data
        assert 'orders' in data
        assert 'businesses' in data
        assert 'customers' in data
        assert 'delivery_partners' in data
        assert 'kyc_pending' in data
    
    def test_metrics_overview_manager(self):
        """Test that manager sees only permitted metrics"""
        response = self.client.get(
            '/api/metrics/overview',
            HTTP_AUTHORIZATION=f'Bearer {self.manager_token}'
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Manager should see orders, businesses, delivery_partners
        assert 'orders' in data
        assert 'businesses' in data
        assert 'delivery_partners' in data
        
        # Manager should NOT see revenue, customers, kyc_pending
        assert 'revenue' not in data
        assert 'customers' not in data
        assert 'kyc_pending' not in data
    
    def test_metrics_overview_ca_finance(self):
        """Test that CA_Finance sees only financial metrics"""
        response = self.client.get(
            '/api/metrics/overview',
            HTTP_AUTHORIZATION=f'Bearer {self.finance_token}'
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # CA_Finance should see revenue
        assert 'revenue' in data
        
        # CA_Finance should NOT see other metrics
        assert 'orders' not in data
        assert 'businesses' not in data
        assert 'customers' not in data
        assert 'delivery_partners' not in data
        assert 'kyc_pending' not in data
    
    def test_metrics_overview_without_token(self):
        """Test that overview endpoint requires authentication"""
        response = self.client.get('/api/metrics/overview')
        
        assert response.status_code == 401
    
    def test_revenue_endpoint_authorized(self):
        """Test that CA_Finance can access revenue endpoint"""
        response = self.client.get(
            '/api/metrics/revenue',
            HTTP_AUTHORIZATION=f'Bearer {self.finance_token}'
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert 'data' in data
        assert 'total' in data
        assert 'average' in data
        assert 'time_range' in data
    
    def test_revenue_endpoint_unauthorized(self):
        """Test that non-finance roles cannot access revenue endpoint"""
        response = self.client.get(
            '/api/metrics/revenue',
            HTTP_AUTHORIZATION=f'Bearer {self.manager_token}'
        )
        
        assert response.status_code == 403
    
    def test_revenue_endpoint_with_time_range(self):
        """Test revenue endpoint with time range parameter"""
        response = self.client.get(
            '/api/metrics/revenue?time_range=month',
            HTTP_AUTHORIZATION=f'Bearer {self.finance_token}'
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['time_range'] == 'month'
    
    def test_revenue_endpoint_invalid_time_range(self):
        """Test revenue endpoint rejects invalid time range"""
        response = self.client.get(
            '/api/metrics/revenue?time_range=invalid',
            HTTP_AUTHORIZATION=f'Bearer {self.finance_token}'
        )
        
        assert response.status_code == 400
    
    def test_orders_endpoint_authorized(self):
        """Test that manager can access orders endpoint"""
        response = self.client.get(
            '/api/metrics/orders',
            HTTP_AUTHORIZATION=f'Bearer {self.manager_token}'
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert 'orders' in data
        assert 'total_count' in data
        assert 'limit' in data
        assert 'offset' in data
    
    def test_orders_endpoint_unauthorized(self):
        """Test that finance role cannot access orders endpoint"""
        response = self.client.get(
            '/api/metrics/orders',
            HTTP_AUTHORIZATION=f'Bearer {self.finance_token}'
        )
        
        assert response.status_code == 403
    
    def test_orders_endpoint_with_status_filter(self):
        """Test orders endpoint with status filter"""
        response = self.client.get(
            '/api/metrics/orders?status=pending',
            HTTP_AUTHORIZATION=f'Bearer {self.manager_token}'
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # All returned orders should have pending status
        for order in data['orders']:
            assert order['status'] == 'pending'
    
    def test_orders_endpoint_with_pagination(self):
        """Test orders endpoint with pagination"""
        response = self.client.get(
            '/api/metrics/orders?limit=5&offset=2',
            HTTP_AUTHORIZATION=f'Bearer {self.manager_token}'
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data['limit'] == 5
        assert data['offset'] == 2
        assert len(data['orders']) <= 5
    
    def test_kyc_pending_endpoint_authorized(self):
        """Test that KYC associate can access pending endpoint"""
        response = self.client.get(
            '/api/kyc/pending',
            HTTP_AUTHORIZATION=f'Bearer {self.kyc_token}'
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert 'verifications' in data
    
    def test_kyc_pending_endpoint_unauthorized(self):
        """Test that manager cannot access KYC pending endpoint"""
        response = self.client.get(
            '/api/kyc/pending',
            HTTP_AUTHORIZATION=f'Bearer {self.manager_token}'
        )
        
        assert response.status_code == 403
    
    def test_kyc_pending_with_type_filter(self):
        """Test KYC pending endpoint with type filter"""
        response = self.client.get(
            '/api/kyc/pending?type=business',
            HTTP_AUTHORIZATION=f'Bearer {self.kyc_token}'
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # All returned verifications should be business type
        for verification in data['verifications']:
            assert verification['type'] == 'business'
    
    def test_kyc_verify_approve(self):
        """Test KYC verification approval"""
        response = self.client.post(
            '/api/kyc/verify/KYC-123',
            {'action': 'approve'},
            format='json',
            HTTP_AUTHORIZATION=f'Bearer {self.kyc_token}'
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data['message'] == 'Verification processed successfully'
        assert data['verification_id'] == 'KYC-123'
        assert data['status'] == 'approved'
    
    def test_kyc_verify_reject_with_reason(self):
        """Test KYC verification rejection with reason"""
        response = self.client.post(
            '/api/kyc/verify/KYC-456',
            {'action': 'reject', 'reason': 'Incomplete documents'},
            format='json',
            HTTP_AUTHORIZATION=f'Bearer {self.kyc_token}'
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data['status'] == 'rejected'
        assert data['reason'] == 'Incomplete documents'
    
    def test_kyc_verify_reject_without_reason(self):
        """Test that rejection requires a reason"""
        response = self.client.post(
            '/api/kyc/verify/KYC-789',
            {'action': 'reject'},
            format='json',
            HTTP_AUTHORIZATION=f'Bearer {self.kyc_token}'
        )
        
        assert response.status_code == 400
    
    def test_kyc_verify_invalid_action(self):
        """Test that invalid action is rejected"""
        response = self.client.post(
            '/api/kyc/verify/KYC-999',
            {'action': 'invalid'},
            format='json',
            HTTP_AUTHORIZATION=f'Bearer {self.kyc_token}'
        )
        
        assert response.status_code == 400
    
    def test_system_logs_endpoint_authorized(self):
        """Test that developer can access system logs"""
        response = self.client.get(
            '/api/system/logs',
            HTTP_AUTHORIZATION=f'Bearer {self.developer_token}'
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert 'logs' in data
    
    def test_system_logs_endpoint_unauthorized(self):
        """Test that manager cannot access system logs"""
        response = self.client.get(
            '/api/system/logs',
            HTTP_AUTHORIZATION=f'Bearer {self.manager_token}'
        )
        
        assert response.status_code == 403
    
    def test_system_logs_with_level_filter(self):
        """Test system logs with level filter"""
        response = self.client.get(
            '/api/system/logs?level=error',
            HTTP_AUTHORIZATION=f'Bearer {self.developer_token}'
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # All returned logs should be error level
        for log in data['logs']:
            assert log['level'] == 'error'
    
    def test_system_logs_with_limit(self):
        """Test system logs with limit parameter"""
        response = self.client.get(
            '/api/system/logs?limit=10',
            HTTP_AUTHORIZATION=f'Bearer {self.developer_token}'
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data['logs']) <= 10
    
    def test_api_analytics_endpoint_authorized(self):
        """Test that developer can access API analytics"""
        response = self.client.get(
            '/api/system/api-analytics',
            HTTP_AUTHORIZATION=f'Bearer {self.developer_token}'
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert 'total_requests' in data
        assert 'requests_by_endpoint' in data
        assert 'average_response_time' in data
        assert 'error_rate' in data
    
    def test_api_analytics_endpoint_unauthorized(self):
        """Test that support cannot access API analytics"""
        response = self.client.get(
            '/api/system/api-analytics',
            HTTP_AUTHORIZATION=f'Bearer {self.support_token}'
        )
        
        assert response.status_code == 403
