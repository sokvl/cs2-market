from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from .models import Offer, Item
from api.serializers.Offer_serializer import OfferSerializer
from api.serializers.Item_serializer import ItemSerializer
from rest_framework.test import APITestCase, APIClient

User = get_user_model()

class OfferSerializerTest(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username='test_user', password='test_password', steam_id='12345')
        self.offer_data = {
            'steam_id': self.user.steam_id,
            'is_active': True,
            'item': {
                'item_name': 'Test Item',
                'img_link': 'http://example.com/test.jpg',
                'condition': 'mw',
                'inspect': 'http://example.com/inspect44',
                'rarity': 'Common',
                'category': 'Test',
            },
            'price': 10.5,
            'quantity': 1
        }

    def test_offer_serializer_valid(self):
        serializer = OfferSerializer(data=self.offer_data)
        self.assertTrue(serializer.is_valid())

    def test_offer_serializer_invalid(self):
        invalid_data = self.offer_data.copy()
        invalid_data['steam_id'] = None
        serializer = OfferSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())

class ItemSerializerTest(TestCase):
    def setUp(self):
        self.item_data = {
            'item_name': 'Test Item',
            'img_link': 'http://example.com/test.jpg',
            'condition': 'mw',
            'stickerstring': None,
            'inspect': 'http://example.com/inspect',
            'rarity': 'Common',
            'category': 'Test',
        }

    def test_item_serializer_valid(self):
        serializer = ItemSerializer(data=self.item_data)
        self.assertTrue(serializer.is_valid())

    def test_item_serializer_invalid(self):
        invalid_data = self.item_data.copy()
        invalid_data['item_name'] = ''
        serializer = ItemSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())

class OfferViewsTest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='test_user', password='test_password', steam_id='123456')
        self.client.force_authenticate(user=self.user)
        self.item = Item.objects.create(
            item_name='Test Item',
            img_link='http://example.com/test.jpg',
            condition='N',
            inspect='http://example.com/inspect',
            rarity='Common',
            category='Test',
            listed=False,
            tradeable=True
        )

    def test_create_offer(self):
        url = reverse('offer-list')
        data = {
            'steam_id': self.user.steam_id,
            'is_active': True,
            'item': {
                'item_name': 'Test Item',
                'img_link': 'http://example.com/test.jpg',
                'condition': 'N',
                'inspect': 'http://example.com/inspect22',
                'rarity': 'Common',
                'category': 'Test',
                'listed': False,
                'tradeable': True
            },
            'price': 10.5,
            'quantity': 1
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


    def test_get_offer(self):
        offer = Offer.objects.create(
            owner=self.user,
            creation_date=timezone.now(),
            is_active=True,
            item=self.item,
            price=10.5,
            quantity=1
        )
        url = reverse('offer-detail', kwargs={'pk': offer.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['price'], 10.5)

    def test_update_offer(self):
        offer = Offer.objects.create(
            owner=self.user,
            creation_date=timezone.now(),
            is_active=True,
            item=self.item,
            price=10.5,
            quantity=1
        )
        url = reverse('offer-detail', kwargs={'pk': offer.pk})
        data = {
            'price': 15.0,
            'quantity': 2
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        offer.refresh_from_db()
        self.assertEqual(offer.price, 15.0)
        self.assertEqual(offer.quantity, 2)

    def test_delete_offer(self):
        offer = Offer.objects.create(
            owner=self.user,
            creation_date=timezone.now(),
            is_active=True,
            item=self.item,
            price=10.5,
            quantity=1
        )
        url = reverse('offer-detail', kwargs={'pk': offer.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Offer.objects.filter(pk=offer.pk).exists())