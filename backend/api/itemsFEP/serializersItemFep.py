from rest_framework import serializers # pyright: ignore[reportMissingImports]
from django.contrib.auth.models import User # pyright: ignore[reportMissingModuleSource]
from .models import ItemFep, ItemCategoryFep, ItemImageFep, ItemFavoriteFep # pyright: ignore[reportMissingImports]

class UserSerializerFep(serializers.ModelSerializer):
    class MetaFep:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = fields

class ItemCategorySerializerFep(serializers.ModelSerializer):
    full_path_fep = serializers.SerializerMethodField()
    
    class MetaFep:
        model = ItemCategoryFep
        fields = ['id', 'name_fep', 'slug_fep', 'description_fep', 'parent_fep', 'full_path_fep']
        read_only_fields = ['slug_fep', 'full_path_fep']
    
    def get_full_path_fep(self, obj_fep):
        return obj_fep.get_full_path_fep()

class ItemImageSerializerFep(serializers.ModelSerializer):
    class MetaFep:
        model = ItemImageFep
        fields = ['id', 'image_fep', 'alt_text_fep', 'is_primary_fep', 'order_fep']
        read_only_fields = ['id']

class ItemListSerializerFep(serializers.ModelSerializer):
    seller_fep = UserSerializerFep(read_only=True)
    category_fep = ItemCategorySerializerFep(read_only=True)
    primary_image_fep = serializers.SerializerMethodField()
    is_favorited_fep = serializers.SerializerMethodField()
    full_price_fep = serializers.SerializerMethodField()
    
    class MetaFep:
        model = ItemFep
        fields = [
            'id',
            'title_fep',
            'price_fep',
            'condition_fep',
            'status_fep',
            'quantity_fep',
            'location_fep',
            'views_fep',
            'favorites_fep',
            'is_negotiable_fep',
            'is_shippable_fep',
            'shipping_cost_fep',
            'created_at_fep',
            'seller_fep',
            'category_fep',
            'primary_image_fep',
            'is_favorited_fep',
            'full_price_fep'
        ]
        read_only_fields = fields
    
    def get_primary_image_fep(self, obj_fep):
        primary_image_fep = obj_fep.images_fep.filter(is_primary_fep=True).first()
        if primary_image_fep:
            return ItemImageSerializerFep(primary_image_fep).data
        return None
    
    def get_is_favorited_fep(self, obj_fep):
        request_fep = self.context.get('request')
        if request_fep and request_fep.user.is_authenticated:
            return obj_fep.favorited_by_fep.filter(user_fep=request_fep.user).exists()
        return False
    
    def get_full_price_fep(self, obj_fep):
        return obj_fep.get_full_price_fep()

class ItemDetailSerializerFep(ItemListSerializerFep):
    images_fep = ItemImageSerializerFep(many=True, read_only=True)
    description_fep = serializers.CharField()
    tags_fep = serializers.JSONField()
    metadata_fep = serializers.JSONField()
    
    class MetaFep(ItemListSerializerFep.MetaFep):
        fields = ItemListSerializerFep.MetaFep.fields + [
            'description_fep',
            'tags_fep',
            'metadata_fep',
            'images_fep',
            'published_at_fep',
            'expires_at_fep',
            'latitude_fep',
            'longitude_fep'
        ]
        read_only_fields = fields

class ItemCreateSerializerFep(serializers.ModelSerializer):
    images_fep = ItemImageSerializerFep(many=True, required=False)
    
    class MetaFep:
        model = ItemFep
        fields = [
            'title_fep',
            'description_fep',
            'category_fep',
            'price_fep',
            'condition_fep',
            'quantity_fep',
            'location_fep',
            'latitude_fep',
            'longitude_fep',
            'is_negotiable_fep',
            'is_shippable_fep',
            'shipping_cost_fep',
            'tags_fep',
            'metadata_fep',
            'images_fep'
        ]
    
    def create(self, validated_data_fep):
        images_data_fep = validated_data_fep.pop('images_fep', [])
        request_fep = self.context.get('request')
        
        item_fep = ItemFep.objects.create(
            seller_fep=request_fep.user,
            **validated_data_fep
        )
        
        for index_fep, image_data_fep in enumerate(images_data_fep):
            ItemImageFep.objects.create(
                item_fep=item_fep,
                order_fep=index_fep,
                is_primary_fep=(index_fep == 0),
                **image_data_fep
            )
        
        return item_fep

class ItemSellSerializerFep(serializers.ModelSerializer):
    class MetaFep:
        model = ItemFep
        fields = [
            'title_fep',
            'description_fep',
            'category_fep',
            'price_fep',
            'condition_fep',
            'quantity_fep',
            'location_fep',
            'is_negotiable_fep',
            'is_shippable_fep'
        ]
    
    def validate_price_fep(self, value_fep):
        if value_fep <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value_fep
    
    def validate_quantity_fep(self, value_fep):
        if value_fep <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value_fep

class ItemFavoriteSerializerFep(serializers.ModelSerializer):
    class MetaFep:
        model = ItemFavoriteFep
        fields = ['id', 'item_fep', 'created_at_fep']
        read_only_fields = ['id', 'created_at_fep']