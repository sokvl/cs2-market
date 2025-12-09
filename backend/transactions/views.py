from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
import django_filters
from rest_framework.response import Response
from rest_framework.decorators import action
from api.signals import payment_successful
from users.models import Wallet

from .models import Transaction, Rating, Notification
from .serializers import TransactionSerializer, RatingSerializer, NotificationSerializer
from offers.models import Offer
    
class TransatctionDummy:
    pass

class TransactionViewSet(viewsets.ModelViewSet):
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]


    def create(self, request, *args, **kwargs):
        buyer_sid = request.data.get('buyer')
        if buyer_sid:
            try:
                user = get_user_model().objects.get(steam_id=buyer_sid)
                request.data['buyer'] = user.user_id
            except get_user_model().DoesNotExist:
                return Response({'error': 'User with this public_id does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if user.steam_tradelink is None:
            return Response({'error': 'Provide steam trade link first!'}, status=status.HTTP_400_BAD_REQUEST)

        user_wallet = Wallet.objects.get(user_id=user.user_id)
        if user_wallet.balance < Offer.objects.get(offer_id=request.data['offer']).price:
            return Response({'error': 'Insufficient funds.'}, status=status.HTTP_400_BAD_REQUEST)


        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def close_offer(self, request, pk=None):
        transaction = self.get_object()
        transaction.is_closed = True
        transaction.save()
        return Response({'status': 'offer closed'}, status=status.HTTP_200_OK)


class UserTransactionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        steam_id = request.query_params.get('steam_id', None)
        if not steam_id:
            return Response({'error': 'steam_id parameter is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = get_user_model().objects.get(steam_id=steam_id)
        except get_user_model().DoesNotExist:
            return Response({'error': 'User does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        to_send_transactions = Transaction.objects.filter(is_closed=False, offer__owner=user)
        waiting_to_get_transactions = Transaction.objects.filter(is_closed=False, buyer=user)

        to_send_serializer = TransactionSerializer(to_send_transactions, many=True)
        waiting_to_get_serializer = TransactionSerializer(waiting_to_get_transactions, many=True)

        to_send_data = []
        waiting_to_get_data = []

        for transaction in to_send_transactions:
            to_send_data.append({
                'transaction_id': transaction.transaction_id,
                'buyer_username': transaction.buyer.username if transaction.buyer else None,
                'buyer_tradelink': transaction.buyer.steam_tradelink if transaction.buyer else None,
                'item_name': transaction.offer.item.item_name if transaction.offer.item else None,
                'inspect_link': transaction.offer.item.inspect.split("steam:")[1] if transaction.offer.item and "steam:" in transaction.offer.item.inspect else None,
                'item_image': transaction.offer.item.img_link if transaction.offer.item else None
            })

        for transaction in waiting_to_get_transactions:
            waiting_to_get_data.append({
                'transaction_id': transaction.transaction_id,
                'owner_username': transaction.offer.owner.username if transaction.offer.owner else None,
                'item_name': transaction.offer.item.item_name if transaction.offer.item else None,
                'inspect_link': transaction.offer.item.inspect.split("steam:")[1] if transaction.offer.item and "steam:" in transaction.offer.item.inspect else None,
                'item_image': transaction.offer.item.img_link if transaction.offer.item else None
            })  

        response_data = {
            'to_send': to_send_data,
            'waiting_to_get': waiting_to_get_data
        }

        return Response(response_data, status=status.HTTP_200_OK)
    

class RatingViewSet(viewsets.ModelViewSet):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    permission_classes = [IsAuthenticated]

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Notification.objects.filter(transaction__offer__owner=user, active=True)
        return queryset