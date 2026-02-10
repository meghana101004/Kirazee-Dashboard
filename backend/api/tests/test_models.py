"""
Unit tests for User model and mock data service
"""
import pytest
from api.models import User, UserRole, Permission, ROLE_PERMISSIONS, has_permission
from api.mock_data import (
    get_revenue_metrics,
    get_order_metrics,
    get_business_metrics,
    get_customer_metrics,
    get_delivery_metrics,
    get_kyc_metrics,
    get_system_logs,
    get_api_analytics,
    get_overview_metrics,
    get_sample_users,
    SAMPLE_USERS
)


@pytest.mark.django_db
class TestUserModel:
    """Test User model functionality"""
    
    def test_create_user_with_role(self):
        """Test creating a user with a specific role"""
        user = User.objects.create(
            username="testuser",
            role=UserRole.MANAGER.value
        )
        user.set_password("testpass123")
        user.save()
        
        assert user.username == "testuser"
        assert user.role == UserRole.MANAGER.value
        assert user.is_active is True
        assert user.password_hash is not None
    
    def test_password_hashing(self):
        """Test that passwords are hashed correctly"""
        user = User.objects.create(
            username="hashtest",
            role=UserRole.SUPPORT.value
        )
        password = "mypassword123"
        user.set_password(password)
        user.save()
        
        # Password should be hashed, not stored as plaintext
        assert user.password_hash != password
        assert len(user.password_hash) > 0
    
    def test_password_verification(self):
        """Test password verification"""
        user = User.objects.create(
            username="verifytest",
            role=UserRole.DEVELOPER.value
        )
        password = "correctpassword"
        user.set_password(password)
        user.save()
        
        # Correct password should verify
        assert user.check_password(password) is True
        
        # Incorrect password should not verify
        assert user.check_password("wrongpassword") is False


class TestPermissions:
    """Test permission system"""
    
    def test_super_admin_has_all_permissions(self):
        """Test that Super_Admin has all permissions"""
        super_admin_perms = ROLE_PERMISSIONS[UserRole.SUPER_ADMIN]
        
        # Super_Admin should have all permission types
        assert Permission.VIEW_REVENUE in super_admin_perms
        assert Permission.MANAGE_USERS in super_admin_perms
        assert Permission.VERIFY_KYC in super_admin_perms
        assert len(super_admin_perms) == 14
    
    def test_manager_permissions(self):
        """Test Manager role permissions"""
        manager_perms = ROLE_PERMISSIONS[UserRole.MANAGER]
        
        assert Permission.VIEW_ORDERS in manager_perms
        assert Permission.VIEW_BUSINESSES in manager_perms
        assert Permission.MANAGE_ORDERS in manager_perms
        assert Permission.VIEW_REVENUE not in manager_perms
        assert Permission.MANAGE_USERS not in manager_perms
    
    def test_has_permission_function(self):
        """Test has_permission utility function"""
        assert has_permission(UserRole.CA_FINANCE, Permission.VIEW_REVENUE) is True
        assert has_permission(UserRole.CA_FINANCE, Permission.MANAGE_USERS) is False
        assert has_permission(UserRole.KYC_ASSOCIATE, Permission.VERIFY_KYC) is True


class TestMockDataService:
    """Test mock data service functions"""
    
    def test_get_revenue_metrics(self):
        """Test revenue metrics data structure"""
        data = get_revenue_metrics()
        
        assert "total" in data
        assert "average_order_value" in data
        assert "trend" in data
        assert "daily_data" in data
        assert isinstance(data["total"], float)
        assert len(data["daily_data"]) == 7
    
    def test_get_order_metrics(self):
        """Test order metrics data structure"""
        data = get_order_metrics()
        
        assert "total" in data
        assert "pending" in data
        assert "completed" in data
        assert "cancelled" in data
        assert "recent_orders" in data
        assert isinstance(data["recent_orders"], list)
    
    def test_get_business_metrics(self):
        """Test business metrics data structure"""
        data = get_business_metrics()
        
        assert "active" in data
        assert "pending_approval" in data
        assert "by_category" in data
        assert "retail" in data["by_category"]
    
    def test_get_customer_metrics(self):
        """Test customer metrics data structure"""
        data = get_customer_metrics()
        
        assert "unique" in data
        assert "active" in data
        assert "new_this_month" in data
    
    def test_get_delivery_metrics(self):
        """Test delivery metrics data structure"""
        data = get_delivery_metrics()
        
        assert "active" in data
        assert "available" in data
        assert "on_delivery" in data
    
    def test_get_kyc_metrics(self):
        """Test KYC metrics data structure"""
        data = get_kyc_metrics()
        
        assert "businesses_pending" in data
        assert "delivery_partners_pending" in data
        assert "verifications" in data
        assert isinstance(data["verifications"], list)
    
    def test_get_system_logs(self):
        """Test system logs data structure"""
        logs = get_system_logs()
        
        assert isinstance(logs, list)
        assert len(logs) == 100
        assert "timestamp" in logs[0]
        assert "level" in logs[0]
        assert "message" in logs[0]
    
    def test_get_api_analytics(self):
        """Test API analytics data structure"""
        data = get_api_analytics()
        
        assert "total_requests" in data
        assert "requests_by_endpoint" in data
        assert "average_response_time" in data
        assert "error_rate" in data
    
    def test_get_overview_metrics_super_admin(self):
        """Test overview metrics for Super_Admin includes all data"""
        data = get_overview_metrics(UserRole.SUPER_ADMIN.value)
        
        assert "revenue" in data
        assert "orders" in data
        assert "businesses" in data
        assert "customers" in data
        assert "delivery_partners" in data
        assert "kyc_pending" in data
    
    def test_get_overview_metrics_manager(self):
        """Test overview metrics for Manager includes only permitted data"""
        data = get_overview_metrics(UserRole.MANAGER.value)
        
        assert "orders" in data
        assert "businesses" in data
        assert "delivery_partners" in data
        assert "revenue" not in data
        assert "customers" not in data
    
    def test_get_overview_metrics_ca_finance(self):
        """Test overview metrics for CA_Finance includes only financial data"""
        data = get_overview_metrics(UserRole.CA_FINANCE.value)
        
        assert "revenue" in data
        assert "orders" not in data
        assert "businesses" not in data
    
    def test_get_sample_users(self):
        """Test sample users data"""
        users = get_sample_users()
        
        assert len(users) == 6
        assert users[0]["username"] == "superadmin"
        assert users[0]["role"] == UserRole.SUPER_ADMIN.value
        
        # Verify all roles are represented
        roles = [user["role"] for user in users]
        assert UserRole.SUPER_ADMIN.value in roles
        assert UserRole.MANAGER.value in roles
        assert UserRole.SUPPORT.value in roles
        assert UserRole.KYC_ASSOCIATE.value in roles
        assert UserRole.CA_FINANCE.value in roles
        assert UserRole.DEVELOPER.value in roles
