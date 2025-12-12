from rest_framework import serializers
from .Item_serializer import ItemSerializer
from .User_serializer import UserSerializer
from offers.models import Offer, Item
from django.contrib.auth import get_user_model
from users.models import User
###
#   TEMPORARY FIX: REMOVED created_at field because it caused an error when crating offer
##
class OfferSerializer(serializers.ModelSerializer):
    steam_id = serializers.IntegerField(write_only=True)
    item = ItemSerializer()
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Offer
        fields = ['offer_id', 'steam_id','is_active', 'item', 'price', 'quantity', 'owner']

    def is_valid(self, raise_exception=False):
        print("[OfferSerializer.is_valid] Initial data:", self.initial_data)
        result = super().is_valid(raise_exception=raise_exception)
        if not result:
            print("[OfferSerializer.is_valid] Errors:", self.errors)
        return result

    """
    You have to send smthng like this as json body:
        data: {
            just:
            offer:
            data: 
            item : {
                some:
                item:
                data:
            },
            owner: {
                some:
                owner:
                data:
            }
        }
    """

    def create(self, validated_data):
        print("[OfferSerializer.create] Full validated_data:", validated_data)
        
        steam_id = validated_data.pop('steam_id')
        try:
            ownerr = User.objects.get(steam_id=steam_id)  # Znajdź użytkownika po steam_id
        except get_user_model().DoesNotExist:
            raise serializers.ValidationError("User with given steam ID does not exist")
        
        item_data = validated_data.pop('item')
        print("[OfferSerializer.create] item_data:", item_data)
        inspect_link = item_data.get('inspect')
        print("[OfferSerializer.create] inspect_link:", inspect_link)
        
        # Spróbuj znaleźć istniejący item po unikalnym inspect
        item = Item.objects.filter(inspect=inspect_link).first()
        
        if item:
            # Sprawdź czy istnieje aktywna oferta dla tego itemu
            existing_offer = Offer.objects.filter(item=item, is_active=True).first()
            if existing_offer:
                raise serializers.ValidationError("This item is already listed on the market.")
        else:
            # Jeśli itemu nie ma, stwórz nowy
            print("[OfferSerializer.create] Creating new Item with data:", item_data)
            item = Item.objects.create(**item_data)
        
        # Utwórz nową ofertę
        print("[OfferSerializer.create] Creating Offer with owner_id:", ownerr.user_id, "and validated_data:", validated_data)
        offer = Offer.objects.create(owner_id=ownerr.user_id, item=item, **validated_data)
        return offer
