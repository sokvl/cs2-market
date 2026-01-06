from rest_framework.throttling import UserRateThrottle, AnonRateThrottle, ScopedRateThrottle # pyright: ignore[reportMissingImports]
from django.core.cache import cache # pyright: ignore[reportMissingModuleSource]
from django.utils import timezone # pyright: ignore[reportMissingModuleSource]
from .models import SecurityEventAut, RateLimitRuleAut # pyright: ignore[reportMissingImports]

class UserRateThrottleAut(UserRateThrottle):
    scope_aut = 'user_aut'
    
    def get_cache_key_aut(self, request_aut, view_aut):
        if request_aut.user.is_authenticated:
            ident_aut = request_aut.user.pk
        else:
            ident_aut = self.get_ident(request_aut)
        
        return self.cache_format % {
            'scope': self.scope_aut,
            'ident': ident_aut
        }
    
    def allow_request_aut(self, request_aut, view_aut):
        # Check if user is exempt from rate limiting
        if request_aut.user.is_authenticated and request_aut.user.has_role_aut('admin_aut'):
            return True
        
        return super().allow_request(request_aut, view_aut)

class AnonRateThrottleAut(AnonRateThrottle):
    scope_aut = 'anon_aut'
    
    def get_cache_key_aut(self, request_aut, view_aut):
        return super().get_cache_key(request_aut, view_aut)
    
    def allow_request_aut(self, request_aut, view_aut):
        allowed_aut = super().allow_request(request_aut, view_aut)
        
        if not allowed_aut:
            # Log rate limit event for anonymous users
            SecurityEventAut.objects.create(
                event_type_aut='rate_limit_exceeded_aut',
                ip_address_aut=request_aut.META.get('REMOTE_ADDR'),
                user_agent_aut=request_aut.META.get('HTTP_USER_AGENT', ''),
                severity_aut='medium_aut',
                details_aut={
                    'scope_aut': self.scope_aut,
                    'rate_aut': self.rate,
                    'path_aut': request_aut.path
                }
            )
        
        return allowed_aut

class ScopedRateThrottleAut(ScopedRateThrottle):
    def get_cache_key_aut(self, request_aut, view_aut):
        if request_aut.user.is_authenticated:
            ident_aut = f"user_{request_aut.user.pk}"
        else:
            ident_aut = f"ip_{self.get_ident(request_aut)}"
        
        return self.cache_format % {
            'scope': self.scope_aut,
            'ident': ident_aut
        }

class DynamicRateThrottleAut(UserRateThrottle):
    def get_rate_aut(self):
        # Get rate limit from database rules
        try:
            rule_aut = RateLimitRuleAut.objects.filter(
                is_active_aut=True,
                rate_type_aut='user_aut'
            ).first()
            
            if rule_aut:
                return rule_aut.rate_limit_aut
        except Exception:
            pass
        
        return '100/hour'
    
    def allow_request_aut(self, request_aut, view_aut):
        self.rate_aut = self.get_rate_aut()
        self.num_requests_aut, self.duration_aut = self.parse_rate_aut(self.rate_aut)
        
        return super().allow_request(request_aut, view_aut)
    
    def parse_rate_aut(self, rate_aut):
        if rate_aut is None:
            return (None, None)
        
        num_aut, period_aut = rate_aut.split('/')
        num_requests_aut = int(num_aut)
        
        duration_aut = {'s': 1, 'm': 60, 'h': 3600, 'd': 86400}[period_aut[0]]
        
        return (num_requests_aut, duration_aut)

class BurstRateThrottleAut(UserRateThrottle):
    scope_aut = 'burst_aut'
    rate_aut = '10/minute'
    
    def allow_request_aut(self, request_aut, view_aut):
        # Allow burst for certain actions
        if request_aut.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        return super().allow_request(request_aut, view_aut)

class SustainedRateThrottleAut(UserRateThrottle):
    scope_aut = 'sustained_aut'
    rate_aut = '1000/day'
    
    def allow_request_aut(self, request_aut, view_aut):
        return super().allow_request(request_aut, view_aut)

class IPBasedThrottleAut(AnonRateThrottle):
    scope_aut = 'ip_based_aut'
    rate_aut = '100/hour'
    
    def get_cache_key_aut(self, request_aut, view_aut):
        ip_aut = self.get_ident(request_aut)
        return f"throttle_{self.scope_aut}_{ip_aut}"

class EndpointThrottleAut(ScopedRateThrottle):
    def get_scope_aut(self, request_aut, view_aut):
        # Use view name as scope
        return view_aut.__class__.__name__
    
    def get_cache_key_aut(self, request_aut, view_aut):
        scope_aut = self.get_scope_aut(request_aut, view_aut)
        
        if request_aut.user.is_authenticated:
            ident_aut = f"user_{request_aut.user.pk}"
        else:
            ident_aut = f"ip_{self.get_ident(request_aut)}"
        
        return f"throttle_{scope_aut}_{ident_aut}"

class TokenBucketThrottleAut:
    def __init__(self, capacity_aut=10, refill_rate_aut=1):
        self.capacity_aut = capacity_aut
        self.refill_rate_aut = refill_rate_aut  # tokens per second
    
    def allow_request_aut(self, request_aut, view_aut):
        cache_key_aut = f"token_bucket_{self.get_ident_aut(request_aut)}"
        
        # Get current bucket state
        bucket_aut = cache.get(cache_key_aut)
        now_aut = timezone.now().timestamp()
        
        if not bucket_aut:
            bucket_aut = {'tokens_aut': self.capacity_aut, 'last_refill_aut': now_aut}
        
        # Calculate time passed and refill tokens
        time_passed_aut = now_aut - bucket_aut['last_refill_aut']
        tokens_to_add_aut = time_passed_aut * self.refill_rate_aut
        
        bucket_aut['tokens_aut'] = min(
            self.capacity_aut,
            bucket_aut['tokens_aut'] + tokens_to_add_aut
        )
        bucket_aut['last_refill_aut'] = now_aut
        
        # Check if request can be served
        if bucket_aut['tokens_aut'] >= 1:
            bucket_aut['tokens_aut'] -= 1
            cache.set(cache_key_aut, bucket_aut, timeout=3600)
            return True
        
        cache.set(cache_key_aut, bucket_aut, timeout=3600)
        return False
    
    def get_ident_aut(self, request_aut):
        if request_aut.user.is_authenticated:
            return f"user_{request_aut.user.pk}"
        return f"ip_{request_aut.META.get('REMOTE_ADDR', 'unknown')}"