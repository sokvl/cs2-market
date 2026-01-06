import json
import math
from datetime import datetime, timedelta
from django.core.cache import cache # pyright: ignore[reportMissingModuleSource]
from django.db.models import Q, Count, F, ExpressionWrapper, FloatField # pyright: ignore[reportMissingModuleSource]
from django.db.models.functions import Power, Sqrt # pyright: ignore[reportMissingModuleSource]
from django.conf import settings # pyright: ignore[reportMissingModuleSource]
from .models import ItemFep, ItemSearchHistoryFep # pyright: ignore[reportMissingImports]

class ItemServiceFep:
    CACHE_TIMEOUT_FEP = 300  # 5 minutes
    
    @staticmethod
    def calculate_distance_fep(lat1_fep, lon1_fep, lat2_fep, lon2_fep):
        R_fep = 6371  # Earth radius in km
        lat1_fep, lon1_fep, lat2_fep, lon2_fep = map(math.radians, [lat1_fep, lon1_fep, lat2_fep, lon2_fep])
        
        dlat_fep = lat2_fep - lat1_fep
        dlon_fep = lon2_fep - lon1_fep
        
        a_fep = math.sin(dlat_fep/2)**2 + math.cos(lat1_fep) * math.cos(lat2_fep) * math.sin(dlon_fep/2)**2
        c_fep = 2 * math.asin(math.sqrt(a_fep))
        
        return R_fep * c_fep
    
    @staticmethod
    def get_items_within_radius_fep(latitude_fep, longitude_fep, radius_km_fep):
        cache_key_fep = f"items_near_{latitude_fep}_{longitude_fep}_{radius_km_fep}"
        cached_result_fep = cache.get(cache_key_fep)
        
        if cached_result_fep:
            return cached_result_fep
        
        items_fep = ItemFep.objects.filter(
            status_fep='active_fep',
            latitude_fep__isnull=False,
            longitude_fep__isnull=False
        ).annotate(
            distance_fep=ExpressionWrapper(
                Sqrt(
                    Power(F('latitude_fep') - latitude_fep, 2) +
                    Power(F('longitude_fep') - longitude_fep, 2)
                ) * 111,  # Rough conversion to km
                output_field=FloatField()
            )
        ).filter(
            distance_fep__lte=radius_km_fep
        ).order_by('distance_fep')
        
        cache.set(cache_key_fep, items_fep, ItemServiceFep.CACHE_TIMEOUT_FEP)
        return items_fep
    
    @staticmethod
    def log_search_fep(user_fep, query_fep, filters_fep, result_count_fep):
        ItemSearchHistoryFep.objects.create(
            user_fep=user_fep if user_fep.is_authenticated else None,
            query_fep=query_fep,
            filters_fep=filters_fep,
            result_count_fep=result_count_fep
        )
    
    @staticmethod
    def get_search_suggestions_fep(query_fep, limit_fep=5):
        cache_key_fep = f"search_suggestions_{query_fep[:20]}"
        cached_suggestions_fep = cache.get(cache_key_fep)
        
        if cached_suggestions_fep:
            return cached_suggestions_fep
        
        suggestions_fep = ItemFep.objects.filter(
            Q(title_fep__icontains=query_fep) |
            Q(description_fep__icontains=query_fep)
        ).values_list('title_fep', flat=True).distinct()[:limit_fep]
        
        cache.set(cache_key_fep, list(suggestions_fep), 60)  # 1 minute cache
        return suggestions_fep
    
    @staticmethod
    def get_trending_items_fep(days_fep=7, limit_fep=10):
        cache_key_fep = f"trending_items_{days_fep}"
        cached_items_fep = cache.get(cache_key_fep)
        
        if cached_items_fep:
            return cached_items_fep
        
        from_date_fep = datetime.now() - timedelta(days=days_fep)
        
        trending_items_fep = ItemFep.objects.filter(
            status_fep='active_fep',
            created_at_fep__gte=from_date_fep
        ).annotate(
            trend_score_fep=(
                Count('favorited_by_fep') * 3 +
                F('views_fep') +
                Count('images_fep') * 2
            )
        ).order_by('-trend_score_fep')[:limit_fep]
        
        cache.set(cache_key_fep, trending_items_fep, 3600)  # 1 hour cache
        return trending_items_fep

