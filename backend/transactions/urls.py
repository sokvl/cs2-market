from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet, RatingViewSet, NotificationViewSet, UserTransactionsView

router = DefaultRouter()

router.register(r'ratings', RatingViewSet)
router.register(r'notifications', NotificationViewSet, basename='notifications')
router.register(r'', TransactionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('user-transactions', UserTransactionsView.as_view(), name='user-transactions'),
]