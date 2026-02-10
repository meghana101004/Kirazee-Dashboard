"""
Rate limiting middleware for Kirazee RBAC Dashboard
Prevents brute force attacks on authentication endpoints
"""
from django.http import JsonResponse
from django.core.cache import cache
from django.utils import timezone
from django.conf import settings
import hashlib


class RateLimitMiddleware:
    """
    Middleware to implement rate limiting on authentication endpoints.
    Limits login attempts to 5 per minute per IP address.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
        # Endpoints to apply rate limiting
        self.rate_limited_paths = [
            '/api/auth/login',
        ]
        
        # Rate limit configuration
        self.max_requests = 5  # Maximum requests per window
        self.window_seconds = 60  # Time window in seconds (1 minute)
        
        # Disable rate limiting in test environment
        self.enabled = not getattr(settings, 'TESTING', False)
    
    def __call__(self, request):
        # Skip rate limiting if disabled (e.g., in tests)
        if not self.enabled:
            return self.get_response(request)
        
        # Check if path should be rate limited
        if any(request.path.startswith(path) for path in self.rate_limited_paths):
            # Get client IP address
            client_ip = self._get_client_ip(request)
            
            # Check rate limit
            is_allowed, remaining, reset_time = self._check_rate_limit(client_ip, request.path)
            
            if not is_allowed:
                # Rate limit exceeded
                return JsonResponse(
                    {
                        'error': 'Too many requests. Please try again later.',
                        'retry_after': reset_time
                    },
                    status=429
                )
        
        # Continue processing request
        response = self.get_response(request)
        return response
    
    def _get_client_ip(self, request):
        """
        Extract client IP address from request.
        Handles proxy headers like X-Forwarded-For.
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            # Take the first IP in the chain
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '')
        
        return ip
    
    def _check_rate_limit(self, client_ip, path):
        """
        Check if client has exceeded rate limit.
        
        Args:
            client_ip: Client IP address
            path: Request path
            
        Returns:
            Tuple of (is_allowed, remaining_requests, reset_time_seconds)
        """
        # Create cache key from IP and path
        cache_key = self._get_cache_key(client_ip, path)
        
        # Get current request count and timestamp
        rate_data = cache.get(cache_key)
        
        current_time = timezone.now().timestamp()
        
        if rate_data is None:
            # First request in window
            rate_data = {
                'count': 1,
                'start_time': current_time
            }
            cache.set(cache_key, rate_data, self.window_seconds)
            return True, self.max_requests - 1, self.window_seconds
        
        # Check if window has expired
        elapsed_time = current_time - rate_data['start_time']
        
        if elapsed_time >= self.window_seconds:
            # Window expired, reset counter
            rate_data = {
                'count': 1,
                'start_time': current_time
            }
            cache.set(cache_key, rate_data, self.window_seconds)
            return True, self.max_requests - 1, self.window_seconds
        
        # Window still active, check count
        if rate_data['count'] >= self.max_requests:
            # Rate limit exceeded
            reset_time = int(self.window_seconds - elapsed_time)
            return False, 0, reset_time
        
        # Increment counter
        rate_data['count'] += 1
        remaining_time = int(self.window_seconds - elapsed_time)
        cache.set(cache_key, rate_data, remaining_time)
        
        remaining_requests = self.max_requests - rate_data['count']
        return True, remaining_requests, remaining_time
    
    def _get_cache_key(self, client_ip, path):
        """
        Generate cache key for rate limiting.
        
        Args:
            client_ip: Client IP address
            path: Request path
            
        Returns:
            Cache key string
        """
        # Hash IP and path to create cache key
        key_string = f"rate_limit:{path}:{client_ip}"
        # Use hash to keep key length consistent
        key_hash = hashlib.md5(key_string.encode()).hexdigest()
        return f"rl:{key_hash}"
