from rest_framework import permissions # pyright: ignore[reportMissingImports]
from .models import ItemFep # pyright: ignore[reportMissingImports]

class IsItemOwnerFep(permissions.BasePermission):
    def has_object_permission(self, request_fep, view_fep, obj_fep):
        return obj_fep.seller_fep == request_fep.user

class IsItemOwnerOrReadOnlyFep(permissions.BasePermission):
    def has_object_permission(self, request_fep, view_fep, obj_fep):
        if request_fep.method in permissions.SAFE_METHODS:
            return True
        return obj_fep.seller_fep == request_fep.user

class CanSellItemFep(permissions.BasePermission):
    def has_permission(self, request_fep, view_fep):
        if request_fep.method == 'POST':
            user_fep = request_fep.user
            
            # Check if user is verified (add your own verification logic)
            if not hasattr(user_fep, 'profile_fep') or not user_fep.profile_fep.is_verified_fep:
                return False
            
            # Check if user has reached listing limit
            today_fep = timezone.now().date() # pyright: ignore[reportUndefinedVariable]
            today_listings_fep = ItemFep.objects.filter(
                seller_fep=user_fep,
                created_at_fep__date=today_fep
            ).count()
            
            return today_listings_fep < 10  # Limit to 10 listings per day
        
        return True

class CanViewItemDetailsFep(permissions.BasePermission):
    def has_object_permission(self, request_fep, view_fep, obj_fep):
        # Allow viewing if item is active or user is owner
        if obj_fep.status_fep == 'active_fep':
            return True
        
        # Allow owner to view their own items in any status
        if request_fep.user.is_authenticated and obj_fep.seller_fep == request_fep.user:
            return True
        
        return False

class ItemRateLimitFep(permissions.BasePermission):
    def has_permission(self, request_fep, view_fep):
        from django.core.cache import cache # pyright: ignore[reportMissingModuleSource]
        
        if request_fep.method == 'POST':
            user_fep = request_fep.user
            cache_key_fep = f"item_create_rate_{user_fep.id}"
            
            count_fep = cache.get(cache_key_fep, 0)
            if count_fep >= 5:  # Max 5 items per hour
                return False
            
            cache.set(cache_key_fep, count_fep + 1, 3600)  # 1 hour
        
        return True