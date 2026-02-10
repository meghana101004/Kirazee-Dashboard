"""
Secure error handling for Kirazee RBAC Dashboard
Ensures error messages don't expose sensitive information
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
import logging
import traceback

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that ensures error messages don't expose sensitive data.
    
    Args:
        exc: The exception that was raised
        context: Context information about the request
        
    Returns:
        Response object with sanitized error message
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # Log the full error details server-side for debugging
    request = context.get('request')
    if request:
        logger.error(
            f"API Error: {exc.__class__.__name__} at {request.path}",
            exc_info=True,
            extra={
                'request_path': request.path,
                'request_method': request.method,
                'user': getattr(request, 'username', 'anonymous'),
            }
        )
    
    if response is not None:
        # Sanitize error response to not expose sensitive information
        sanitized_data = sanitize_error_response(response.data, response.status_code)
        response.data = sanitized_data
        return response
    
    # Handle unexpected exceptions
    logger.error(
        f"Unhandled exception: {exc.__class__.__name__}",
        exc_info=True
    )
    
    # Return generic error message without exposing details
    return Response(
        {
            'error': 'An internal server error occurred. Please try again later.',
            'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )


def sanitize_error_response(error_data, status_code):
    """
    Sanitize error response to remove sensitive information.
    
    Args:
        error_data: Original error data
        status_code: HTTP status code
        
    Returns:
        Sanitized error data
    """
    # For 500 errors, don't expose any details
    if status_code >= 500:
        return {
            'error': 'An internal server error occurred. Please try again later.',
            'status_code': status_code
        }
    
    # For other errors, ensure we don't expose:
    # - Stack traces
    # - Database schema details
    # - Internal file paths
    # - System configuration
    
    if isinstance(error_data, dict):
        sanitized = {}
        for key, value in error_data.items():
            # Skip keys that might contain sensitive info
            if key.lower() in ['traceback', 'stack', 'exception', 'exc_info']:
                continue
            
            # Recursively sanitize nested dicts
            if isinstance(value, dict):
                sanitized[key] = sanitize_error_response(value, status_code)
            elif isinstance(value, list):
                sanitized[key] = [
                    sanitize_error_response(item, status_code) if isinstance(item, dict) else item
                    for item in value
                ]
            else:
                # Remove file paths and system info from error messages
                if isinstance(value, str):
                    value = remove_sensitive_patterns(value)
                sanitized[key] = value
        
        return sanitized
    
    return error_data


def remove_sensitive_patterns(text):
    """
    Remove sensitive patterns from error messages.
    
    Args:
        text: Error message text
        
    Returns:
        Sanitized text
    """
    import re
    
    # Remove file paths (Unix and Windows)
    text = re.sub(r'/[\w/.-]+\.py', '[file]', text)
    text = re.sub(r'[A-Z]:\\[\w\\.-]+\.py', '[file]', text)
    
    # Remove line numbers
    text = re.sub(r'line \d+', 'line [redacted]', text)
    
    # Remove SQL-like patterns
    text = re.sub(r'SELECT .+ FROM', 'SELECT [redacted] FROM', text, flags=re.IGNORECASE)
    text = re.sub(r'INSERT INTO .+ VALUES', 'INSERT INTO [redacted] VALUES', text, flags=re.IGNORECASE)
    
    # Remove connection strings
    text = re.sub(r'postgresql://[^\s]+', 'postgresql://[redacted]', text)
    text = re.sub(r'mysql://[^\s]+', 'mysql://[redacted]', text)
    
    return text


class SecureErrorMiddleware:
    """
    Middleware to catch and sanitize all unhandled exceptions.
    Ensures no sensitive information is exposed in error responses.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        return response
    
    def process_exception(self, request, exception):
        """
        Process exceptions that occur during request handling.
        """
        # Log the full error server-side
        logger.error(
            f"Exception during request processing: {exception.__class__.__name__}",
            exc_info=True,
            extra={
                'request_path': request.path,
                'request_method': request.method,
            }
        )
        
        # Return sanitized error response
        return JsonResponse(
            {
                'error': 'An internal server error occurred. Please try again later.',
                'status_code': 500
            },
            status=500
        )
