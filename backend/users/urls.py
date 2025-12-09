from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, WalletDetailView, UserAverageRatingView

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('<str:steam_id>/', UserViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='user-detail'),
    path('', UserViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='user-list'),
    path('wallet/<str:steam_id>/', WalletDetailView.as_view(), name='wallet-detail'),
    path('rating', UserAverageRatingView.as_view(), name='user-rating'),
]
