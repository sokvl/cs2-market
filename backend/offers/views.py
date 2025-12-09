from rest_framework.decorators import APIView
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from api.serializers.Offer_serializer import OfferSerializer
from api.serializers.Item_serializer import ItemSerializer
from .models import Offer, Item
from .filters import OfferFilter
import django_filters
from django.contrib.auth import get_user_model


class OfferViewSet(viewsets.ModelViewSet):
    queryset = Offer.objects.filter(is_active=True)
    serializer_class = OfferSerializer
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)
    filterset_class = OfferFilter
    permission_classes = [IsAuthenticatedOrReadOnly]


class UserActiveOffersView(APIView):
    def get(self, request, *args, **kwargs):
        steam_id = request.query_params.get('steam_id')
        
        if not steam_id:
            return Response({'error': 'steam_id parameter is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = get_user_model().objects.get(steam_id=steam_id)
        except get_user_model().DoesNotExist:
            return Response({'error': 'User does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        active_offers = Offer.objects.filter(owner=user, is_active=True)
        serializer = OfferSerializer(active_offers, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)

#################
# Item section #
###############

class ItemDetailView(APIView):
    def get(self, request, item_id, format=None):
        try:
            item = Item.objects.get(item_id=item_id)
            serializer = ItemSerializer(item)
            return Response(serializer.data)
        except Item.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)