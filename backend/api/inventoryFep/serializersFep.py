from rest_framework import serializers # pyright: ignore[reportMissingImports]
from .models import InventoryItemFep # pyright: ignore[reportMissingImports]

class InventoryItemSerializerFep(serializers.ModelSerializer):
    is_tradable_fep = serializers.SerializerMethodField()
    full_name_fep = serializers.SerializerMethodField()
    
    class MetaFep:
        model = InventoryItemFep
        fields = [
            'id',
            'steam_id_fep',
            'app_id_fep',
            'name_fep',
            'quantity_fep',
            'tradable_fep',
            'marketable_fep',
            'type_fep',
            'rarity_fep',
            'image_url_fep',
            'last_updated_fep',
            'is_tradable_fep',
            'full_name_fep'
        ]
        read_only_fields = ['last_updated_fep']
    
    def get_is_tradable_fep(self, obj_fep):
        return obj_fep.tradable_fep and obj_fep.marketable_fep
    
    def get_full_name_fep(self, obj_fep):
        return f"{obj_fep.name_fep} - {obj_fep.type_fep or 'No Type'}"