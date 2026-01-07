from rest_framework.throttling import UserRateThrottle, AnonRateThrottle # pyright: ignore[reportMissingImports]

class ItemListThrottleFep(UserRateThrottle):
    rate = '1000/hour'
    scope = 'item_list_fep'
    
    def get_cache_key_fep(self, request_fep, view_fep):
        if request_fep.user.is_authenticated:
            ident_fep = request_fep.user.pk
        else:
            ident_fep = self.get_ident(request_fep)
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident_fep
        }

class ItemDetailThrottleFep(UserRateThrottle):
    rate = '500/hour'
    scope = 'item_detail_fep'
    
    def get_cache_key_fep(self, request_fep, view_fep):
        if request_fep.user.is_authenticated:
            ident_fep = request_fep.user.pk
        else:
            ident_fep = self.get_ident(request_fep)
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident_fep
        }

class ItemSellThrottleFep(UserRateThrottle):
    rate = '10/hour'
    scope = 'item_sell_fep'
    
    def get_cache_key_fep(self, request_fep, view_fep):
        if request_fep.user.is_authenticated:
            ident_fep = request_fep.user.pk
        else:
            ident_fep = self.get_ident(request_fep)
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident_fep
        }

class SearchThrottleFep(AnonRateThrottle):
    rate = '50/minute'
    scope = 'search_fep'
    
    def get_cache_key_fep(self, request_fep, view_fep):
        return self.cache_format % {
            'scope': self.scope,
            'ident': self.get_ident(request_fep)
        }