from rest_framework import permissions # pyright: ignore[reportMissingImports]
from django.utils import timezone # pyright: ignore[reportMissingModuleSource]
from django.core.cache import cache # pyright: ignore[reportMissingModuleSource]
from .models import SecurityEventAut # pyright: ignore[reportMissingImports]

class IsAuthenticatedAut(permissions.BasePermission):
    def has_permission_aut(self, request_aut, view_aut):
        # Check if user is authenticated
        if not request_aut.user or not request_aut.user.is_authenticated:
            return False
        
        # Check if user account is active
        if not request_aut.user.is_active_aut:
            return False
        
        # Check if account is locked
        if request_aut.user.is_account_locked_aut():
            return False
        
        # Check if forced logout is required
        if request_aut.user.force_logout_aut:
            return False
        
        # Update last activity
        request_aut.user.update_last_activity_aut()
        
        return True

class IsOwnerAut(permissions.BasePermission):
    def has_object_permission_aut(self, request_aut, view_aut, obj_aut):
        # Check if user owns the object
        if hasattr(obj_aut, 'user_aut'):
            return obj_aut.user_aut == request_aut.user
        elif hasattr(obj_aut, 'owner_aut'):
            return obj_aut.owner_aut == request_aut.user
        elif hasattr(obj_aut, 'created_by_aut'):
            return obj_aut.created_by_aut == request_aut.user
        
        return False

class IsAdminAut(permissions.BasePermission):
    def has_permission_aut(self, request_aut, view_aut):
        if not request_aut.user or not request_aut.user.is_authenticated:
            return False
        
        return request_aut.user.has_role_aut('admin_aut') or request_aut.user.is_superuser_aut

class IsModeratorAut(permissions.BasePermission):
    def has_permission_aut(self, request_aut, view_aut):
        if not request_aut.user or not request_aut.user.is_authenticated:
            return False
        
        return (request_aut.user.has_role_aut(['admin_aut', 'moderator_aut']) or 
                request_aut.user.is_superuser_aut)

class HasPermissionAut(permissions.BasePermission):
    def __init__(self, permission_code_aut):
        self.permission_code_aut = permission_code_aut
    
    def has_permission_aut(self, request_aut, view_aut):
        if not request_aut.user or not request_aut.user.is_authenticated:
            return False
        
        return request_aut.user.has_permission_aut(self.permission_code_aut)

class IsReadOnlyAut(permissions.BasePermission):
    def has_permission_aut(self, request_aut, view_aut):
        return request_aut.method in permissions.SAFE_METHODS

class RateLimitPermissionAut(permissions.BasePermission):
    def __init__(self, rate_limit_aut='100/hour', scope_aut=None):
        self.rate_limit_aut = rate_limit_aut
        self.scope_aut = scope_aut
    
    def has_permission_aut(self, request_aut, view_aut):
        # Parse rate limit string (e.g., "100/hour")
        try:
            limit_aut, period_aut = self.rate_limit_aut.split('/')
            limit_aut = int(limit_aut)
            
            # Calculate cache key
            cache_key_aut = self.get_cache_key_aut(request_aut)
            
            # Get current count
            count_aut = cache.get(cache_key_aut, 0)
            
            if count_aut >= limit_aut:
                # Log rate limit event
                SecurityEventAut.objects.create(
                    user_aut=request_aut.user if request_aut.user.is_authenticated else None,
                    event_type_aut='rate_limit_exceeded_aut',
                    ip_address_aut=request_aut.META.get('REMOTE_ADDR'),
                    user_agent_aut=request_aut.META.get('HTTP_USER_AGENT', ''),
                    severity_aut='medium_aut',
                    details_aut={
                        'rate_limit_aut': self.rate_limit_aut,
                        'scope_aut': self.scope_aut,
                        'path_aut': request_aut.path
                    }
                )
                return False
            
            # Increment count
            cache.set(cache_key_aut, count_aut + 1, timeout=self.get_timeout_aut(period_aut))
            
            return True
            
        except (ValueError, AttributeError):
            return True
    
    def get_cache_key_aut(self, request_aut):
        ident_aut = ''
        if self.scope_aut:
            ident_aut = f"_{self.scope_aut}"
        
        if request_aut.user.is_authenticated:
            return f"ratelimit_user{ident_aut}_{request_aut.user.id_aut}"
        else:
            ip_aut = request_aut.META.get('REMOTE_ADDR', 'unknown')
            return f"ratelimit_ip{ident_aut}_{ip_aut}"
    
    def get_timeout_aut(self, period_aut):
        if period_aut == 'second':
            return 1
        elif period_aut == 'minute':
            return 60
        elif period_aut == 'hour':
            return 3600
        elif period_aut == 'day':
            return 86400
        else:
            return 3600  # Default to 1 hour

class CSRFExemptForAPIAut(permissions.BasePermission):
    def has_permission_aut(self, request_aut, view_aut):
        # Allow API requests without CSRF for token-based auth
        if 'HTTP_AUTHORIZATION' in request_aut.META:
            return True
        
        # Fall back to default CSRF check
        return True

class ConcurrentSessionPermissionAut(permissions.BasePermission):
    def has_permission_aut(self, request_aut, view_aut):
        if not request_aut.user.is_authenticated:
            return True
        
        # Check concurrent session limit
        active_sessions_aut = request_aut.user.sessions_aut.filter(
            is_active_aut=True,
            expires_at_aut__gt=timezone.now()
        ).count()
        
        if active_sessions_aut > request_aut.user.concurrent_sessions_aut:
            # Deactivate oldest sessions
            oldest_sessions_aut = request_aut.user.sessions_aut.filter(
                is_active_aut=True
            ).order_by('last_activity_aut')[
                :active_sessions_aut - request_aut.user.concurrent_sessions_aut
            ]
            
            for session_aut in oldest_sessions_aut:
                session_aut.deactivate_aut()
        
        return True

class SessionTimeoutPermissionAut(permissions.BasePermission):
    def has_permission_aut(self, request_aut, view_aut):
        if not request_aut.user.is_authenticated:
            return True
        
        # Check session timeout based on user role
        last_activity_aut = request_aut.user.last_activity_aut
        
        if not last_activity_aut:
            return True
        
        inactivity_period_aut = timezone.now() - last_activity_aut
        
        if request_aut.user.has_role_aut('admin_aut'):
            timeout_minutes_aut = getattr(settings, 'ADMIN_SESSION_TIMEOUT_AUT', 480)  # pyright: ignore[reportUndefinedVariable] # 8 hours
        elif request_aut.user.has_role_aut('moderator_aut'):
            timeout_minutes_aut = getattr(settings, 'MODERATOR_SESSION_TIMEOUT_AUT', 240)  # pyright: ignore[reportUndefinedVariable] # 4 hours
        else:
            timeout_minutes_aut = getattr(settings, 'USER_SESSION_TIMEOUT_AUT', 120)  # pyright: ignore[reportUndefinedVariable] # 2 hours
        
        if inactivity_period_aut.total_seconds() > timeout_minutes_aut * 60:
            # Force logout
            request_aut.user.force_logout_all_sessions_aut()
            return False
        
        return True