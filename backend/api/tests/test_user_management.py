"""
Unit tests for user management API endpoints
"""
import pytest
from django.test import TestCase, Client
from api.models import User, UserRole
from api.jwt_utils import generate_jwt_token
import json


class UserManagementEndpointsTest(TestCase):
    """Test user management CRUD operations"""
    
    def setUp(self):
        """Set up test client and create test users"""
        self.client = Client()
        
        # Create a Super_Admin user for testing
        self.admin_user = User.objects.create(
            username='test_admin',
            role=UserRole.SUPER_ADMIN.value
        )
        self.admin_user.set_password('admin123')
        self.admin_user.save()
        
        # Generate JWT token for admin
        self.admin_token = generate_jwt_token(
            user_id=str(self.admin_user.id),
            username=self.admin_user.username,
            role=self.admin_user.role
        )
        
        # Create a Manager user for testing unauthorized access
        self.manager_user = User.objects.create(
            username='test_manager',
            role=UserRole.MANAGER.value
        )
        self.manager_user.set_password('manager123')
        self.manager_user.save()
        
        # Generate JWT token for manager
        self.manager_token = generate_jwt_token(
            user_id=str(self.manager_user.id),
            username=self.manager_user.username,
            role=self.manager_user.role
        )
    
    def test_get_users_as_super_admin(self):
        """Test GET /api/users returns list of users for Super_Admin"""
        response = self.client.get(
            '/api/users',
            HTTP_AUTHORIZATION=f'Bearer {self.admin_token}'
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('users', data)
        self.assertIsInstance(data['users'], list)
        self.assertGreaterEqual(len(data['users']), 2)  # At least admin and manager
    
    def test_get_users_as_non_admin_denied(self):
        """Test GET /api/users is denied for non-Super_Admin roles"""
        response = self.client.get(
            '/api/users',
            HTTP_AUTHORIZATION=f'Bearer {self.manager_token}'
        )
        
        self.assertEqual(response.status_code, 403)
        data = response.json()
        self.assertIn('error', data)
    
    def test_create_user_with_all_fields(self):
        """Test POST /api/users creates user with all required fields"""
        user_data = {
            'username': 'new_user',
            'password': 'password123',
            'role': UserRole.SUPPORT.value
        }
        
        response = self.client.post(
            '/api/users/create',
            data=json.dumps(user_data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.admin_token}'
        )
        
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data['message'], 'User created successfully')
        self.assertEqual(data['user']['username'], 'new_user')
        self.assertEqual(data['user']['role'], UserRole.SUPPORT.value)
        
        # Verify user was created in database
        user = User.objects.get(username='new_user')
        self.assertEqual(user.role, UserRole.SUPPORT.value)
        self.assertTrue(user.check_password('password123'))
    
    def test_create_user_missing_username(self):
        """Test POST /api/users fails when username is missing"""
        user_data = {
            'password': 'password123',
            'role': UserRole.SUPPORT.value
        }
        
        response = self.client.post(
            '/api/users/create',
            data=json.dumps(user_data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.admin_token}'
        )
        
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn('error', data)
        self.assertIn('Username', data['error'])
    
    def test_create_user_missing_password(self):
        """Test POST /api/users fails when password is missing"""
        user_data = {
            'username': 'new_user',
            'role': UserRole.SUPPORT.value
        }
        
        response = self.client.post(
            '/api/users/create',
            data=json.dumps(user_data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.admin_token}'
        )
        
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn('error', data)
        self.assertIn('Password', data['error'])
    
    def test_create_user_missing_role(self):
        """Test POST /api/users fails when role is missing"""
        user_data = {
            'username': 'new_user',
            'password': 'password123'
        }
        
        response = self.client.post(
            '/api/users/create',
            data=json.dumps(user_data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.admin_token}'
        )
        
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn('error', data)
        self.assertIn('Role', data['error'])
    
    def test_create_user_invalid_role(self):
        """Test POST /api/users fails when role is invalid"""
        user_data = {
            'username': 'new_user',
            'password': 'password123',
            'role': 'invalid_role'
        }
        
        response = self.client.post(
            '/api/users/create',
            data=json.dumps(user_data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.admin_token}'
        )
        
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn('error', data)
        self.assertIn('Invalid role', data['error'])
    
    def test_create_user_duplicate_username(self):
        """Test POST /api/users fails when username already exists"""
        user_data = {
            'username': 'test_admin',  # Already exists
            'password': 'password123',
            'role': UserRole.SUPPORT.value
        }
        
        response = self.client.post(
            '/api/users/create',
            data=json.dumps(user_data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.admin_token}'
        )
        
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn('error', data)
        self.assertIn('already exists', data['error'])
    
    def test_update_user_username(self):
        """Test PUT /api/users/<user_id> updates username"""
        update_data = {
            'username': 'updated_manager'
        }
        
        response = self.client.put(
            f'/api/users/{self.manager_user.id}',
            data=json.dumps(update_data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.admin_token}'
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['message'], 'User updated successfully')
        self.assertEqual(data['user']['username'], 'updated_manager')
        
        # Verify update in database
        self.manager_user.refresh_from_db()
        self.assertEqual(self.manager_user.username, 'updated_manager')
    
    def test_update_user_password(self):
        """Test PUT /api/users/<user_id> updates password"""
        update_data = {
            'password': 'new_password123'
        }
        
        response = self.client.put(
            f'/api/users/{self.manager_user.id}',
            data=json.dumps(update_data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.admin_token}'
        )
        
        self.assertEqual(response.status_code, 200)
        
        # Verify password was updated
        self.manager_user.refresh_from_db()
        self.assertTrue(self.manager_user.check_password('new_password123'))
    
    def test_update_user_role(self):
        """Test PUT /api/users/<user_id> updates role"""
        update_data = {
            'role': UserRole.DEVELOPER.value
        }
        
        response = self.client.put(
            f'/api/users/{self.manager_user.id}',
            data=json.dumps(update_data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.admin_token}'
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['user']['role'], UserRole.DEVELOPER.value)
        
        # Verify update in database
        self.manager_user.refresh_from_db()
        self.assertEqual(self.manager_user.role, UserRole.DEVELOPER.value)
    
    def test_update_user_invalid_role(self):
        """Test PUT /api/users/<user_id> fails with invalid role"""
        update_data = {
            'role': 'invalid_role'
        }
        
        response = self.client.put(
            f'/api/users/{self.manager_user.id}',
            data=json.dumps(update_data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.admin_token}'
        )
        
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn('error', data)
        self.assertIn('Invalid role', data['error'])
    
    def test_update_user_not_found(self):
        """Test PUT /api/users/<user_id> fails when user doesn't exist"""
        update_data = {
            'username': 'new_name'
        }
        
        response = self.client.put(
            '/api/users/00000000-0000-0000-0000-000000000000',
            data=json.dumps(update_data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.admin_token}'
        )
        
        self.assertEqual(response.status_code, 404)
        data = response.json()
        self.assertIn('error', data)
        self.assertIn('not found', data['error'])
    
    def test_delete_user(self):
        """Test DELETE /api/users/<user_id> soft deletes user"""
        response = self.client.delete(
            f'/api/users/{self.manager_user.id}/delete',
            HTTP_AUTHORIZATION=f'Bearer {self.admin_token}'
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['message'], 'User deleted successfully')
        
        # Verify user is soft deleted (is_active = False)
        self.manager_user.refresh_from_db()
        self.assertFalse(self.manager_user.is_active)
    
    def test_delete_user_not_found(self):
        """Test DELETE /api/users/<user_id> fails when user doesn't exist"""
        response = self.client.delete(
            '/api/users/00000000-0000-0000-0000-000000000000/delete',
            HTTP_AUTHORIZATION=f'Bearer {self.admin_token}'
        )
        
        self.assertEqual(response.status_code, 404)
        data = response.json()
        self.assertIn('error', data)
        self.assertIn('not found', data['error'])
    
    def test_create_user_as_non_admin_denied(self):
        """Test POST /api/users is denied for non-Super_Admin roles"""
        user_data = {
            'username': 'new_user',
            'password': 'password123',
            'role': UserRole.SUPPORT.value
        }
        
        response = self.client.post(
            '/api/users/create',
            data=json.dumps(user_data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.manager_token}'
        )
        
        self.assertEqual(response.status_code, 403)
    
    def test_update_user_as_non_admin_denied(self):
        """Test PUT /api/users/<user_id> is denied for non-Super_Admin roles"""
        update_data = {
            'username': 'updated_name'
        }
        
        response = self.client.put(
            f'/api/users/{self.manager_user.id}',
            data=json.dumps(update_data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.manager_token}'
        )
        
        self.assertEqual(response.status_code, 403)
    
    def test_delete_user_as_non_admin_denied(self):
        """Test DELETE /api/users/<user_id> is denied for non-Super_Admin roles"""
        response = self.client.delete(
            f'/api/users/{self.admin_user.id}/delete',
            HTTP_AUTHORIZATION=f'Bearer {self.manager_token}'
        )
        
        self.assertEqual(response.status_code, 403)
