"""
Tests for JWT authentication system
"""
import pytest
from django.test import TestCase
from rest_framework.test import APIClient
from api.jwt_utils import generate_jwt_token, decode_jwt_token, validate_jwt_token, extract_user_from_token
from api.models import User, UserRole
import time


class TestJWTUtils(TestCase):
    """Test JWT token generation and validation utilities"""
    
    def test_generate_jwt_token(self):
        """Test JWT token generation with user data"""
        user_id = "test-user-id"
        username = "testuser"
        role = UserRole.MANAGER.value
        
        token = generate_jwt_token(user_id, username, role)
        
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0
    
    def test_decode_jwt_token(self):
        """Test JWT token decoding"""
        user_id = "test-user-id"
        username = "testuser"
        role = UserRole.MANAGER.value
        
        token = generate_jwt_token(user_id, username, role)
        payload = decode_jwt_token(token)
        
        assert payload is not None
        assert payload['user_id'] == user_id
        assert payload['username'] == username
        assert payload['role'] == role
        assert 'iat' in payload
        assert 'exp' in payload
    
    def test_validate_jwt_token(self):
        """Test JWT token validation"""
        user_id = "test-user-id"
        username = "testuser"
        role = UserRole.MANAGER.value
        
        token = generate_jwt_token(user_id, username, role)
        
        assert validate_jwt_token(token) is True
        assert validate_jwt_token("invalid-token") is False
    
    def test_extract_user_from_token(self):
        """Test extracting user info from JWT token"""
        user_id = "test-user-id"
        username = "testuser"
        role = UserRole.MANAGER.value
        
        token = generate_jwt_token(user_id, username, role)
        user_info = extract_user_from_token(token)
        
        assert user_info is not None
        assert user_info['user_id'] == user_id
        assert user_info['username'] == username
        assert user_info['role'] == role
    
    def test_invalid_token_returns_none(self):
        """Test that invalid token returns None"""
        payload = decode_jwt_token("invalid-token")
        assert payload is None
        
        user_info = extract_user_from_token("invalid-token")
        assert user_info is None


@pytest.mark.django_db
class TestAuthenticationEndpoints(TestCase):
    """Test authentication API endpoints"""
    
    def setUp(self):
        """Set up test client"""
        self.client = APIClient()
    
    def test_login_with_mock_user(self):
        """Test login with mock user credentials"""
        response = self.client.post('/api/auth/login', {
            'username': 'superadmin',
            'password': 'admin123'
        }, format='json')
        
        assert response.status_code == 200
        assert 'token' in response.data
        assert 'user' in response.data
        assert response.data['user']['username'] == 'superadmin'
        assert response.data['user']['role'] == UserRole.SUPER_ADMIN.value
    
    def test_login_with_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = self.client.post('/api/auth/login', {
            'username': 'invalid',
            'password': 'wrongpassword'
        }, format='json')
        
        assert response.status_code == 401
        assert 'error' in response.data
    
    def test_login_missing_username(self):
        """Test login with missing username"""
        response = self.client.post('/api/auth/login', {
            'password': 'password'
        }, format='json')
        
        assert response.status_code == 400
        assert 'error' in response.data
    
    def test_login_missing_password(self):
        """Test login with missing password"""
        response = self.client.post('/api/auth/login', {
            'username': 'testuser'
        }, format='json')
        
        assert response.status_code == 400
        assert 'error' in response.data
    
    def test_verify_valid_token(self):
        """Test token verification with valid token"""
        # First login to get a token
        login_response = self.client.post('/api/auth/login', {
            'username': 'manager',
            'password': 'manager123'
        }, format='json')
        
        token = login_response.data['token']
        
        # Verify the token
        response = self.client.get('/api/auth/verify', 
                                   HTTP_AUTHORIZATION=f'Bearer {token}')
        
        assert response.status_code == 200
        assert response.data['valid'] is True
        assert 'user' in response.data
        assert response.data['user']['username'] == 'manager'
    
    def test_verify_invalid_token(self):
        """Test token verification with invalid token"""
        response = self.client.get('/api/auth/verify',
                                   HTTP_AUTHORIZATION='Bearer invalid-token')
        
        assert response.status_code == 401
        import json
        data = json.loads(response.content)
        assert 'error' in data
    
    def test_verify_missing_token(self):
        """Test token verification without token"""
        response = self.client.get('/api/auth/verify')
        
        assert response.status_code == 401
        import json
        data = json.loads(response.content)
        assert 'error' in data
    
    def test_logout_with_valid_token(self):
        """Test logout with valid token"""
        # First login to get a token
        login_response = self.client.post('/api/auth/login', {
            'username': 'support',
            'password': 'support123'
        }, format='json')
        
        token = login_response.data['token']
        
        # Logout
        response = self.client.post('/api/auth/logout',
                                    HTTP_AUTHORIZATION=f'Bearer {token}')
        
        assert response.status_code == 200
        assert 'message' in response.data
    
    def test_logout_without_token(self):
        """Test logout without token"""
        response = self.client.post('/api/auth/logout')
        
        assert response.status_code == 401
        import json
        data = json.loads(response.content)
        assert 'error' in data
    
    def test_all_mock_users_can_login(self):
        """Test that all mock users can login successfully"""
        mock_users = [
            ('superadmin', 'admin123', UserRole.SUPER_ADMIN.value),
            ('manager', 'manager123', UserRole.MANAGER.value),
            ('support', 'support123', UserRole.SUPPORT.value),
            ('kyc', 'kyc12345', UserRole.KYC_ASSOCIATE.value),
            ('finance', 'finance123', UserRole.CA_FINANCE.value),
            ('developer', 'dev12345', UserRole.DEVELOPER.value),
        ]
        
        for username, password, expected_role in mock_users:
            response = self.client.post('/api/auth/login', {
                'username': username,
                'password': password
            }, format='json')
            
            assert response.status_code == 200, f"Login failed for {username}"
            assert response.data['user']['role'] == expected_role
            assert 'token' in response.data
