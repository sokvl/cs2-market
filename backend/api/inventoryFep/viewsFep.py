from django.core.cache import cache # pyright: ignore[reportMissingModuleSource]
from rest_framework import viewsets, status, filters # pyright: ignore[reportMissingImports]
from rest_framework.decorators import action # pyright: ignore[reportMissingImports]
from rest_framework.response import Response # pyright: ignore[reportMissingImports]
from rest_framework.permissions import IsAuthenticated # pyright: ignore[reportMissingImports]
from django_filters import rest_framework as django_filters # pyright: ignore[reportMissingModuleSource]
from .models import InventoryItemFep # pyright: ignore[reportMissingImports]
from .serializers import InventoryItemSerializerFep # pyright: ignore[reportMissingImports]
from .services import SteamInventoryServiceFep # pyright: ignore[reportMissingImports]
from .throttles import RefreshThrottleFep, InventoryListThrottleFep # pyright: ignore[reportMissingImports]

class InventoryItemFilterFep(django_filters.FilterSet):
    min_quantity_fep = django_filters.NumberFilter(field_name='quantity_fep', lookup_expr='gte')
    max_quantity_fep = django_filters.NumberFilter(field_name='quantity_fep', lookup_expr='lte')
    type_fep = django_filters.CharFilter(field_name='type_fep', lookup_expr='icontains')
    rarity_fep = django_filters.CharFilter(field_name='rarity_fep', lookup_expr='icontains')
    tradable_fep = django_filters.BooleanFilter(field_name='tradable_fep')
    marketable_fep = django_filters.BooleanFilter(field_name='marketable_fep')
    search_fep = django_filters.CharFilter(field_name='name_fep', lookup_expr='icontains')
    
    class MetaFep:
        model = InventoryItemFep
        fields = [
            'app_id_fep',
            'type_fep',
            'rarity_fep',
            'tradable_fep',
            'marketable_fep',
            'min_quantity_fep',
            'max_quantity_fep',
            'search_fep'
        ]
    
    def filter_queryset_fep(self, queryset_fep):
        filtered_queryset_fep = super().filter_queryset(queryset_fep)
        return filtered_queryset_fep.order_by('-last_updated_fep')

class InventoryViewSetFep(viewsets.ModelViewSet):
    serializer_class = InventoryItemSerializerFep
    permission_classes = [IsAuthenticated]
    filterset_class = InventoryItemFilterFep
    throttle_classes = [InventoryListThrottleFep]
    ordering_fields = ['name_fep', 'quantity_fep', 'last_updated_fep', 'rarity_fep']
    ordering = ['-last_updated_fep']
    
    def get_queryset(self):
        user_fep = self.request.user
        queryset_fep = InventoryItemFep.objects.filter(user_fep=user_fep)
        
        cache_key_fep = self.generate_cache_key_fep(user_fep.id)
        cached_queryset_fep = cache.get(cache_key_fep)
        
        if cached_queryset_fep is not None:
            return cached_queryset_fep
        
        filtered_queryset_fep = self.filter_queryset(queryset_fep)
        cache.set(cache_key_fep, filtered_queryset_fep, 300)
        
        return filtered_queryset_fep
    
    def generate_cache_key_fep(self, user_id_fep):
        params_fep = self.request.GET.urlencode()
        return f"inventory_cache_{user_id_fep}_{params_fep}"
    
    def list(self, request_fep, *args_fep, **kwargs_fep):
        response_fep = super().list(request_fep, *args_fep, **kwargs_fep)
        
        total_items_fep = self.get_queryset().count()
        page_fep = request_fep.GET.get('page', 1)
        response_fep.data['metadata_fep'] = {
            'total_items_fep': total_items_fep,
            'current_page_fep': page_fep,
            'cache_status_fep': 'fresh' if cache.get(self.generate_cache_key_fep(request_fep.user.id)) else 'miss'
        }
        
        return response_fep
    
    @action(detail=False, methods=['post'], throttle_classes=[RefreshThrottleFep])
    def refresh(self, request_fep):
        user_fep = request_fep.user
        
        try:
            steam_id_fep = user_fep.profile.steam_id
        except AttributeError:
            return Response(
                {'error_fep': 'Steam ID not linked to profile'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        steam_service_fep = SteamInventoryServiceFep()
        
        validation_result_fep = steam_service_fep.validate_steam_id_fep(steam_id_fep)
        if not validation_result_fep:
            return Response(
                {'error_fep': 'Invalid Steam ID format'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        success_fep = steam_service_fep.sync_user_inventory_fep(user_fep, steam_id_fep)
        
        if success_fep:
            self.clear_user_cache_fep(user_fep.id)
            steam_service_fep.clear_inventory_cache_fep(steam_id_fep)
            
            return Response(
                {
                    'status_fep': 'Inventory refreshed successfully',
                    'timestamp_fep': self.get_current_timestamp_fep()
                },
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'error_fep': 'Failed to sync with Steam'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def clear_user_cache_fep(self, user_id_fep):
        pattern_fep = f"inventory_cache_{user_id_fep}_*"
        keys_fep = cache.keys(pattern_fep)
        if keys_fep:
            cache.delete_many(keys_fep)
        return True
    
    def get_current_timestamp_fep(self):
        from django.utils import timezone # pyright: ignore[reportMissingModuleSource]
        return timezone.now().isoformat()
    
    @action(detail=True, methods=['post'])
    def mark_as_tradable_fep(self, request_fep, pk_fep=None):
        item_fep = self.get_object()
        item_fep.tradable_fep = True
        item_fep.save()
        
        self.clear_user_cache_fep(request_fep.user.id)
        
        return Response(
            {'status_fep': 'Item marked as tradable'},
            status=status.HTTP_200_OK
        )