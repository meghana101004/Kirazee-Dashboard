"""
API views for Kirazee RBAC Dashboard
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from api.models import User, UserRole
from api.jwt_utils import generate_jwt_token, decode_jwt_token, extract_user_from_token
from api.validators import (
    validate_username,
    validate_password,
    validate_role,
    validate_query_param,
    validate_integer_param,
    sanitize_search_query,
    sanitize_string
)
from api.mock_data import (
    get_sample_users, 
    get_overview_metrics,
    get_revenue_metrics,
    get_order_metrics,
    get_kyc_metrics,
    get_system_logs,
    get_api_analytics
)
import uuid


class LoginView(APIView):
    """
    POST /api/auth/login
    Authenticate user and return JWT token
    """
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': 'Username and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate and sanitize username
        is_valid, error_msg = validate_username(username)
        if not is_valid:
            return Response(
                {'error': error_msg},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate password
        is_valid, error_msg = validate_password(password)
        if not is_valid:
            return Response(
                {'error': error_msg},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Try to find user in database
        try:
            user = User.objects.get(username=username, is_active=True)
            
            # Verify password
            if not user.check_password(password):
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Update last login
            user.last_login = timezone.now()
            user.save()
            
            # Generate JWT token
            token = generate_jwt_token(
                user_id=str(user.id),
                username=user.username,
                role=user.role
            )
            
            return Response({
                'token': token,
                'user': {
                    'id': str(user.id),
                    'username': user.username,
                    'role': user.role
                }
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            # Check mock data for prototype testing
            sample_users = get_sample_users()
            mock_user = next((u for u in sample_users if u['username'] == username), None)
            
            if mock_user and mock_user['password'] == password:
                # Generate token for mock user
                mock_user_id = str(uuid.uuid4())
                token = generate_jwt_token(
                    user_id=mock_user_id,
                    username=mock_user['username'],
                    role=mock_user['role']
                )
                
                return Response({
                    'token': token,
                    'user': {
                        'id': mock_user_id,
                        'username': mock_user['username'],
                        'role': mock_user['role']
                    }
                }, status=status.HTTP_200_OK)
            
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )


class LogoutView(APIView):
    """
    POST /api/auth/logout
    Logout user (client-side token invalidation)
    """
    
    def post(self, request):
        # Extract token from Authorization header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response(
                {'error': 'No token provided'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        token = auth_header.split(' ')[1]
        
        # Validate token
        user_info = extract_user_from_token(token)
        if not user_info:
            return Response(
                {'error': 'Invalid or expired token'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # In a production system, we would add the token to a blacklist
        # For this prototype, logout is handled client-side by removing the token
        
        return Response(
            {'message': 'Logged out successfully'},
            status=status.HTTP_200_OK
        )


class VerifyTokenView(APIView):
    """
    GET /api/auth/verify
    Verify JWT token validity and return user info
    """
    
    def get(self, request):
        # Extract token from Authorization header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response(
                {'valid': False, 'error': 'No token provided'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        token = auth_header.split(' ')[1]
        
        # Decode and validate token
        user_info = extract_user_from_token(token)
        
        if user_info:
            return Response({
                'valid': True,
                'user': {
                    'id': user_info['user_id'],
                    'username': user_info['username'],
                    'role': user_info['role']
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {'valid': False, 'error': 'Invalid or expired token'},
                status=status.HTTP_401_UNAUTHORIZED
            )



class MetricsOverviewView(APIView):
    """
    GET /api/metrics/overview
    Return filtered metrics based on user role
    """
    
    def get(self, request):
        # User role is attached by JWTAuthenticationMiddleware
        user_role = getattr(request, 'user_role', None)
        
        if not user_role:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Get metrics filtered by user role
        metrics = get_overview_metrics(user_role)
        
        return Response(metrics, status=status.HTTP_200_OK)



class RevenueMetricsView(APIView):
    """
    GET /api/metrics/revenue
    Return revenue data with time range filtering
    Requires CA_Finance or Super_Admin permission
    """
    
    def get(self, request):
        # Get time range parameter (optional)
        time_range = request.GET.get('time_range', 'week')
        
        # Validate time range
        valid_ranges = ['day', 'week', 'month', 'year']
        is_valid, error_msg = validate_query_param(time_range, 'time_range', valid_ranges)
        if not is_valid:
            return Response(
                {'error': error_msg},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get revenue metrics
        revenue_data = get_revenue_metrics()
        
        # Filter data based on time range
        # For this prototype, we return all data with the time_range parameter
        # In production, this would filter the daily_data based on the range
        response_data = {
            "data": revenue_data["daily_data"],
            "total": revenue_data["total"],
            "average": revenue_data["average_order_value"],
            "time_range": time_range
        }
        
        return Response(response_data, status=status.HTTP_200_OK)



class OrdersMetricsView(APIView):
    """
    GET /api/metrics/orders
    Return orders with status filtering and pagination
    Requires Manager, Support, or Super_Admin permission
    """
    
    def get(self, request):
        # Get query parameters
        status_filter = request.GET.get('status', None)
        limit_str = request.GET.get('limit', '50')
        offset_str = request.GET.get('offset', '0')
        
        # Validate status filter if provided
        valid_statuses = ['pending', 'completed', 'cancelled']
        is_valid, error_msg = validate_query_param(status_filter, 'status', valid_statuses)
        if not is_valid:
            return Response(
                {'error': error_msg},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate and convert limit
        is_valid, error_msg, limit = validate_integer_param(limit_str, 'limit', min_value=1, max_value=1000)
        if not is_valid:
            return Response(
                {'error': error_msg},
                status=status.HTTP_400_BAD_REQUEST
            )
        limit = limit or 50
        
        # Validate and convert offset
        is_valid, error_msg, offset = validate_integer_param(offset_str, 'offset', min_value=0)
        if not is_valid:
            return Response(
                {'error': error_msg},
                status=status.HTTP_400_BAD_REQUEST
            )
        offset = offset or 0
        
        # Get order metrics
        order_data = get_order_metrics()
        orders = order_data["recent_orders"]
        
        # Filter by status if provided
        if status_filter:
            orders = [order for order in orders if order["status"] == status_filter]
        
        # Apply pagination
        total_count = len(orders)
        paginated_orders = orders[offset:offset + limit]
        
        response_data = {
            "orders": paginated_orders,
            "total_count": total_count,
            "limit": limit,
            "offset": offset
        }
        
        return Response(response_data, status=status.HTTP_200_OK)



class KYCPendingView(APIView):
    """
    GET /api/kyc/pending
    Return pending KYC verifications
    Requires KYC_Associate or Super_Admin permission
    """
    
    def get(self, request):
        # Get type filter parameter (optional)
        type_filter = request.GET.get('type', 'all')
        
        # Validate type filter
        valid_types = ['business', 'delivery_partner', 'all']
        is_valid, error_msg = validate_query_param(type_filter, 'type', valid_types)
        if not is_valid:
            return Response(
                {'error': error_msg},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get KYC metrics
        kyc_data = get_kyc_metrics()
        verifications = kyc_data["verifications"]
        
        # Filter by type if not 'all'
        if type_filter != 'all':
            verifications = [v for v in verifications if v["type"] == type_filter]
        
        response_data = {
            "verifications": verifications
        }
        
        return Response(response_data, status=status.HTTP_200_OK)



class KYCVerifyView(APIView):
    """
    POST /api/kyc/verify/<verification_id>
    Process KYC approval/rejection
    Requires KYC_Associate or Super_Admin permission
    """
    
    def post(self, request, verification_id):
        # Sanitize verification_id
        try:
            verification_id = sanitize_string(verification_id, max_length=100)
        except Exception as e:
            return Response(
                {'error': 'Invalid verification ID'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get action from request body
        action = request.data.get('action')
        reason = request.data.get('reason', '')
        
        # Validate action
        if action not in ['approve', 'reject']:
            return Response(
                {'error': 'Invalid action. Must be "approve" or "reject"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate and sanitize reason if provided
        if reason:
            try:
                reason = sanitize_string(reason, max_length=500)
            except Exception as e:
                return Response(
                    {'error': 'Invalid reason format'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Validate reason is provided for rejection
        if action == 'reject' and not reason:
            return Response(
                {'error': 'Reason is required for rejection'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # In a real system, we would update the verification status in the database
        # For this prototype, we just return a success response
        
        response_data = {
            "message": "Verification processed successfully",
            "verification_id": verification_id,
            "status": "approved" if action == "approve" else "rejected"
        }
        
        if action == "reject":
            response_data["reason"] = reason
        
        return Response(response_data, status=status.HTTP_200_OK)



class SystemLogsView(APIView):
    """
    GET /api/system/logs
    Return system logs with filtering
    Requires Developer or Super_Admin permission
    """
    
    def get(self, request):
        # Get query parameters
        level = request.GET.get('level', None)
        limit_str = request.GET.get('limit', '100')
        
        # Validate level filter if provided
        valid_levels = ['info', 'warning', 'error']
        is_valid, error_msg = validate_query_param(level, 'level', valid_levels)
        if not is_valid:
            return Response(
                {'error': error_msg},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate and convert limit
        is_valid, error_msg, limit = validate_integer_param(limit_str, 'limit', min_value=1, max_value=1000)
        if not is_valid:
            return Response(
                {'error': error_msg},
                status=status.HTTP_400_BAD_REQUEST
            )
        limit = limit or 100
        
        # Get system logs
        logs = get_system_logs()
        
        # Filter by level if provided
        if level:
            logs = [log for log in logs if log["level"] == level]
        
        # Apply limit
        logs = logs[:limit]
        
        response_data = {
            "logs": logs
        }
        
        return Response(response_data, status=status.HTTP_200_OK)


class APIAnalyticsView(APIView):
    """
    GET /api/system/api-analytics
    Return API analytics data
    Requires Developer or Super_Admin permission
    """
    
    def get(self, request):
        # Get API analytics
        analytics = get_api_analytics()
        
        return Response(analytics, status=status.HTTP_200_OK)


class UsersListView(APIView):
    """
    GET /api/users
    Return list of all users
    Requires Super_Admin permission only
    """
    
    def get(self, request):
        # Get all active users from database
        users = User.objects.filter(is_active=True).order_by('-created_at')
        
        # Serialize user data
        users_data = [
            {
                'id': str(user.id),
                'username': user.username,
                'role': user.role,
                'created_at': user.created_at.isoformat() if user.created_at else None,
                'last_login': user.last_login.isoformat() if user.last_login else None
            }
            for user in users
        ]
        
        return Response({'users': users_data}, status=status.HTTP_200_OK)


class UserCreateView(APIView):
    """
    POST /api/users
    Create a new user
    Requires Super_Admin permission only
    """
    
    def post(self, request):
        # Get required fields from request
        username = request.data.get('username')
        password = request.data.get('password')
        role = request.data.get('role')
        
        # Validate username
        is_valid, error_msg = validate_username(username)
        if not is_valid:
            return Response(
                {'error': error_msg},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate password
        is_valid, error_msg = validate_password(password)
        if not is_valid:
            return Response(
                {'error': error_msg},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate role
        valid_roles = [r.value for r in UserRole]
        is_valid, error_msg = validate_role(role, valid_roles)
        if not is_valid:
            return Response(
                {'error': error_msg},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if username already exists
        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create new user
        user = User(username=username, role=role)
        user.set_password(password)  # Hash password before storage
        user.save()
        
        # Return created user data
        return Response({
            'message': 'User created successfully',
            'user': {
                'id': str(user.id),
                'username': user.username,
                'role': user.role
            }
        }, status=status.HTTP_201_CREATED)


class UserUpdateView(APIView):
    """
    PUT /api/users/<user_id>
    Update an existing user
    
    DELETE /api/users/<user_id>
    Delete a user (soft delete by setting is_active to False)
    
    Requires Super_Admin permission only
    """
    
    def put(self, request, user_id):
        # Sanitize user_id
        try:
            user_id = sanitize_string(user_id, max_length=100)
        except Exception:
            return Response(
                {'error': 'Invalid user ID'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get user from database
        try:
            user = User.objects.get(id=user_id, is_active=True)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get optional fields from request
        username = request.data.get('username')
        password = request.data.get('password')
        role = request.data.get('role')
        
        # Validate username if provided
        if username:
            is_valid, error_msg = validate_username(username)
            if not is_valid:
                return Response(
                    {'error': error_msg},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Check if new username already exists (excluding current user)
            if User.objects.filter(username=username).exclude(id=user_id).exists():
                return Response(
                    {'error': 'Username already exists'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.username = username
        
        # Validate password if provided
        if password:
            is_valid, error_msg = validate_password(password)
            if not is_valid:
                return Response(
                    {'error': error_msg},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.set_password(password)  # Hash password before storage
        
        # Validate role if provided
        if role:
            valid_roles = [r.value for r in UserRole]
            is_valid, error_msg = validate_role(role, valid_roles)
            if not is_valid:
                return Response(
                    {'error': error_msg},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.role = role
        
        # Save updated user
        user.save()
        
        # Return updated user data
        return Response({
            'message': 'User updated successfully',
            'user': {
                'id': str(user.id),
                'username': user.username,
                'role': user.role
            }
        }, status=status.HTTP_200_OK)
    
    def delete(self, request, user_id):
        # Sanitize user_id
        try:
            user_id = sanitize_string(user_id, max_length=100)
        except Exception:
            return Response(
                {'error': 'Invalid user ID'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get user from database
        try:
            user = User.objects.get(id=user_id, is_active=True)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Soft delete user by setting is_active to False
        user.is_active = False
        user.save()
        
        # Note: In a production system, we would also:
        # 1. Add the user's active tokens to a blacklist
        # 2. Log the deletion for audit purposes
        # For this prototype, tokens will naturally expire after 24 hours
        
        return Response(
            {'message': 'User deleted successfully'},
            status=status.HTTP_200_OK
        )


class UserDeleteView(APIView):
    """
    DELETE /api/users/<user_id>
    Delete a user (soft delete by setting is_active to False)
    Requires Super_Admin permission only
    """
    
    def delete(self, request, user_id):
        # Sanitize user_id
        try:
            user_id = sanitize_string(user_id, max_length=100)
        except Exception:
            return Response(
                {'error': 'Invalid user ID'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get user from database
        try:
            user = User.objects.get(id=user_id, is_active=True)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Soft delete user by setting is_active to False
        user.is_active = False
        user.save()
        
        # Note: In a production system, we would also:
        # 1. Add the user's active tokens to a blacklist
        # 2. Log the deletion for audit purposes
        # For this prototype, tokens will naturally expire after 24 hours
        
        return Response(
            {'message': 'User deleted successfully'},
            status=status.HTTP_200_OK
        )
