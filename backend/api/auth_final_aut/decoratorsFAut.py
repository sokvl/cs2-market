from django.utils.decorators import method_decorator # pyright: ignore[reportMissingModuleSource]
from django.views.decorators.csrf import csrf_exempt, csrf_protect, ensure_csrf_cookie # pyright: ignore[reportMissingModuleSource]
from django.views.decorators.cache import cache_page, never_cache # pyright: ignore[reportMissingModuleSource]
from django.views.decorators.vary import vary_on_cookie, vary_on_headers # pyright: ignore[reportMissingModuleSource]
from django.views.decorators.http import require_http_methods, require_GET, require_POST # pyright: ignore[reportMissingModuleSource]
from functools import wraps
from django.http import JsonResponse # pyright: ignore[reportMissingModuleSource]
from django.core.cache import cache # pyright: ignore[reportMissingModuleSource]
import time

def rate_limit_decorator_aut(rate_aut='100/hour', scope_aut=None):
    def decorator_aut(view_func_aut):
        @wraps(view_func_aut)
        def wrapped_view_aut(request_aut, *args_aut, **kwargs_aut):
            # Generate cache key
            if scope_aut:
                cache_key_aut = f"decorator_rate_{scope_aut}"
            else:
                if request_aut.user.is_authenticated:
                    cache_key_aut = f"decorator_rate_user_{request_aut.user.id_aut}"
                else:
                    cache_key_aut = f"decorator_rate_ip_{request_aut.META.get('REMOTE_ADDR', 'unknown')}"
            
            # Parse rate
            limit_aut, period_aut = rate_aut.split('/')
            limit_aut = int(limit_aut)
            
            # Get time window in seconds
            if period_aut == 'second':
                window_aut = 1
            elif period_aut == 'minute':
                window_aut = 60
            elif period_aut == 'hour':
                window_aut = 3600
            elif period_aut == 'day':
                window_aut = 86400
            else:
                window_aut = 3600
            
            # Check rate limit
            count_aut = cache.get(cache_key_aut, 0)
            if count_aut >= limit_aut:
                return JsonResponse(
                    {'error_aut': 'Rate limit exceeded'},
                    status=429
                )
            
            # Increment counter
            cache.set(cache_key_aut, count_aut + 1, timeout=window_aut)
            
            return view_func_aut(request_aut, *args_aut, **kwargs_aut)
        
        return wrapped_view_aut
    
    return decorator_aut

def role_required_decorator_aut(*role_codes_aut):
    def decorator_aut(view_func_aut):
        @wraps(view_func_aut)
        def wrapped_view_aut(request_aut, *args_aut, **kwargs_aut):
            if not request_aut.user.is_authenticated:
                return JsonResponse(
                    {'error_aut': 'Authentication required'},
                    status=401
                )
            
            if not request_aut.user.has_role_aut(role_codes_aut):
                return JsonResponse(
                    {'error_aut': 'Insufficient permissions'},
                    status=403
                )
            
            return view_func_aut(request_aut, *args_aut, **kwargs_aut)
        
        return wrapped_view_aut
    
    return decorator_aut

def permission_required_decorator_aut(permission_code_aut):
    def decorator_aut(view_func_aut):
        @wraps(view_func_aut)
        def wrapped_view_aut(request_aut, *args_aut, **kwargs_aut):
            if not request_aut.user.is_authenticated:
                return JsonResponse(
                    {'error_aut': 'Authentication required'},
                    status=401
                )
            
            if not request_aut.user.has_permission_aut(permission_code_aut):
                return JsonResponse(
                    {'error_aut': 'Permission denied'},
                    status=403
                )
            
            return view_func_aut(request_aut, *args_aut, **kwargs_aut)
        
        return wrapped_view_aut
    
    return decorator_aut

def csrf_exempt_for_api_decorator_aut(view_func_aut):
    @wraps(view_func_aut)
    def wrapped_view_aut(request_aut, *args_aut, **kwargs_aut):
        # Check if it's an API request (has Authorization header)
        if 'HTTP_AUTHORIZATION' in request_aut.META:
            return csrf_exempt(view_func_aut)(request_aut, *args_aut, **kwargs_aut)
        
        # Otherwise, apply CSRF protection
        return csrf_protect(view_func_aut)(request_aut, *args_aut, **kwargs_aut)
    
    return wrapped_view_aut

