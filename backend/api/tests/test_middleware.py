"""
Unit tests for authentication and authorization middleware
"""
import pytest
from django.test import RequestFactory, TestCase
from django.http import JsonResponse
from api.middleware import JWTAuthenticationMiddleware, RBACPermissionMiddleware
from api.jwt_utils import generate_jwt_token
from api.models import UserRole
import uuid


class TestJWTAuthenticationMiddleware(TestCase):
    """Test JWT authentication middleware"""
    
    def setUp(self):
        self.factory = RequestFactory()
        self.middleware = JWTAuthenticationMiddleware(get_response=lambda r: JsonResponse({'success': True}))
    
    def test_valid_token_passes_through(self):
        """Test that valid token is accepted and user info is attached"""
        # Generate valid token
        user_id = str(uuid.uuid4())
        token = generate_jwt_token(user_id, 'testuser', UserRole.MANAGER.value)
        
        # Create request with token
        request = self.factory.get('/api/metrics/overview')
        request.headers = {'Authorization': f'Bearer {token}'}
        
        # Process request
        response = self.middleware(request)
        
        # Verify user info is attached
        self.assertEqual(request.user_id, user_id)
        self.assertEqual(request.username, 'testuser')
        self.assertEqual(request.user_role, UserRole.MANAGER.value)
        self.assertEqual(response.status_code, 200)
    
    def test_invalid_token_is_rejected(self):
        """Test that invalid token returns 401"""
        # Create request with invalid token
        request = self.factory.get('/api/metrics/overview')
        request.headers = {'Authorization': 'Bearer invalid_token_here'}
        
        # Process request
        response = self.middleware(request)
        
        # Verify rejection
        self.assertEqual(response.status_code, 401)
        import json
        self.assertIn('error', json.loads(response.content))
    
    def test_missing_token_is_rejected(self):
        """Test that missing token returns 401"""
        # Create request without token
        request = self.factory.get('/api/metrics/overview')
        request.headers = {}
        
        # Process request
        response = self.middleware(request)
        
        # Verify rejection
        self.assertEqual(response.status_code, 401)
        import json
        self.assertIn('error', json.loads(response.content))
    
    def test_login_endpoint_is_exempt(self):
        """Test that login endpoint doesn't require token"""
        # Create request to login endpoint without token
        request = self.factory.post('/api/auth/login')
        request.headers = {}
        
        # Process request
        response = self.middleware(request)
        
        # Verify it passes through
        self.assertEqual(response.status_code, 200)


class TestRBACPermissionMiddleware(TestCase):
    """Test RBAC permission checking middleware"""
    
    def setUp(self):
        self.factory = RequestFactory()
        self.middleware = RBACPermissionMiddleware(get_response=lambda r: JsonResponse({'success': True}))
    
    def test_authorized_role_passes(self):
        """Test that user with correct permission can access endpoint"""
        # Create request with CA_Finance role (has VIEW_REVENUE permission)
        request = self.factory.get('/api/metrics/revenue')
        request.user_role = UserRole.CA_FINANCE.value
        
        # Process request
        response = self.middleware(request)
        
        # Verify access granted
        self.assertEqual(response.status_code, 200)
    
    def test_unauthorized_role_is_denied(self):
        """Test that user without permission gets 403"""
        # Create request with Support role (doesn't have VIEW_REVENUE permission)
        request = self.factory.get('/api/metrics/revenue')
        request.user_role = UserRole.SUPPORT.value
        
        # Process request
        response = self.middleware(request)
        
        # Verify access denied
        self.assertEqual(response.status_code, 403)
        import json
        self.assertIn('error', json.loads(response.content))
    
    def test_super_admin_has_all_permissions(self):
        """Test that Super_Admin can access all endpoints"""
        # Test various endpoints
        endpoints = [
            '/api/metrics/revenue',
            '/api/metrics/orders',
            '/api/users',
            '/api/kyc/pending',
            '/api/system/logs',
        ]
        
        for endpoint in endpoints:
            request = self.factory.get(endpoint)
            request.user_role = UserRole.SUPER_ADMIN.value
            
            response = self.middleware(request)
            
            # Verify access granted
            self.assertEqual(response.status_code, 200, f"Super_Admin denied access to {endpoint}")
    
    def test_exempt_paths_dont_require_permission(self):
        """Test that exempt paths bypass permission checking"""
        # Test exempt paths
        exempt_paths = [
            '/api/auth/login',
            '/api/auth/logout',
            '/api/auth/verify',
            '/api/metrics/overview',
        ]
        
        for path in exempt_paths:
            request = self.factory.get(path)
            # Don't set user_role to simulate unauthenticated request
            
            response = self.middleware(request)
            
            # Verify it passes through (doesn't return 401 or 403)
            self.assertEqual(response.status_code, 200, f"Exempt path {path} was blocked")
    
    def test_role_permission_checking(self):
        """Test specific role-endpoint permission combinations"""
        test_cases = [
            # (endpoint, role, should_pass)
            ('/api/metrics/orders', UserRole.MANAGER, True),
            ('/api/metrics/orders', UserRole.SUPPORT, True),
            ('/api/metrics/orders', UserRole.KYC_ASSOCIATE, False),
            ('/api/users', UserRole.SUPER_ADMIN, True),
            ('/api/users', UserRole.MANAGER, False),
            ('/api/kyc/pending', UserRole.KYC_ASSOCIATE, True),
            ('/api/kyc/pending', UserRole.DEVELOPER, False),
            ('/api/system/logs', UserRole.DEVELOPER, True),
            ('/api/system/logs', UserRole.CA_FINANCE, False),
        ]
        
        for endpoint, role, should_pass in test_cases:
            request = self.factory.get(endpoint)
            request.user_role = role.value
            
            response = self.middleware(request)
            
            if should_pass:
                self.assertEqual(
                    response.status_code, 200,
                    f"{role.value} should have access to {endpoint}"
                )
            else:
                self.assertEqual(
                    response.status_code, 403,
                    f"{role.value} should be denied access to {endpoint}"
                )
