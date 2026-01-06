from rest_framework.throttling import UserRateThrottle, AnonRateThrottle # pyright: ignore[reportMissingImports]
from django.core.cache import cache # pyright: ignore[reportMissingModuleSource]

class SteamLoginThrottleAut(UserRateThrottle):
    rate = '10/hour'
    scope = 'steam_login_aut'
    
    def get_cache_key_aut(self, request_aut, view_aut):
        if request_aut.user.is_authenticated:
            ident_aut = request_aut.user.pk
        else:
            ident_aut = self.get_ident(request_aut)
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident_aut
        }

class TokenRefreshThrottleAut(UserRateThrottle):
    rate = '30/hour'
    scope = 'token_refresh_aut'
    
    def get_cache_key_aut(self, request_aut, view_aut):
        if request_aut.user.is_authenticated:
            ident_aut = request_aut.user.pk
        else:
            ident_aut = self.get_ident(request_aut)
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident_aut
        }

class SteamAPICallThrottleAut(UserRateThrottle):
    rate = '60/minute'
    scope = 'steam_api_aut'
    
    def get_cache_key_aut(self, request_aut, view_aut):
        if request_aut.user.is_authenticated and request_aut.user.steam_id_aut:
            ident_aut = request_aut.user.steam_id_aut
        else:
            ident_aut = self.get_ident(request_aut)
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident_aut
        }

class IPBasedThrottleAut(AnonRateThrottle):
    rate = '100/day'
    scope = 'ip_based_aut'
    
    def get_cache_key_aut(self, request_aut, view_aut):
        ip_aut = self.get_ident(request_aut)
        return f"throttle_{self.scope}_{ip_aut}"