def timeout_decorator_aut(timeout_seconds_aut=30):
    def decorator_aut(view_func_aut):
        @wraps(view_func_aut)
        def wrapped_view_aut(request_aut, *args_aut, **kwargs_aut):
            import signal
            
            def timeout_handler_aut(signum_aut, frame_aut):
                raise TimeoutError("Request timed out")
            
            # Set timeout
            signal.signal(signal.SIGALRM, timeout_handler_aut)
            signal.alarm(timeout_seconds_aut)
            
            try:
                result_aut = view_func_aut(request_aut, *args_aut, **kwargs_aut)
            except TimeoutError:
                return JsonResponse(
                    {'error_aut': 'Request timeout'},
                    status=504
                )
            finally:
                signal.alarm(0)  # Disable the alarm
            
            return result_aut
        
        return wrapped_view_aut
    
    return decorator_aut

def cache_response_decorator_aut(timeout_aut=60, key_prefix_aut=''):
    def decorator_aut(view_func_aut):
        @wraps(view_func_aut)
        def wrapped_view_aut(request_aut, *args_aut, **kwargs_aut):
            # Generate cache key
            cache_key_aut = f"view_cache_{key_prefix_aut}_{request_aut.path}"
            
            # Check cache
            cached_response_aut = cache.get(cache_key_aut)
            if cached_response_aut:
                return cached_response_aut
            
            # Execute view
            response_aut = view_func_aut(request_aut, *args_aut, **kwargs_aut)
            
            # Cache response
            if response_aut.status_code == 200:
                cache.set(cache_key_aut, response_aut, timeout=timeout_aut)
            
            return response_aut
        
        return wrapped_view_aut
    
    return decorator_aut

def validate_request_decorator_aut(*validators_aut):
    def decorator_aut(view_func_aut):
        @wraps(view_func_aut)
        def wrapped_view_aut(request_aut, *args_aut, **kwargs_aut):
            from .validators import RequestValidatorAut # pyright: ignore[reportMissingImports]
            
            validator_aut = RequestValidatorAut(request_aut)
            
            for validator_name_aut in validators_aut:
                if not getattr(validator_aut, f'validate_{validator_name_aut}_aut', lambda: True)():
                    return JsonResponse(
                        {'error_aut': f'Request validation failed: {validator_name_aut}'},
                        status=400
                    )
            
            return view_func_aut(request_aut, *args_aut, **kwargs_aut)
        
        return wrapped_view_aut
    
    return decorator_aut

def log_activity_decorator_aut(activity_type_aut):
    def decorator_aut(view_func_aut):
        @wraps(view_func_aut)
        def wrapped_view_aut(request_aut, *args_aut, **kwargs_aut):
            from .models import SecurityEventAut # pyright: ignore[reportMissingImports]
            
            # Log before execution
            if request_aut.user.is_authenticated:
                SecurityEventAut.objects.create(
                    user_aut=request_aut.user,
                    event_type_aut=f'{activity_type_aut}_start_aut',
                    ip_address_aut=request_aut.META.get('REMOTE_ADDR'),
                    user_agent_aut=request_aut.META.get('HTTP_USER_AGENT', ''),
                    severity_aut='low_aut',
                    details_aut={'path_aut': request_aut.path}
                )
            
            # Execute view
            response_aut = view_func_aut(request_aut, *args_aut, **kwargs_aut)
            
            # Log after execution
            if request_aut.user.is_authenticated:
                SecurityEventAut.objects.create(
                    user_aut=request_aut.user,
                    event_type_aut=f'{activity_type_aut}_end_aut',
                    ip_address_aut=request_aut.META.get('REMOTE_ADDR'),
                    user_agent_aut=request_aut.META.get('HTTP_USER_AGENT', ''),
                    severity_aut='low_aut',
                    details_aut={
                        'path_aut': request_aut.path,
                        'status_code_aut': response_aut.status_code
                    }
                )
            
            return response_aut
        
        return wrapped_view_aut
    
    return decorator_aut