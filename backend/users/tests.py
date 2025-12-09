from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.test import APIClient
from django.urls import reverse
from .models import Wallet
from .serializers import UserCreateUpdateSerializer, WalletSerializer

User = get_user_model()


class UserViewSetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', steam_id='12345443')
        self.admin_user = User.objects.create_superuser(username='admin', steam_id='admin123')

    def test_user_create(self):
        url = reverse('user-list')
        data = {
            'username': 'newuser',
            'steam_id': '678904234',
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 3)

    def test_user_update(self):
        url = reverse('user-detail', args=[self.user.steam_id])
        data = {
            'username': 'updateduser',
            'steam_id': '12345'
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, 'updateduser')

    def test_user_delete(self):
        url = reverse('user-detail', args=[self.user.steam_id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(User.objects.count(), 1)

class WalletDetailViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', steam_id='12345999')
        self.wallet = Wallet.objects.update(user_id=self.user.user_id, balance=100.00)
        self.client = APIClient()

    def test_get_wallet_detail(self):
        url = reverse('wallet-detail', args=[self.user.steam_id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['balance'], '100.00')


class UserModelTests(TestCase):
    def test_create_user(self):
        user = User.objects.create_user(username='testuser', steam_id='12345')
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.steam_id, '12345')


class UserCreateUpdateSerializerTests(APITestCase):
    def test_valid_data(self):
        data = {
            'username': 'testuser',
            'steam_id': '12345',
        }
        serializer = UserCreateUpdateSerializer(data=data)
        self.assertTrue(serializer.is_valid())

    def test_invalid_data(self):
        user = User.objects.create_user(username='testuser', steam_id='12345')
        data = {
            'username': 'anotheruser',
            'steam_id': '12345'
        }
        serializer = UserCreateUpdateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('steam_id', serializer.errors)