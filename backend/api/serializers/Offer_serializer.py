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
        steam_id = validated_data.pop('steam_id')
        try:
            ownerr = User.objects.get(steam_id=steam_id)  # Znajdź użytkownika po steam_id
        except get_user_model().DoesNotExist:
            raise get_user_model().ValidationError("User with given steam ID does not exist")
        item_data = validated_data.pop('item')
        item = Item.objects.create(**item_data)
        offer = Offer.objects.create(owner_id=ownerr.user_id,item=item, **validated_data)
        return offer
