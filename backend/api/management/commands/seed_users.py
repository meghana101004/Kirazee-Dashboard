"""
Django management command to seed sample users
"""
from django.core.management.base import BaseCommand
from api.models import User, UserRole
from datetime import datetime, timedelta


class Command(BaseCommand):
    help = 'Seed sample users into the database'

    def handle(self, *args, **options):
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

        created_count = 0
        updated_count = 0

        self.stdout.write("Seeding sample users into database...\n")

        for i, user_data in enumerate(users_data):
            username = user_data['username']
            password = user_data['password']
            role = user_data['role']

            # Check if user already exists
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'role': role,
                    'last_login': datetime.now() - timedelta(days=i),
                    'is_active': True
                }
            )

            if created:
                user.set_password(password)
                user.is_active = True
                user.save()
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"✓ Created user: {username} ({role})"))
            else:
                # Update existing user
                user.role = role
                user.set_password(password)
                user.last_login = datetime.now() - timedelta(days=i)
                user.is_active = True
                user.save()
                updated_count += 1
                self.stdout.write(self.style.SUCCESS(f"✓ Updated user: {username} ({role})"))

        self.stdout.write(self.style.SUCCESS(f"\n✓ Seeding complete!"))
        self.stdout.write(f"  - Created: {created_count} users")
        self.stdout.write(f"  - Updated: {updated_count} users")
        self.stdout.write(f"  - Total: {created_count + updated_count} users")
