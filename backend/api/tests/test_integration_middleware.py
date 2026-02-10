"""
Integration tests for authentication and authorization middleware
"""
import pytest
from django.test import TestCase, Client
from api.models import User, UserRole
import json


class TestMiddlewareIntegration(TestCase):
    """Integration tests for complete auth flow with middleware"""
    
    def setUp(self):
        self.client = Client()
        
        # Create a test user in database
        self.test_user = User.objects.create(
            username='testmanager',
            role=UserRole.MANAGER.value,
            is_active=True
        )
        self.test_user.set_password('testpass123')
        self.test_user.save()
    
    def test_complete_auth_flow_with_middleware(self):
        """Test complete authentication flow with middleware protection"""
        # Step 1: Login to get token
        login_response = self.client.post('/api/auth/login', {
            'username': 'testmanager',
            'password': 'testpass123'
        }, content_type='application/json')
        
        self.assertEqual(login_response.status_code, 200)
        data = json.loads(login_response.content)
        token = data['token']
        self.assertIsNotNone(token)
        
        # Step 2: Verify token works
        verify_response = self.client.get('/api/auth/verify',
                                         HTTP_AUTHORIZATION=f'Bearer {token}')
        
        self.assertEqual(verify_response.status_code, 200)
        verify_data = json.loads(verify_response.content)
        self.assertTrue(verify_data['valid'])
        self.assertEqual(verify_data['user']['username'], 'testmanager')
        
        # Step 3: Logout
        logout_response = self.client.post('/api/auth/logout',
                                          HTTP_AUTHORIZATION=f'Bearer {token}')
        
        self.assertEqual(logout_response.status_code, 200)
    
    def test_protected_endpoint_requires_token(self):
        """Test that protected endpoints require valid token"""
        # Try to access protected endpoint without token
        response = self.client.get('/api/metrics/overview')
        
        # Should be rejected by middleware
        self.assertEqual(response.status_code, 401)
        data = json.loads(response.content)
        self.assertIn('error', data)
    
    def test_role_based_access_control(self):
        """Test that RBAC middleware enforces permissions"""
        # Login as manager
        login_response = self.client.post('/api/auth/login', {
            'username': 'testmanager',
            'password': 'testpass123'
        }, content_type='application/json')
        
        token = json.loads(login_response.content)['token']
        
        # Manager should NOT have access to revenue endpoint (requires CA_Finance)
        revenue_response = self.client.get('/api/metrics/revenue',
                                          HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Should be denied by RBAC middleware
        self.assertEqual(revenue_response.status_code, 403)
        data = json.loads(revenue_response.content)
        self.assertIn('error', data)
    
    def test_mock_user_auth_flow(self):
        """Test authentication flow with mock users"""
        # Login with mock user
        login_response = self.client.post('/api/auth/login', {
            'username': 'finance',
            'password': 'finance123'
        }, content_type='application/json')
        
        self.assertEqual(login_response.status_code, 200)
        data = json.loads(login_response.content)
        token = data['token']
        
        # Verify token
        verify_response = self.client.get('/api/auth/verify',
                                         HTTP_AUTHORIZATION=f'Bearer {token}')
        
        self.assertEqual(verify_response.status_code, 200)
        verify_data = json.loads(verify_response.content)
        self.assertTrue(verify_data['valid'])
        self.assertEqual(verify_data['user']['role'], UserRole.CA_FINANCE.value)
