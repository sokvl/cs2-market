from django.core.cache import cache # pyright: ignore[reportMissingModuleSource]
from django.db.models import Count, Q # pyright: ignore[reportMissingModuleSource]
from django.utils import timezone # pyright: ignore[reportMissingModuleSource]
from rest_framework import viewsets, status, generics, filters # type: ignore
from rest_framework.decorators import action # pyright: ignore[reportMissingImports]
from rest_framework.response import Response # pyright: ignore[reportMissingImports]
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly # pyright: ignore[reportMissingImports]
from rest_framework.views import APIView # pyright: ignore[reportMissingImports]
from django_filters import rest_framework as django_filters # pyright: ignore[reportMissingModuleSource]
from .models import ItemFep, ItemCategoryFep, ItemFavoriteFep # pyright: ignore[reportMissingImports]
from .serializers import ( # pyright: ignore[reportMissingImports]
    ItemListSerializerFep,
    ItemDetailSerializerFep,
    ItemCreateSerializerFep,
    ItemSellSerializerFep,
    ItemCategorySerializerFep,
    ItemFavoriteSerializerFep
)
from .filters_fep import ItemFilterFep, AdvancedItemQueryFep # pyright: ignore[reportMissingImports]
from .permissions_fep import ( # pyright: ignore[reportMissingImports]
    IsItemOwnerOrReadOnlyFep,
    CanSellItemFep,
    CanViewItemDetailsFep,
    ItemRateLimitFep
)
from .throttles import ( # pyright: ignore[reportMissingImports]
    ItemListThrottleFep,
    ItemDetailThrottleFep,
    ItemSellThrottleFep,
    SearchThrottleFep
)
from .pagination_fep import ItemPaginationFep # pyright: ignore[reportMissingImports]
from .services import ItemServiceFep, ItemSellingServiceFep, ItemAnalyticsServiceFep # pyright: ignore[reportMissingImports]

class ItemCategoryViewSetFep(viewsets.ReadOnlyModelViewSet):
    queryset = ItemCategoryFep.objects.all()
    serializer_class = ItemCategorySerializerFep
    lookup_field = 'slug_fep'
    
    def get_queryset(self):
        cache_key_fep = 'item_categories_all'
        cached_categories_fep = cache.get(cache_key_fep)
        
        if cached_categories_fep:
            return cached_categories_fep
        
        categories_fep = ItemCategoryFep.objects.all()
        cache.set(cache_key_fep, categories_fep, 3600)  # 1 hour cache
        
        return categories_fep

