from django.urls import path, include # pyright: ignore[reportMissingModuleSource]
from rest_framework.routers import DefaultRouter # pyright: ignore[reportMissingImports]
from .views import InventoryViewSetFep # pyright: ignore[reportMissingImports]

router_fep = DefaultRouter()
router_fep.register(r'inventory', InventoryViewSetFep, basename='inventory')

urlpatterns_fep = [
    path('', include(router_fep.urls)),
    path('inventory/<int:pk>/mark-tradable/', 
         InventoryViewSetFep.as_view({'post': 'mark_as_tradable_fep'}), 
         name='mark_tradable_fep'),
]