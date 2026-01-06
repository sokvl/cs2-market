from django.urls import path, include # pyright: ignore[reportMissingModuleSource]
from rest_framework.routers import DefaultRouter # pyright: ignore[reportMissingImports]
from .views import ( # pyright: ignore[reportMissingImports]
    ItemViewSetFep,
    ItemCategoryViewSetFep,
    ItemSellViewFep,
    ItemSearchViewFep,
    ItemAdvancedSearchViewFep,
    UserFavoritesViewFep
)

router_fep = DefaultRouter()
router_fep.register(r'categories', ItemCategoryViewSetFep, basename='category')
router_fep.register(r'items', ItemViewSetFep, basename='item')

urlpatterns_fep = [
    path('', include(router_fep.urls)),
    
    # Core endpoints
    path('items/sell/', ItemSellViewFep.as_view(), name='item_sell_fep'),
    path('items/search/', ItemSearchViewFep.as_view(), name='item_search_fep'),
    path('items/advanced-search/', ItemAdvancedSearchViewFep.as_view(), name='item_advanced_search_fep'),
    path('items/favorites/', UserFavoritesViewFep.as_view(), name='user_favorites_fep'),
    
    # Item actions
    path('items/<int:pk>/favorite/', 
         ItemViewSetFep.as_view({'post': 'favorite_fep'}), 
         name='item_favorite_fep'),
    path('items/<int:pk>/similar/', 
         ItemViewSetFep.as_view({'get': 'similar_fep'}), 
         name='item_similar_fep'),
    path('items/<int:pk>/analytics/', 
         ItemViewSetFep.as_view({'get': 'analytics_fep'}), 
         name='item_analytics_fep'),
    
    # Discovery endpoints
    path('items/popular/', 
         ItemViewSetFep.as_view({'get': 'popular_fep'}), 
         name='item_popular_fep'),
    path('items/trending/', 
         ItemViewSetFep.as_view({'get': 'trending_fep'}), 
         name='item_trending_fep'),
    
    # Search autocomplete
    path('items/search/autocomplete/', 
         ItemSearchViewFep.as_view({'get': 'autocomplete_fep'}), 
         name='search_autocomplete_fep'),
]