class ItemSellingServiceFep:
    @staticmethod
    def list_item_for_sale_fep(user_fep, item_data_fep):
        item_fep = ItemFep.objects.create(
            seller_fep=user_fep,
            status_fep='active_fep',
            published_at_fep=datetime.now(),
            expires_at_fep=datetime.now() + timedelta(days=30),
            **item_data_fep
        )
        
        # Clear relevant caches
        cache.delete_pattern(f"items_near_*")
        cache.delete('trending_items_*')
        
        return item_fep
    
    @staticmethod
    def validate_selling_price_fep(price_fep, category_fep):
        from .filters_fep import AdvancedItemQueryFep # pyright: ignore[reportMissingImports]
        stats_fep = AdvancedItemQueryFep.get_price_statistics_fep(category_fep.id)
        
        avg_price_fep = stats_fep.get('avg_price_fep', 0)
        if avg_price_fep:
            # Price shouldn't be more than 10x the average or less than 1/10th
            if price_fep > avg_price_fep * 10:
                return False, f"Price is too high compared to average (${avg_price_fep:.2f})"
            if price_fep < avg_price_fep / 10:
                return False, f"Price is too low compared to average (${avg_price_fep:.2f})"
        
        return True, "Price is reasonable"
    
    @staticmethod
    def mark_item_as_sold_fep(item_fep, buyer_fep=None):
        item_fep.status_fep = 'sold_fep'
        item_fep.save(update_fields=['status_fep'])
        
        # Clear caches
        cache.delete_pattern(f"item_detail_{item_fep.id}_*")
        
        return item_fep

class ItemAnalyticsServiceFep:
    @staticmethod
    def get_item_analytics_fep(item_fep):
        analytics_fep = {
            'total_views_fep': item_fep.views_fep,
            'total_favorites_fep': item_fep.favorites_fep,
            'conversion_rate_fep': 0,
            'daily_views_fep': []
        }
        
        # Calculate conversion rate if item is sold
        if item_fep.status_fep == 'sold_fep' and item_fep.views_fep > 0:
            analytics_fep['conversion_rate_fep'] = (1 / item_fep.views_fep) * 100
        
        # Get daily views (simplified - would need a separate model in production)
        last_week_fep = datetime.now() - timedelta(days=7)
        if item_fep.created_at_fep.date() >= last_week_fep.date():
            days_active_fep = (datetime.now().date() - item_fep.created_at_fep.date()).days + 1
            avg_daily_views_fep = item_fep.views_fep / max(days_active_fep, 1)
            
            for i_fep in range(min(days_active_fep, 7)):
                analytics_fep['daily_views_fep'].append({
                    'date_fep': (item_fep.created_at_fep + timedelta(days=i_fep)).date(),
                    'views_fep': round(avg_daily_views_fep)
                })
        
        return analytics_fep
    
    @staticmethod
    def get_category_analytics_fep(category_fep):
        items_fep = ItemFep.objects.filter(category_fep=category_fep, status_fep='active_fep')
        
        return {
            'total_items_fep': items_fep.count(),
            'total_views_fep': items_fep.aggregate(total_fep=Count('views_fep'))['total_fep'],
            'avg_price_fep': items_fep.aggregate(avg_fep=Avg('price_fep'))['avg_fep'], # pyright: ignore[reportUndefinedVariable]
            'avg_views_per_item_fep': items_fep.aggregate(avg_fep=Avg('views_fep'))['avg_fep'] # pyright: ignore[reportUndefinedVariable]
        }