import django_filters # pyright: ignore[reportMissingModuleSource]
from django.db.models import Q, Count, Avg, Min, Max # pyright: ignore[reportMissingModuleSource]
from .models import ItemFep, ItemCategoryFep # pyright: ignore[reportMissingImports]

class ItemFilterFep(django_filters.FilterSet):
    min_price_fep = django_filters.NumberFilter(field_name='price_fep', lookup_expr='gte')
    max_price_fep = django_filters.NumberFilter(field_name='price_fep', lookup_expr='lte')
    category_fep = django_filters.ModelChoiceFilter(
        queryset=ItemCategoryFep.objects.all(),
        field_name='category_fep'
    )
    category_slug_fep = django_filters.CharFilter(
        field_name='category_fep__slug_fep',
        lookup_expr='exact'
    )
    condition_fep = django_filters.MultipleChoiceFilter(
        field_name='condition_fep',
        choices=ItemFep.CONDITION_CHOICES_FEP
    )
    status_fep = django_filters.MultipleChoiceFilter(
        field_name='status_fep',
        choices=ItemFep.STATUS_CHOICES_FEP
    )
    location_fep = django_filters.CharFilter(field_name='location_fep', lookup_expr='icontains')
    seller_fep = django_filters.NumberFilter(field_name='seller_fep__id')
    is_negotiable_fep = django_filters.BooleanFilter(field_name='is_negotiable_fep')
    is_shippable_fep = django_filters.BooleanFilter(field_name='is_shippable_fep')
    has_images_fep = django_filters.BooleanFilter(
        method='filter_has_images_fep',
        label='Has Images'
    )
    tags_fep = django_filters.CharFilter(
        method='filter_tags_fep',
        label='Tags'
    )
    search_fep = django_filters.CharFilter(
        method='filter_search_fep',
        label='Search'
    )
    distance_fep = django_filters.NumberFilter(
        method='filter_distance_fep',
        label='Distance from location (km)'
    )
    latitude_fep = django_filters.NumberFilter(
        method='filter_distance_fep',
        label='Latitude for distance calculation'
    )
    longitude_fep = django_filters.NumberFilter(
        method='filter_distance_fep',
        label='Longitude for distance calculation'
    )
    
    class MetaFep:
        model = ItemFep
        fields = {
            'price_fep': ['exact', 'gte', 'lte'],
            'created_at_fep': ['gte', 'lte', 'exact'],
        }
    
    def filter_has_images_fep(self, queryset_fep, name_fep, value_fep):
        if value_fep:
            return queryset_fep.filter(images_fep__isnull=False).distinct()
        return queryset_fep.filter(images_fep__isnull=True)
    
    def filter_tags_fep(self, queryset_fep, name_fep, value_fep):
        tags_list_fep = [tag_fep.strip() for tag_fep in value_fep.split(',')]
        query_fep = Q()
        for tag_fep in tags_list_fep:
            query_fep |= Q(tags_fep__contains=[tag_fep])
        return queryset_fep.filter(query_fep)
    
    def filter_search_fep(self, queryset_fep, name_fep, value_fep):
        return queryset_fep.filter(
            Q(title_fep__icontains=value_fep) |
            Q(description_fep__icontains=value_fep) |
            Q(location_fep__icontains=value_fep)
        )
    
    def filter_distance_fep(self, queryset_fep, name_fep, value_fep):
        latitude_fep = self.data.get('latitude_fep')
        longitude_fep = self.data.get('longitude_fep')
        max_distance_fep = value_fep
        
        if not all([latitude_fep, longitude_fep, max_distance_fep]):
            return queryset_fep
        
        try:
            from django.contrib.gis.geos import Point # pyright: ignore[reportMissingModuleSource]
            from django.contrib.gis.db.models.functions import Distance # pyright: ignore[reportMissingModuleSource]
            from django.contrib.gis.measure import D # pyright: ignore[reportMissingModuleSource]
            
            user_location_fep = Point(float(longitude_fep), float(latitude_fep), srid=4326)
            
            queryset_fep = queryset_fep.annotate(
                distance_fep=Distance('point_fep', user_location_fep)
            ).filter(
                distance_fep__lte=D(km=float(max_distance_fep))
            ).order_by('distance_fep')
            
        except (ImportError, ValueError):
            pass
        
        return queryset_fep

class AdvancedItemQueryFep:
    @staticmethod
    def get_popular_items_fep(limit_fep=10):
        return ItemFep.objects.filter(
            status_fep='active_fep'
        ).annotate(
            popularity_score_fep=Count('favorited_by_fep') * 2 + Count('views_fep')
        ).order_by('-popularity_score_fep')[:limit_fep]
    
    @staticmethod
    def get_price_statistics_fep(category_id_fep=None):
        queryset_fep = ItemFep.objects.filter(status_fep='active_fep')
        
        if category_id_fep:
            queryset_fep = queryset_fep.filter(category_fep_id=category_id_fep)
        
        return queryset_fep.aggregate(
            avg_price_fep=Avg('price_fep'),
            min_price_fep=Min('price_fep'),
            max_price_fep=Max('price_fep'),
            count_fep=Count('id')
        )
    
    @staticmethod
    def get_similar_items_fep(item_fep, limit_fep=5):
        return ItemFep.objects.filter(
            category_fep=item_fep.category_fep,
            status_fep='active_fep'
        ).exclude(
            id=item_fep.id
        ).annotate(
            similarity_score_fep=Count(
                'tags_fep',
                filter=Q(tags_fep__overlap=item_fep.tags_fep)
            )
        ).order_by('-similarity_score_fep', '-created_at_fep')[:limit_fep]
    
    @staticmethod
    def get_recently_viewed_fep(user_fep, limit_fep=10):
        from django.core.cache import cache # pyright: ignore[reportMissingModuleSource]
        cache_key_fep = f"recently_viewed_{user_fep.id}"
        
        item_ids_fep = cache.get(cache_key_fep, [])
        if not item_ids_fep:
            return ItemFep.objects.none()
        
        preserved_fep = {id_fep: index_fep for index_fep, id_fep in enumerate(item_ids_fep)}
        queryset_fep = ItemFep.objects.filter(id__in=item_ids_fep)
        
        return sorted(
            queryset_fep,
            key=lambda x_fep: preserved_fep.get(x_fep.id, 0)
        )[:limit_fep]