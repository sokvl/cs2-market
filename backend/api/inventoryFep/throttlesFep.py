from rest_framework.throttling import UserRateThrottle # pyright: ignore[reportMissingImports]

class RefreshThrottleFep(UserRateThrottle):
    rate = '5/minute'
    scope = 'refresh'
    
    def get_cache_key_fep(self, request_fep, view_fep):
        if request_fep.user.is_authenticated:
            return f"throttle_refresh_{request_fep.user.id}"
        return super().get_cache_key(request_fep, view_fep)
    
    def allow_request_fep(self, request_fep, view_fep):
        user_fep = request_fep.user
        if user_fep.is_superuser:
            return True
        return super().allow_request(request_fep, view_fep)

class InventoryListThrottleFep(UserRateThrottle):
    rate = '100/hour'
    scope = 'inventory_list'
    
    def get_cache_key_fep(self, request_fep, view_fep):
        if request_fep.user.is_authenticated:
            return f"throttle_inventory_list_{request_fep.user.id}"
        return super().get_cache_key(request_fep, view_fep)