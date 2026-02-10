"""
API models for Kirazee RBAC Dashboard
"""
from django.db import models
from enum import Enum
import bcrypt
import uuid
from datetime import datetime



class UserRole(Enum):
    """Enum defining all user roles in the system"""
    SUPER_ADMIN = "super_admin"
    MANAGER = "manager"
    SUPPORT = "support"
    KYC_ASSOCIATE = "kyc_associate"
    CA_FINANCE = "ca_finance"
    DEVELOPER = "developer"


class User(models.Model):
    """User model with role-based access control"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=50, unique=True)
    password_hash = models.CharField(max_length=255)
    role = models.CharField(
        max_length=20,
        choices=[(role.value, role.name) for role in UserRole]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'users'
    
    def set_password(self, password: str) -> None:
        """Hash and set the user's password using bcrypt"""
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
    
    def check_password(self, password: str) -> bool:
        """Verify a password against the stored hash"""
        password_bytes = password.encode('utf-8')
        hash_bytes = self.password_hash.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hash_bytes)
    
    def __str__(self):
        return f"{self.username} ({self.role})"



class Permission(Enum):
    """Enum defining all permissions in the system"""
    # Dashboard metrics
    VIEW_REVENUE = "view_revenue"
    VIEW_ORDERS = "view_orders"
    VIEW_BUSINESSES = "view_businesses"
    VIEW_CUSTOMERS = "view_customers"
    VIEW_DELIVERY_PARTNERS = "view_delivery_partners"
    VIEW_KYC_QUEUE = "view_kyc_queue"
    VIEW_SYSTEM_LOGS = "view_system_logs"
    VIEW_API_ANALYTICS = "view_api_analytics"
    
    # Actions
    MANAGE_USERS = "manage_users"
    VERIFY_KYC = "verify_kyc"
    MANAGE_BUSINESSES = "manage_businesses"
    MANAGE_ORDERS = "manage_orders"
    VIEW_FINANCIAL_REPORTS = "view_financial_reports"
    MANAGE_NOTIFICATIONS = "manage_notifications"


# Role-Permission Mapping
ROLE_PERMISSIONS = {
    UserRole.SUPER_ADMIN: [
        Permission.VIEW_REVENUE,
        Permission.VIEW_ORDERS,
        Permission.VIEW_BUSINESSES,
        Permission.VIEW_CUSTOMERS,
        Permission.VIEW_DELIVERY_PARTNERS,
        Permission.VIEW_KYC_QUEUE,
        Permission.VIEW_SYSTEM_LOGS,
        Permission.VIEW_API_ANALYTICS,
        Permission.MANAGE_USERS,
        Permission.VERIFY_KYC,
        Permission.MANAGE_BUSINESSES,
        Permission.MANAGE_ORDERS,
        Permission.VIEW_FINANCIAL_REPORTS,
        Permission.MANAGE_NOTIFICATIONS,
    ],
    UserRole.MANAGER: [
        Permission.VIEW_ORDERS,
        Permission.VIEW_BUSINESSES,
        Permission.VIEW_DELIVERY_PARTNERS,
        Permission.MANAGE_BUSINESSES,
        Permission.MANAGE_ORDERS,
    ],
    UserRole.SUPPORT: [
        Permission.VIEW_ORDERS,
        Permission.VIEW_CUSTOMERS,
        Permission.MANAGE_NOTIFICATIONS,
    ],
    UserRole.KYC_ASSOCIATE: [
        Permission.VIEW_KYC_QUEUE,
        Permission.VERIFY_KYC,
    ],
    UserRole.CA_FINANCE: [
        Permission.VIEW_REVENUE,
        Permission.VIEW_FINANCIAL_REPORTS,
    ],
    UserRole.DEVELOPER: [
        Permission.VIEW_SYSTEM_LOGS,
        Permission.VIEW_API_ANALYTICS,
        Permission.VIEW_DELIVERY_PARTNERS,
    ],
}


def has_permission(user_role: UserRole, permission: Permission) -> bool:
    """Check if a user role has a specific permission"""
    return permission in ROLE_PERMISSIONS.get(user_role, [])
