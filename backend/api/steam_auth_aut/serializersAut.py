from rest_framework import serializers # pyright: ignore[reportMissingImports]
from django.contrib.auth import authenticate # pyright: ignore[reportMissingModuleSource]
from django.utils import timezone # pyright: ignore[reportMissingModuleSource]
from .models import CustomUserAut, SteamLoginSessionAut, RefreshTokenAut # pyright: ignore[reportMissingImports]

class UserSerializerAut(serializers.ModelSerializer):
    steam_profile_url_aut = serializers.URLField(read_only=True)
    steam_avatar_aut = serializers.URLField(read_only=True)
    
    class MetaAut:
        model = CustomUserAut
        fields = [
            'id_aut',
            'username_aut',
            'email_aut',
            'steam_id_aut',
            'steam_username_aut',
            'steam_profile_url_aut',
            'steam_avatar_aut',
            'steam_avatar_medium_aut',
            'steam_avatar_full_aut',
            'is_email_verified_aut',
            'profile_visibility_aut',
            'login_count_aut',
            'date_joined_aut',
            'last_login_aut'
        ]
        read_only_fields = [
            'id_aut',
            'date_joined_aut',
            'last_login_aut',
            'login_count_aut'
        ]

class SteamLoginSerializerAut(serializers.Serializer):
    openid_params_aut = serializers.DictField(required=True)
    
    def validate_aut(self, attrs_aut):
        openid_params_aut = attrs_aut.get('openid_params_aut', {})
        
        # Validate required OpenID parameters
        required_fields_aut = ['openid.claimed_id', 'openid.identity', 'openid.sig']
        for field_aut in required_fields_aut:
            if field_aut not in openid_params_aut:
                raise serializers.ValidationError(f"Missing OpenID parameter: {field_aut}")
        
        return attrs_aut

class JWTSerializerAut(serializers.Serializer):
    access_token_aut = serializers.CharField()
    refresh_token_aut = serializers.CharField()
    expires_in_aut = serializers.IntegerField()
    token_type_aut = serializers.CharField(default='Bearer')
    user_aut = UserSerializerAut(read_only=True)
    
    def create_aut(self, validated_data_aut):
        pass
    
    def update_aut(self, instance_aut, validated_data_aut):
        pass

class TokenRefreshSerializerAut(serializers.Serializer):
    refresh_token_aut = serializers.CharField(required=True)
    
    def validate_aut(self, attrs_aut):
        refresh_token_aut = attrs_aut.get('refresh_token_aut')
        
        try:
            from .authentication import SteamJWTAuthenticationAut # pyright: ignore[reportMissingImports]
            token_data_aut = SteamJWTAuthenticationAut.validate_refresh_token_aut(refresh_token_aut)
            attrs_aut['token_data_aut'] = token_data_aut
        except Exception as e_aut:
            raise serializers.ValidationError(f"Invalid refresh token: {str(e_aut)}")
        
        return attrs_aut

class LogoutSerializerAut(serializers.Serializer):
    refresh_token_aut = serializers.CharField(required=True)
    
    def validate_aut(self, attrs_aut):
        refresh_token_aut = attrs_aut.get('refresh_token_aut')
        
        try:
            from .authentication import SteamJWTAuthenticationAut # pyright: ignore[reportMissingImports]
            token_data_aut = SteamJWTAuthenticationAut.validate_refresh_token_aut(refresh_token_aut)
            attrs_aut['token_data_aut'] = token_data_aut
        except Exception:
            # Don't raise error on logout even if token is invalid
            pass
        
        return attrs_aut

class SteamCallbackSerializerAut(serializers.Serializer):
    code_aut = serializers.CharField(required=False)
    error_aut = serializers.CharField(required=False)
    state_aut = serializers.CharField(required=False)
    
    def validate_aut(self, attrs_aut):
        if attrs_aut.get('error_aut'):
            raise serializers.ValidationError(f"Steam authentication error: {attrs_aut['error_aut']}")
        
        if not attrs_aut.get('code_aut'):
            raise serializers.ValidationError("Missing authorization code")
        
        return attrs_aut

class UserProfileUpdateSerializerAut(serializers.ModelSerializer):
    class MetaAut:
        model = CustomUserAut
        fields = [
            'username_aut',
            'email_aut',
            'profile_visibility_aut',
            'timezone_aut'
        ]
    
    def validate_username_aut(self, value_aut):
        if CustomUserAut.objects.filter(username_aut=value_aut).exclude(id_aut=self.instance.id_aut).exists():
            raise serializers.ValidationError("Username already exists")
        return value_aut
    
    def validate_email_aut(self, value_aut):
        if CustomUserAut.objects.filter(email_aut=value_aut).exclude(id_aut=self.instance.id_aut).exists():
            raise serializers.ValidationError("Email already exists")
        return value_aut

class SteamAPITokenSerializerAut(serializers.ModelSerializer):
    class MetaAut:
        model = SteamAPITokenAut # pyright: ignore[reportUndefinedVariable]
        fields = ['id_aut', 'token_aut', 'is_active_aut', 'created_at_aut', 'last_used_at_aut', 'usage_count_aut']
        read_only_fields = ['id_aut', 'created_at_aut', 'last_used_at_aut', 'usage_count_aut']

class LoginHistorySerializerAut(serializers.ModelSerializer):
    class MetaAut:
        model = UserLoginHistoryAut # pyright: ignore[reportUndefinedVariable]
        fields = [
            'id_aut',
            'login_method_aut',
            'ip_address_aut',
            'user_agent_aut',
            'location_aut',
            'success_aut',
            'created_at_aut'
        ]
        read_only_fields = fields