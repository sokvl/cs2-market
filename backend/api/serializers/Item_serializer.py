from rest_framework import serializers

from offers.models import Item

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = '__all__'
    
    def create(self, validated_data):
        print("[ItemSerializer.create] validated_data:", validated_data)
        item = Item.objects.create(**validated_data)
        return item
    
    def is_valid(self, raise_exception=False):
        print("[ItemSerializer.is_valid] Initial data:", self.initial_data)
        result = super().is_valid(raise_exception=raise_exception)
        if not result:
            print("[ItemSerializer.is_valid] Errors:", self.errors)
        return result
