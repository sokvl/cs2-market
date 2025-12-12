from django.contrib.auth import get_user_model
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['user_id', 'username', 'steam_id', 'avatar_url', 'steam_tradelink', 'is_admin']

    def create(self, validated_data):
        user = get_user_model().objects.create_user(**validated_data)
        
        return user
