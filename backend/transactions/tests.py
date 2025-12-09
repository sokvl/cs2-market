from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from .models import Transaction, Rating, Notification
from offers.models import  Offer, Item
from .serializers import TransactionSerializer, RatingSerializer, NotificationSerializer
from django.utils import timezone

User = get_user_model()
from rest_framework_simplejwt.tokens import RefreshToken


class JWTTestMixin:
    def get_jwt_token_for_user(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }

class TransactionTests(APITestCase, JWTTestMixin):
    def setUp(self):
        self.buyer = User.objects.create_user(username='buyer', steam_id='buyer123')
        self.seller = User.objects.create_user(username='seller', steam_id='seller123')
        self.item = Item.objects.create(item_name='Test Item', inspect='steam:12345', img_link='http://example.com/img.jpg')
        self.offer = Offer.objects.create(owner=self.seller, item=self.item, price=100.00)
        #Transactions update test
        self.buyer_2 = User.objects.create_user(username='test_buyer', steam_id='test_buyer123')
        self.seller_2 = User.objects.create_user(username='test_seller', steam_id='test_seller123')
        self.item_2 = Item.objects.create(item_name='Test Item 2', inspect='steam:123456', img_link='http://example.com/img.jpg')
        self.offer_2 = Offer.objects.create(owner=self.seller_2, item=self.item_2, price=100.00)
        self.transaction = Transaction.objects.create(offer=self.offer_2, buyer=self.buyer_2)
        #Auth
        token = self.get_jwt_token_for_user(self.buyer)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token['access'])

    def test_transaction_create(self):
        url = reverse('transaction-list')
        data = {
            'offer': self.offer.offer_id,
            'buyer': self.buyer.steam_id,
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Transaction.objects.count(), 2)  
    
    def test_transaction_create_invalid(self):
        url = reverse('transaction-list')
        data = {
            'offer': self.offer.offer_id,
            'buyer': self.buyer.username,
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Transaction.objects.count(), 1)  

    def test_transaction_update(self):
        url = reverse('transaction-detail', args=[self.transaction.transaction_id])
        data = {
            'is_closed': True,
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.transaction.refresh_from_db()
        self.assertTrue(self.transaction.is_closed)

    def test_transaction_delete(self):
        url = reverse('transaction-detail', args=[self.transaction.transaction_id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Transaction.objects.count(), 0)


class RatingTests(APITestCase, JWTTestMixin):
    def setUp(self):
        self.buyer = User.objects.create_user(username='buyer', steam_id='buyer123')
        self.seller = User.objects.create_user(username='seller', steam_id='seller123')
        self.item = Item.objects.create(item_name='Test Item', inspect='steam:12345', img_link='http://example.com/img.jpg')
        self.offer = Offer.objects.create(owner=self.seller, item=self.item, price=100.00)
        self.transaction = Transaction.objects.create(offer=self.offer, buyer=self.buyer)
        #2nd transaction
        self.buyer_2 = User.objects.create_user(username='test_buyer', steam_id='test_buyer123')
        self.seller_2 = User.objects.create_user(username='test_seller', steam_id='test_seller123')
        self.item_2 = Item.objects.create(item_name='Test Item 2', inspect='steam:123456', img_link='http://example.com/img.jpg')
        self.offer_2 = Offer.objects.create(owner=self.seller_2, item=self.item_2, price=100.00)
        self.transaction_2 = Transaction.objects.create(offer=self.offer_2, buyer=self.buyer_2)
        self.rating = Rating.objects.create(transaction=self.transaction_2, stars=5)
        token = self.get_jwt_token_for_user(self.buyer)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token['access'])

    def test_rating_create(self):
        url = reverse('rating-list')
        data = {
            'transaction': self.transaction.transaction_id,
            'stars': 4,
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Rating.objects.count(), 2)  

    def test_rating_create_invalid(self):
        url = reverse('rating-list')
        data = {
            'transaction': self.transaction.transaction_id,
            'stars': 10,
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Rating.objects.count(), 1) 

    def test_rating_update(self):
        url = reverse('rating-detail', args=[self.rating.rating_id])
        data = {
            'stars': 3,
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.rating.refresh_from_db()
        self.assertEqual(self.rating.stars, 3)

    def test_rating_delete(self):
        url = reverse('rating-detail', args=[self.rating.rating_id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Rating.objects.count(), 0)

class NotificationTests(APITestCase, JWTTestMixin):
    def setUp(self):
        self.buyer = User.objects.create_user(username='buyer', steam_id='buyer123')
        self.seller = User.objects.create_user(username='seller', steam_id='seller123')
        self.item = Item.objects.create(item_name='Test Item', inspect='steam:12345', img_link='http://example.com/img.jpg')
        self.offer = Offer.objects.create(owner=self.seller, item=self.item, price=100.00)
        self.transaction = Transaction.objects.create(offer=self.offer, buyer=self.buyer)
        Notification.objects.update(transaction=self.transaction, message='Test Notification', active=True)
        self.notification = Notification.objects.get(transaction=self.transaction)
        token = self.get_jwt_token_for_user(self.buyer)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token['access'])

    def test_get_notifications(self):
        self.client.force_authenticate(user=self.seller)
        url = reverse('notifications-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['message'], 'Test Notification')

