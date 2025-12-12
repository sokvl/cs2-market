from rest_framework import serializers

from offers.models import Item

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = '__all__'
    def create(self, validated_data):
        item = Item.objects.create(**validated_data)
        return item
