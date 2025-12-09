from transactions.models import Rating
from rest_framework import viewsets, generics
from django.contrib.auth import get_user_model
from .serializers import UserCreateUpdateSerializer, WalletSerializer
from api.serializers.User_serializer import UserSerializer 
from .models import Wallet
from rest_framework.exceptions import NotFound
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Avg

class UserViewSet(viewsets.ModelViewSet):
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer
    lookup_field = 'steam_id'

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UserCreateUpdateSerializer
        return UserSerializer
    

class UserAverageRatingView(APIView):
    def get(self, request, *args, **kwargs):
        steam_id = request.query_params.get('steam_id')
        
        if not steam_id:
            return Response({'error': 'steam_id parameter is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = get_user_model().objects.get(steam_id=steam_id)
        except get_user_model().DoesNotExist:
            return Response({'error': 'User does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        average_rating = Rating.objects.filter(
            transaction__offer__owner=user,
            transaction__is_closed=True
        ).aggregate(
            average_rating=Avg('stars')
        )['average_rating']

        if average_rating is None:
            average_rating = 0.0

        return Response({'average_rating': average_rating}, status=status.HTTP_200_OK)
    

class WalletDetailView(generics.RetrieveAPIView):
    queryset = Wallet.objects.all()
    serializer_class = WalletSerializer
    def get_object(self):
        steam_id = self.kwargs['steam_id']
        try:
            user = get_user_model().objects.get(steam_id=steam_id)
            wallet = Wallet.objects.get(user=user)
            return wallet
        except get_user_model().DoesNotExist:
            raise NotFound('User with this steam_id does not exist')
        except Wallet.DoesNotExist:
            raise NotFound('Wallet for this user does not exist')