class ItemViewSetFep(viewsets.ModelViewSet):
    queryset = ItemFep.objects.filter(status_fep='active_fep')
    serializer_class = ItemListSerializerFep
    permission_classes = [IsAuthenticatedOrReadOnly, IsItemOwnerOrReadOnlyFep]
    throttle_classes = [ItemListThrottleFep]
    filter_backends = [
        django_filters.DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    filterset_class = ItemFilterFep
    pagination_class = ItemPaginationFep
    search_fields = ['title_fep', 'description_fep', 'location_fep']
    ordering_fields = ['price_fep', 'created_at_fep', 'views_fep', 'favorites_fep']
    
    def get_queryset(self):
        cache_key_fep = self.generate_cache_key_fep()
        cached_queryset_fep = cache.get(cache_key_fep)
        
        if cached_queryset_fep:
            return cached_queryset_fep
        
        queryset_fep = super().get_queryset()
        
        # Apply advanced filtering
        category_id_fep = self.request.GET.get('category_fep')
        if category_id_fep:
            queryset_fep = queryset_fep.filter(category_fep_id=category_id_fep)
        
        # Apply price range
        min_price_fep = self.request.GET.get('min_price_fep')
        max_price_fep = self.request.GET.get('max_price_fep')
        if min_price_fep:
            queryset_fep = queryset_fep.filter(price_fep__gte=min_price_fep)
        if max_price_fep:
            queryset_fep = queryset_fep.filter(price_fep__lte=max_price_fep)
        
        cache.set(cache_key_fep, queryset_fep, 300)  # 5 minute cache
        return queryset_fep
    
    def generate_cache_key_fep(self):
        params_fep = self.request.GET.urlencode()
        user_id_fep = self.request.user.id if self.request.user.is_authenticated else 'anonymous'
        return f"items_list_{user_id_fep}_{params_fep}"
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ItemDetailSerializerFep
        elif self.action == 'create':
            return ItemCreateSerializerFep
        return super().get_serializer_class()
    
    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated(), CanSellItemFep(), ItemRateLimitFep()]
        elif self.action == 'destroy' or self.action == 'update' or self.action == 'partial_update':
            return [IsAuthenticated(), IsItemOwnerOrReadOnlyFep()]
        elif self.action == 'retrieve':
            return [CanViewItemDetailsFep()]
        return super().get_permissions()
    
    def retrieve(self, request_fep, *args_fep, **kwargs_fep):
        instance_fep = self.get_object()
        instance_fep.increment_views_fep()
        
        # Track recently viewed
        if request_fep.user.is_authenticated:
            cache_key_fep = f"recently_viewed_{request_fep.user.id}"
            item_ids_fep = cache.get(cache_key_fep, [])
            
            if instance_fep.id in item_ids_fep:
                item_ids_fep.remove(instance_fep.id)
            
            item_ids_fep.insert(0, instance_fep.id)
            cache.set(cache_key_fep, item_ids_fep[:20], 86400)  # 24 hours
        
        serializer_fep = self.get_serializer(instance_fep)
        return Response(serializer_fep.data)
    
    @action(detail=False, methods=['get'])
    def popular_fep(self, request_fep):
        limit_fep = int(request_fep.GET.get('limit_fep', 10))
        popular_items_fep = AdvancedItemQueryFep.get_popular_items_fep(limit_fep)
        serializer_fep = self.get_serializer(popular_items_fep, many=True)
        return Response(serializer_fep.data)
    
    @action(detail=False, methods=['get'])
    def trending_fep(self, request_fep):
        days_fep = int(request_fep.GET.get('days_fep', 7))
        limit_fep = int(request_fep.GET.get('limit_fep', 10))
        
        trending_items_fep = ItemServiceFep.get_trending_items_fep(days_fep, limit_fep)
        serializer_fep = self.get_serializer(trending_items_fep, many=True)
        return Response(serializer_fep.data)
    
    @action(detail=True, methods=['post'])
    def favorite_fep(self, request_fep, pk_fep=None):
        item_fep = self.get_object()
        user_fep = request_fep.user
        
        favorite_fep, created_fep = ItemFavoriteFep.objects.get_or_create(
            user_fep=user_fep,
            item_fep=item_fep
        )
        
        if created_fep:
            item_fep.increment_favorites_fep()
            return Response(
                {'status_fep': 'Item added to favorites'},
                status=status.HTTP_201_CREATED
            )
        
        favorite_fep.delete()
        return Response(
            {'status_fep': 'Item removed from favorites'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['get'])
    def similar_fep(self, request_fep, pk_fep=None):
        item_fep = self.get_object()
        limit_fep = int(request_fep.GET.get('limit_fep', 5))
        
        similar_items_fep = AdvancedItemQueryFep.get_similar_items_fep(item_fep, limit_fep)
        serializer_fep = self.get_serializer(similar_items_fep, many=True)
        return Response(serializer_fep.data)
    
    @action(detail=True, methods=['get'])
    def analytics_fep(self, request_fep, pk_fep=None):
        item_fep = self.get_object()
        
        if item_fep.seller_fep != request_fep.user:
            return Response(
                {'error_fep': 'You can only view analytics for your own items'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        analytics_fep = ItemAnalyticsServiceFep.get_item_analytics_fep(item_fep)
        return Response(analytics_fep)

class ItemSellViewFep(APIView):
    permission_classes = [IsAuthenticated, CanSellItemFep, ItemRateLimitFep]
    throttle_classes = [ItemSellThrottleFep]
    
    def post(self, request_fep):
        serializer_fep = ItemSellSerializerFep(data=request_fep.data)
        
        if not serializer_fep.is_valid():
            return Response(
                serializer_fep.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        validated_data_fep = serializer_fep.validated_data
        
        # Validate price
        category_fep = validated_data_fep.get('category_fep')
        price_fep = validated_data_fep.get('price_fep')
        
        is_valid_fep, message_fep = ItemSellingServiceFep.validate_selling_price_fep(
            price_fep,
            category_fep
        )
        
        if not is_valid_fep:
            return Response(
                {'error_fep': message_fep},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create the item
        item_fep = ItemSellingServiceFep.list_item_for_sale_fep(
            request_fep.user,
            validated_data_fep
        )
        
        return Response(
            {
                'status_fep': 'Item listed successfully',
                'item_id_fep': item_fep.id,
                'message_fep': 'Your item is now live for sale'
            },
            status=status.HTTP_201_CREATED
        )

class ItemSearchViewFep(generics.ListAPIView):
    serializer_class = ItemListSerializerFep
    throttle_classes = [SearchThrottleFep]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title_fep', 'description_fep', 'location_fep']
    
    def get_queryset(self):
        query_fep = self.request.GET.get('q_fep', '')
        
        if query_fep:
            ItemServiceFep.log_search_fep(
                self.request.user,
                query_fep,
                self.request.GET.dict(),
                0  # Will update after filtering
            )
        
        return ItemFep.objects.filter(status_fep='active_fep')
    
    def list(self, request_fep, *args_fep, **kwargs_fep):
        response_fep = super().list(request_fep, *args_fep, **kwargs_fep)
        
        # Update search history with result count
        query_fep = request_fep.GET.get('q_fep', '')
        if query_fep:
            ItemSearchHistoryFep.objects.filter( # pyright: ignore[reportUndefinedVariable]
                user_fep=request_fep.user if request_fep.user.is_authenticated else None,
                query_fep=query_fep
            ).order_by('-created_at_fep').first().update(
                result_count_fep=response_fep.data.get('count_fep', 0)
            )
        
        # Add search suggestions
        if query_fep:
            suggestions_fep = ItemServiceFep.get_search_suggestions_fep(query_fep)
            response_fep.data['suggestions_fep'] = suggestions_fep
        
        return response_fep
    
    @action(detail=False, methods=['get'])
    def autocomplete_fep(self, request_fep):
        query_fep = request_fep.GET.get('q_fep', '')
        if not query_fep:
            return Response([])
        
        suggestions_fep = ItemServiceFep.get_search_suggestions_fep(query_fep)
        return Response(suggestions_fep)

class ItemAdvancedSearchViewFep(generics.ListAPIView):
    serializer_class = ItemListSerializerFep
    filter_backends = [django_filters.DjangoFilterBackend]
    filterset_class = ItemFilterFep
    
    def get_queryset(self):
        queryset_fep = ItemFep.objects.filter(status_fep='active_fep')
        
        # Apply advanced location filter
        latitude_fep = self.request.GET.get('latitude_fep')
        longitude_fep = self.request.GET.get('longitude_fep')
        radius_fep = self.request.GET.get('radius_fep')
        
        if all([latitude_fep, longitude_fep, radius_fep]):
            try:
                items_fep = ItemServiceFep.get_items_within_radius_fep(
                    float(latitude_fep),
                    float(longitude_fep),
                    float(radius_fep)
                )
                return items_fep
            except ValueError:
                pass
        
        return queryset_fep

class UserFavoritesViewFep(generics.ListAPIView):
    serializer_class = ItemListSerializerFep
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ItemFep.objects.filter(
            favorited_by_fep__user_fep=self.request.user,
            status_fep='active_fep'
        ).order_by('-itemfavoritefep__created_at_fep')