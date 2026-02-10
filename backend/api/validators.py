"""
Input validation and sanitization utilities for Kirazee RBAC Dashboard
Prevents injection attacks and ensures data integrity
"""
import re
from typing import Optional, Tuple


class ValidationError(Exception):
    """Custom exception for validation errors"""
    pass


def sanitize_string(value: str, max_length: int = 255) -> str:
    """
    Sanitize string input by removing potentially dangerous characters.
    
    Args:
        value: Input string to sanitize
        max_length: Maximum allowed length
        
    Returns:
        Sanitized string
        
    Raises:
        ValidationError: If input is invalid
    """
    if not isinstance(value, str):
        raise ValidationError("Input must be a string")
    
    # Strip whitespace
    value = value.strip()
    
    # Check length
    if len(value) > max_length:
        raise ValidationError(f"Input exceeds maximum length of {max_length}")
    
    # Remove null bytes and control characters
    value = re.sub(r'[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]', '', value)
    
    return value


def validate_username(username: str) -> Tuple[bool, Optional[str]]:
    """
    Validate username format.
    
    Rules:
    - Must be 3-50 characters
    - Can contain letters, numbers, underscores, hyphens
    - Must start and end with alphanumeric characters
    
    Args:
        username: Username to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not username:
        return False, "Username is required"
    
    # Sanitize first
    try:
        username = sanitize_string(username, max_length=50)
    except ValidationError as e:
        return False, str(e)
    
    # Check length
    if len(username) < 3:
        return False, "Username must be at least 3 characters"
    
    if len(username) > 50:
        return False, "Username must not exceed 50 characters"
    
    # Check format - alphanumeric, underscore, hyphen only
    # Must start and end with alphanumeric, can have special chars in middle
    if not re.match(r'^[a-zA-Z0-9]+([_-]?[a-zA-Z0-9]+)*$', username):
        return False, "Username can only contain letters, numbers, underscores, and hyphens"
    
    return True, None


def validate_password(password: str) -> Tuple[bool, Optional[str]]:
    """
    Validate password strength.
    
    Rules:
    - Must be at least 8 characters
    - Must not exceed 128 characters
    
    Args:
        password: Password to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not password:
        return False, "Password is required"
    
    if not isinstance(password, str):
        return False, "Password must be a string"
    
    # Check length
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    
    if len(password) > 128:
        return False, "Password must not exceed 128 characters"
    
    return True, None


def validate_role(role: str, valid_roles: list) -> Tuple[bool, Optional[str]]:
    """
    Validate role is one of the allowed values.
    
    Args:
        role: Role to validate
        valid_roles: List of valid role values
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not role:
        return False, "Role is required"
    
    # Sanitize
    try:
        role = sanitize_string(role, max_length=50)
    except ValidationError as e:
        return False, str(e)
    
    if role not in valid_roles:
        return False, f"Invalid role. Must be one of: {', '.join(valid_roles)}"
    
    return True, None


def validate_query_param(param: str, param_name: str, valid_values: list = None, max_length: int = 100) -> Tuple[bool, Optional[str]]:
    """
    Validate query parameter.
    
    Args:
        param: Parameter value to validate
        param_name: Name of the parameter (for error messages)
        valid_values: Optional list of valid values
        max_length: Maximum allowed length
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not param:
        return True, None  # Optional parameters can be empty
    
    # Sanitize
    try:
        param = sanitize_string(param, max_length=max_length)
    except ValidationError as e:
        return False, f"Invalid {param_name}: {str(e)}"
    
    # Check against valid values if provided
    if valid_values and param not in valid_values:
        return False, f"Invalid {param_name}. Must be one of: {', '.join(valid_values)}"
    
    return True, None


def validate_integer_param(value: str, param_name: str, min_value: int = None, max_value: int = None) -> Tuple[bool, Optional[str], Optional[int]]:
    """
    Validate and convert integer parameter.
    
    Args:
        value: String value to validate and convert
        param_name: Name of the parameter (for error messages)
        min_value: Optional minimum value
        max_value: Optional maximum value
        
    Returns:
        Tuple of (is_valid, error_message, converted_value)
    """
    if not value:
        return True, None, None  # Optional parameters can be empty
    
    try:
        int_value = int(value)
    except (ValueError, TypeError):
        return False, f"Invalid {param_name}: must be an integer", None
    
    if min_value is not None and int_value < min_value:
        return False, f"Invalid {param_name}: must be at least {min_value}", None
    
    if max_value is not None and int_value > max_value:
        return False, f"Invalid {param_name}: must not exceed {max_value}", None
    
    return True, None, int_value


def sanitize_search_query(query: str) -> str:
    """
    Sanitize search query to prevent injection attacks.
    
    Args:
        query: Search query to sanitize
        
    Returns:
        Sanitized query string
    """
    if not query:
        return ""
    
    # Sanitize basic string
    query = sanitize_string(query, max_length=200)
    
    # Remove SQL-like keywords and special characters that could be used for injection
    dangerous_patterns = [
        r'--',  # SQL comment
        r';',   # SQL statement separator
        r'<script',  # XSS attempt
        r'javascript:',  # XSS attempt
        r'onerror=',  # XSS attempt
        r'onload=',  # XSS attempt
    ]
    
    for pattern in dangerous_patterns:
        query = re.sub(pattern, '', query, flags=re.IGNORECASE)
    
    return query.strip()
