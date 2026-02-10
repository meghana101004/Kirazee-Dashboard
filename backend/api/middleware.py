"""
Authentication and authorization middleware for Kirazee RBAC Dashboard
"""
from django.http import JsonResponse
from api.jwt_utils import extract_user_from_token
from api.models import UserRole, Permission, has_permission


class JWTAuthenticationMiddleware:
    """
    Middleware to extract and validate JWT tokens from Authorization header.
    Attaches user info to request object for downstream processing.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        # Paths that don't require authentication
        self.exempt_paths = [
            '/api/auth/login',
        ]
    
    def __call__(self, request):
        # Check if path is exempt from authentication
        if any(request.path.startswith(path) for path in self.exempt_paths):
            return self.get_response(request)
        
        # Only apply to API endpoints
        if not request.path.startswith('/api/'):
            return self.get_response(request)
        
        # Extract token from Authorization header
        auth_header = request.headers.get('Authorization', '')
        
        if not auth_header.startswith('Bearer '):
            return JsonResponse(
                {'error': 'No token provided'},
                status=401
            )
        
        token = auth_header.split(' ')[1] if len(auth_header.split(' ')) > 1 else ''
        
        if not token:
            return JsonResponse(
                {'error': 'Invalid token format'},
                status=401
            )
        
        # Validate token and extract user info
        user_info = extract_user_from_token(token)
        
        if not user_info:
            return JsonResponse(
                {'error': 'Invalid or expired token'},
                status=401
            )
        
        # Attach user info to request object
        request.user_id = user_info['user_id']
        request.username = user_info['username']
        request.user_role = user_info['role']
        
        # Continue processing request
        response = self.get_response(request)
        return response


class RBACPermissionMiddleware:
    """
    Middleware to check if user's role has required permission for endpoint.
    Must be placed after JWTAuthenticationMiddleware in middleware stack.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
        # Define endpoint permission requirements
        # Format: (path_prefix, required_permission)
        self.endpoint_permissions = [
            ('/api/metrics/revenue', Permission.VIEW_REVENUE),
            ('/api/metrics/orders', Permission.VIEW_ORDERS),
            ('/api/metrics/businesses', Permission.VIEW_BUSINESSES),
            ('/api/metrics/customers', Permission.VIEW_CUSTOMERS),
            ('/api/metrics/delivery', Permission.VIEW_DELIVERY_PARTNERS),
            ('/api/kyc/', Permission.VIEW_KYC_QUEUE),
            ('/api/system/logs', Permission.VIEW_SYSTEM_LOGS),
            ('/api/system/api-analytics', Permission.VIEW_API_ANALYTICS),
            ('/api/users', Permission.MANAGE_USERS),
        ]
        
        # Paths exempt from permission checking
        self.exempt_paths = [
            '/api/auth/login',
            '/api/auth/logout',
            '/api/auth/verify',
            '/api/metrics/overview',  # Filtered by role in view
        ]
    
    def __call__(self, request):
        # Check if path is exempt from permission checking
        if any(request.path.startswith(path) for path in self.exempt_paths):
            return self.get_response(request)
        
        # Only apply to API endpoints
        if not request.path.startswith('/api/'):
            return self.get_response(request)
        
        # Check if user_role is attached (should be set by JWTAuthenticationMiddleware)
        if not hasattr(request, 'user_role'):
            return JsonResponse(
                {'error': 'Authentication required'},
                status=401
            )
        
        # Find required permission for this endpoint
        required_permission = None
        for path_prefix, permission in self.endpoint_permissions:
            if request.path.startswith(path_prefix):
                required_permission = permission
                break
        
        # If no specific permission required, allow access
        if required_permission is None:
            return self.get_response(request)
        
        # Convert role string to UserRole enum
        try:
            user_role = UserRole(request.user_role)
        except ValueError:
            return JsonResponse(
                {'error': 'Invalid user role'},
                status=403
            )
        
        # Check if user has required permission
        if not has_permission(user_role, required_permission):
            return JsonResponse(
                {'error': 'Access denied'},
                status=403
            )
        
        # User has permission, continue processing
        response = self.get_response(request)
        return response
