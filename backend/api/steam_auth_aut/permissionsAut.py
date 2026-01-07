from rest_framework import permissions # pyright: ignore[reportMissingImports]
from .models import SteamAPITokenAut # pyright: ignore[reportMissingImports]

class IsSteamAuthenticatedAut(permissions.BasePermission):
    def has_permission_aut(self, request_aut, view_aut):
        return bool(request_aut.user and request_aut.user.is_authenticated and request_aut.user.steam_id_aut)

class IsUserOwnerAut(permissions.BasePermission):
    def has_object_permission_aut(self, request_aut, view_aut, obj_aut):
        return obj_aut == request_aut.user or obj_aut.user_aut == request_aut.user

class HasValidSteamAPITokenAut(permissions.BasePermission):
    def has_permission_aut(self, request_aut, view_aut):
        auth_header_aut = request_aut.headers.get('Authorization')
        
        if not auth_header_aut:
            return False
        
        try:
            scheme_aut, token_aut = auth_header_aut.split()
            if scheme_aut.lower() != 'steam':
                return False
            
            # Validate Steam API token
            api_token_aut = SteamAPITokenAut.objects.filter(
                token_aut=token_aut,
                is_active_aut=True
            ).first()
            
            if api_token_aut:
                api_token_aut.increment_usage_aut()
                request_aut.user = api_token_aut.user_aut
                return True
            
            return False
            
        except (ValueError, AttributeError):
            return False

class RateLimitedBySteamIDAut(permissions.BasePermission):
    def has_permission_aut(self, request_aut, view_aut):
        from django.core.cache import cache # pyright: ignore[reportMissingModuleSource]
        
        if not request_aut.user.is_authenticated or not request_aut.user.steam_id_aut:
            return True
        
        steam_id_aut = request_aut.user.steam_id_aut
        cache_key_aut = f"rate_limit_{steam_id_aut}_{view_aut.__class__.__name__}"
        
        request_count_aut = cache.get(cache_key_aut, 0)
        
        if request_count_aut >= 100:  # 100 requests per hour
            return False
        
        cache.set(cache_key_aut, request_count_aut + 1, timeout=3600)
        return True