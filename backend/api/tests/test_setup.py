"""
Basic test to verify pytest setup
"""
import pytest


def test_setup():
    """Verify pytest is working"""
    assert True


def test_django_settings():
    """Verify Django settings are loaded"""
    from django.conf import settings
    assert settings.INSTALLED_APPS is not None
    assert 'api' in settings.INSTALLED_APPS
