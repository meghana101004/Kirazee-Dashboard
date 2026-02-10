#!/usr/bin/env python
"""
Script to seed sample users into the database
"""
import os
import sys
import django
from datetime import datetime, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kirazee_dashboard.settings')
django.setup()

from api.models import User, UserRole

# Sample users data
users_data = [
    {'username': 'admin1', 'password': 'admin123', 'role': UserRole.SUPER_ADMIN.value},
    {'username': 'manager1', 'password': 'manager123', 'role': UserRole.MANAGER.value},
    {'username': 'support1', 'password': 'support123', 'role': UserRole.SUPPORT.value},
    {'username': 'kyc1', 'password': 'kyc12345', 'role': UserRole.KYC_ASSOCIATE.value},
    {'username': 'finance1', 'password': 'finance123', 'role': UserRole.CA_FINANCE.value},
    {'username': 'dev1', 'password': 'dev12345', 'role': UserRole.DEVELOPER.value},
    {'username': 'admin2', 'password': 'admin456', 'role': UserRole.SUPER_ADMIN.value},
    {'username': 'manager2', 'password': 'manager456', 'role': UserRole.MANAGER.value},
]

def seed_users():
    """Create sample users in the database"""
    created_count = 0
    updated_count = 0
    
    for i, user_data in enumerate(users_data):
        username = user_data['username']
        password = user_data['password']
        role = user_data['role']
        
        # Check if user already exists
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'role': role,
                'last_login': datetime.now() - timedelta(days=i)
            }
        )
        
        if created:
            user.set_password(password)
            user.save()
            created_count += 1
            print(f"✓ Created user: {username} ({role})")
        else:
            # Update existing user
            user.role = role
            user.set_password(password)
            user.last_login = datetime.now() - timedelta(days=i)
            user.save()
            updated_count += 1
            print(f"✓ Updated user: {username} ({role})")
    
    print(f"\n✓ Seeding complete!")
    print(f"  - Created: {created_count} users")
    print(f"  - Updated: {updated_count} users")
    print(f"  - Total: {created_count + updated_count} users")

if __name__ == '__main__':
    print("Seeding sample users into database...\n")
    seed_users()
