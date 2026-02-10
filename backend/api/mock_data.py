"""
Mock data service for Kirazee RBAC Dashboard prototype
Provides simulated API responses for testing without database integration
"""
from datetime import datetime, timedelta
from typing import Dict, List, Any
from api.models import UserRole


# Sample users for all six roles
SAMPLE_USERS = [
    {
        "username": "superadmin",
        "password": "admin123",
        "role": UserRole.SUPER_ADMIN.value
    },
    {
        "username": "manager",
        "password": "manager123",
        "role": UserRole.MANAGER.value
    },
    {
        "username": "support",
        "password": "support123",
        "role": UserRole.SUPPORT.value
    },
    {
        "username": "kyc",
        "password": "kyc12345",
        "role": UserRole.KYC_ASSOCIATE.value
    },
    {
        "username": "finance",
        "password": "finance123",
        "role": UserRole.CA_FINANCE.value
    },
    {
        "username": "developer",
        "password": "dev12345",
        "role": UserRole.DEVELOPER.value
    },
]


def get_revenue_metrics() -> Dict[str, Any]:
    """Get mock revenue metrics data"""
    return {
        "total": 125430.50,
        "average_order_value": 45.20,
        "trend": 12.5,  # Percentage change
        "daily_data": [
            {"date": (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"), 
             "revenue": 18000 + (i * 500), 
             "orders": 400 + (i * 10)}
            for i in range(7, 0, -1)
        ]
    }


def get_order_metrics() -> Dict[str, Any]:
    """Get mock order metrics data"""
    return {
        "total": 2775,
        "pending": 450,
        "completed": 2100,
        "cancelled": 225,
        "recent_orders": [
            {
                "id": f"ORD-{1000 + i}",
                "customer": f"Customer {i}",
                "items": ["Item A", "Item B"],
                "total": 45.20 + (i * 5),
                "status": ["pending", "completed", "cancelled"][i % 3],
                "timestamp": (datetime.now() - timedelta(hours=i)).isoformat()
            }
            for i in range(10)
        ]
    }


def get_business_metrics() -> Dict[str, Any]:
    """Get mock business metrics data"""
    return {
        "active": 156,
        "pending_approval": 12,
        "by_category": {
            "retail": 65,
            "food": 58,
            "clothing": 33
        }
    }


def get_customer_metrics() -> Dict[str, Any]:
    """Get mock customer metrics data"""
    return {
        "unique": 8432,
        "active": 1234,
        "new_this_month": 342
    }


def get_delivery_metrics() -> Dict[str, Any]:
    """Get mock delivery partner metrics data"""
    return {
        "active": 89,
        "available": 67,
        "on_delivery": 22
    }


def get_kyc_metrics() -> Dict[str, Any]:
    """Get mock KYC verification metrics data"""
    return {
        "businesses_pending": 8,
        "delivery_partners_pending": 5,
        "verifications": [
            {
                "id": f"KYC-{2000 + i}",
                "type": "business" if i % 2 == 0 else "delivery_partner",
                "name": f"Business {i}" if i % 2 == 0 else f"Partner {i}",
                "documents": [
                    {
                        "type": "id_proof",
                        "url": f"/documents/id_{i}.pdf",
                        "uploaded_at": (datetime.now() - timedelta(days=i)).isoformat()
                    }
                ],
                "submitted_at": (datetime.now() - timedelta(days=i)).isoformat()
            }
            for i in range(13)
        ]
    }


def get_system_logs() -> List[Dict[str, Any]]:
    """Get mock system logs data"""
    return [
        {
            "timestamp": (datetime.now() - timedelta(minutes=i * 5)).isoformat(),
            "level": ["info", "warning", "error"][i % 3],
            "message": f"System log message {i}",
            "source": f"service_{i % 3}"
        }
        for i in range(100)
    ]


def get_api_analytics() -> Dict[str, Any]:
    """Get mock API analytics data"""
    return {
        "total_requests": 15432,
        "requests_by_endpoint": {
            "/api/metrics/overview": 3421,
            "/api/auth/login": 892,
            "/api/metrics/revenue": 1234,
            "/api/metrics/orders": 2156,
            "/api/kyc/pending": 567,
            "/api/users": 234
        },
        "average_response_time": 145.6,  # milliseconds
        "error_rate": 0.8  # percentage
    }


def get_overview_metrics(user_role: str) -> Dict[str, Any]:
    """
    Get overview metrics filtered by user role
    Returns only the metrics the user has permission to view
    """
    metrics = {}
    
    role = UserRole(user_role)
    
    # CA_Finance and Super_Admin can view revenue
    if role in [UserRole.CA_FINANCE, UserRole.SUPER_ADMIN]:
        metrics["revenue"] = {
            "total": 125430.50,
            "average_order_value": 45.20,
            "trend": 12.5
        }
    
    # Manager, Support, and Super_Admin can view orders
    if role in [UserRole.MANAGER, UserRole.SUPPORT, UserRole.SUPER_ADMIN]:
        metrics["orders"] = {
            "total": 2775,
            "pending": 450,
            "completed": 2100,
            "cancelled": 225
        }
    
    # Manager and Super_Admin can view businesses
    if role in [UserRole.MANAGER, UserRole.SUPER_ADMIN]:
        metrics["businesses"] = {
            "active": 156,
            "pending_approval": 12
        }
    
    # Support and Super_Admin can view customers
    if role in [UserRole.SUPPORT, UserRole.SUPER_ADMIN]:
        metrics["customers"] = {
            "unique": 8432,
            "active": 1234
        }
    
    # Manager, Developer, and Super_Admin can view delivery partners
    if role in [UserRole.MANAGER, UserRole.DEVELOPER, UserRole.SUPER_ADMIN]:
        metrics["delivery_partners"] = {
            "active": 89,
            "available": 67
        }
    
    # KYC_Associate and Super_Admin can view KYC pending
    if role in [UserRole.KYC_ASSOCIATE, UserRole.SUPER_ADMIN]:
        metrics["kyc_pending"] = {
            "businesses": 8,
            "delivery_partners": 5
        }
    
    return metrics


def get_sample_users() -> List[Dict[str, str]]:
    """Get list of sample users for testing"""
    return SAMPLE_USERS
