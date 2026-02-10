"""
JWT token generation and validation utilities for authentication
"""
import jwt
from datetime import datetime, timedelta, timezone
from django.conf import settings
from typing import Dict, Optional, Any


def generate_jwt_token(user_id: str, username: str, role: str) -> str:
    """
    Generate a JWT token for authenticated user
    
    Args:
        user_id: User's unique identifier
        username: User's username
        role: User's role (from UserRole enum)
    
    Returns:
        JWT token string
    """
    now = datetime.now(timezone.utc)
    expiration = now + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    
    payload = {
        'user_id': str(user_id),
        'username': username,
        'role': role,
        'iat': int(now.timestamp()),
        'exp': int(expiration.timestamp())
    }
    
    token = jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    
    return token


def decode_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode and validate a JWT token
    
    Args:
        token: JWT token string
    
    Returns:
        Decoded token payload if valid, None if invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        # Token has expired
        return None
    except jwt.InvalidTokenError:
        # Token is invalid
        return None


def validate_jwt_token(token: str) -> bool:
    """
    Validate a JWT token without decoding
    
    Args:
        token: JWT token string
    
    Returns:
        True if token is valid, False otherwise
    """
    return decode_jwt_token(token) is not None


def extract_user_from_token(token: str) -> Optional[Dict[str, str]]:
    """
    Extract user information from JWT token
    
    Args:
        token: JWT token string
    
    Returns:
        Dictionary with user_id, username, and role if valid, None otherwise
    """
    payload = decode_jwt_token(token)
    if payload:
        return {
            'user_id': payload.get('user_id'),
            'username': payload.get('username'),
            'role': payload.get('role')
        }
    return None
