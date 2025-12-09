from django.urls import path, include
from .views import ItemDetailView, OfferViewSet, UserActiveOffersView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'', OfferViewSet)

urlpatterns = [
    path('item/<int:item_id>/', ItemDetailView.as_view(), name='item-detail'),
    path('user-active/', UserActiveOffersView.as_view(), name='user-active-offers'),
    path('', include(router.urls)),
]
