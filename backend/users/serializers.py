from django.contrib.auth import get_user_model
from .models import Wallet
from rest_framework import serializers
from django.contrib.auth.hashers import make_password

User = get_user_model()

class UserCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['user_id', 'username', 'steam_id', 'avatar_url', 'steam_tradelink', 'is_admin', 'password']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'steam_tradelink': {'required': False},
        }

    def validate_steam_id(self, value):
        if User.objects.filter(steam_id=value).exclude(user_id=self.instance.user_id if self.instance else None).exists():
            raise serializers.ValidationError("This steam_id is already in use.")
        return value
    
class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ['wallet_id', 'user', 'balance']