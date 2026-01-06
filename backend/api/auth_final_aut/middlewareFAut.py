import time
from django.utils import timezone # pyright: ignore[reportMissingModuleSource]
from django.utils.deprecation import MiddlewareMixin # pyright: ignore[reportMissingModuleSource]
from django.core.cache import cache # pyright: ignore[reportMissingModuleSource]
from .models import SecurityEventAut, CustomUserAut # pyright: ignore[reportMissingImports]

class SessionTimeoutMiddlewareAut(MiddlewareMixin):
    def process_request_aut(self, request_aut):
        if not request_aut.user.is_authenticated:
            return
        
        # Update last activity in session
        request_aut.session['last_activity_aut'] = timezone.now().isoformat()
        
        # Update user's last activity
        if hasattr(request_aut.user, 'update_last_activity_aut'):
            request_aut.user.update_last_activity_aut()
    
    def process_response_aut(self, request_aut, response_aut):
        return response_aut

class RateLimitMiddlewareAut(MiddlewareMixin):
    def __init__(self, get_response_aut):
        super().__init__(get_response_aut)
        self.get_response_aut = get_response_aut
    
    def __call__(self, request_aut):
        # Apply rate limiting before processing request
        if self.is_rate_limited_aut(request_aut):
            from django.http import HttpResponse # pyright: ignore[reportMissingModuleSource]
            response_aut = HttpResponse(
                'Too many requests',
                status=429,
                content_type='text/plain'
            )
            response_aut['Retry-After'] = 60
            return response_aut
        
        # Process request
        response_aut = self.get_response_aut(request_aut)
        
        return response_aut
    
    def is_rate_limited_aut(self, request_aut):
        # Skip rate limiting for certain paths
        if request_aut.path.startswith('/admin/') or request_aut.path.startswith('/static/'):
            return False
        
        # Get client identifier
        if request_aut.user.is_authenticated:
            ident_aut = f"user_{request_aut.user.id_aut}"
        else:
            ident_aut = f"ip_{request_aut.META.get('REMOTE_ADDR', 'unknown')}"
        
        # Check rate limit
        cache_key_aut = f"global_rate_limit_{ident_aut}"
        request_count_aut = cache.get(cache_key_aut, 0)
        
        if request_count_aut >= 1000:  # Global limit of 1000 requests per hour
            # Log security event
            SecurityEventAut.objects.create(
                user_aut=request_aut.user if request_aut.user.is_authenticated else None,
                event_type_aut='rate_limit_exceeded_aut',
                ip_address_aut=request_aut.META.get('REMOTE_ADDR'),
                user_agent_aut=request_aut.META.get('HTTP_USER_AGENT', ''),
                severity_aut='high_aut',
                details_aut={'global_limit_aut': True}
            )
            return True
        
        # Increment counter
        cache.set(cache_key_aut, request_count_aut + 1, timeout=3600)
        
        return False

class SecurityHeadersMiddlewareAut(MiddlewareMixin):
    def process_response_aut(self, request_aut, response_aut):
        # Add security headers
        response_aut['X-Content-Type-Options'] = 'nosniff'
        response_aut['X-Frame-Options'] = 'DENY'
        response_aut['X-XSS-Protection'] = '1; mode=block'
        
        # CSP Header
        csp_aut = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self'; "
            "connect-src 'self'; "
            "frame-ancestors 'none';"
        )
        response_aut['Content-Security-Policy'] = csp_aut
        
        # HSTS for HTTPS
        if request_aut.is_secure():
            response_aut['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        return response_aut

class RequestLoggingMiddlewareAut(MiddlewareMixin):
    def process_request_aut(self, request_aut):
        request_aut.start_time_aut = time.time()
        
        # Log suspicious requests
        self.log_suspicious_request_aut(request_aut)
    
    def process_response_aut(self, request_aut, response_aut):
        # Calculate request duration
        if hasattr(request_aut, 'start_time_aut'):
            duration_aut = time.time() - request_aut.start_time_aut
            
            # Log slow requests
            if duration_aut > 5:  # 5 seconds
                SecurityEventAut.objects.create(
                    user_aut=request_aut.user if request_aut.user.is_authenticated else None,
                    event_type_aut='suspicious_activity_aut',
                    ip_address_aut=request_aut.META.get('REMOTE_ADDR'),
                    user_agent_aut=request_aut.META.get('HTTP_USER_AGENT', ''),
                    severity_aut='low_aut',
                    details_aut={
                        'slow_request_aut': True,
                        'duration_aut': duration_aut,
                        'path_aut': request_aut.path,
                        'method_aut': request_aut.method
                    }
                )
        
        return response_aut
    
    def log_suspicious_request_aut(self, request_aut):
        suspicious_patterns_aut = [
            '../', '..\\', '/etc/passwd', '/bin/', 'script', 'alert(',
            'union select', 'drop table', 'insert into', 'sleep('
        ]
        
        path_aut = request_aut.path.lower()
        query_string_aut = request_aut.META.get('QUERY_STRING', '').lower()
        
        for pattern_aut in suspicious_patterns_aut:
            if pattern_aut in path_aut or pattern_aut in query_string_aut:
                SecurityEventAut.objects.create(
                    user_aut=request_aut.user if request_aut.user.is_authenticated else None,
                    event_type_aut='suspicious_activity_aut',
                    ip_address_aut=request_aut.META.get('REMOTE_ADDR'),
                    user_agent_aut=request_aut.META.get('HTTP_USER_AGENT', ''),
                    severity_aut='high_aut',
                    details_aut={
                        'suspicious_pattern_aut': pattern_aut,
                        'path_aut': request_aut.path,
                        'query_aut': query_string_aut
                    }
                )
                break

class ForceLogoutMiddlewareAut(MiddlewareMixin):
    def process_request_aut(self, request_aut):
        if not request_aut.user.is_authenticated:
            return
        
        # Check if user has been forced to logout
        if hasattr(request_aut.user, 'force_logout_aut') and request_aut.user.force_logout_aut:
            from django.contrib.auth import logout # pyright: ignore[reportMissingModuleSource]
            logout(request_aut)
            
            # Clear the flag
            request_aut.user.force_logout_aut = False
            request_aut.user.save(update_fields=['force_logout_aut'])
            
            # Redirect to login page
            from django.shortcuts import redirect # pyright: ignore[reportMissingModuleSource]
            return redirect('/login/?forced_logout=true')