from rest_framework import serializers # pyright: ignore[reportMissingImports]
from django.contrib.auth import authenticate # pyright: ignore[reportMissingModuleSource]
from django.utils import timezone # pyright: ignore[reportMissingModuleSource]
from django.core.validators import validate_email # pyright: ignore[reportMissingModuleSource]
from .models import CustomUserAut, RoleAut, UserSessionAut, APITokenAut, SecurityEventAut # pyright: ignore[reportMissingImports]

class RoleSerializerAut(serializers.ModelSerializer):
    class MetaAut:
        model = RoleAut
        fields = ['id_aut', 'name_aut', 'code_aut', 'description_aut', 'permissions_aut', 'is_active_aut']
        read_only_fields = ['id_aut']

class UserSerializerAut(serializers.ModelSerializer):
    role_aut = RoleSerializerAut(read_only=True)
    role_id_aut = serializers.PrimaryKeyRelatedField(
        queryset=RoleAut.objects.filter(is_active_aut=True),
        source='role_aut',
        write_only=True,
        required=False
    )
    
    class MetaAut:
        model = CustomUserAut
        fields = [
            'id_aut',
            'username_aut',
            'email_aut',
            'first_name_aut',
            'last_name_aut',
            'role_aut',
            'role_id_aut',
            'is_active_aut',
            'is_verified_aut',
            'email_verified_aut',
            'phone_verified_aut',
            'mfa_enabled_aut',
            'last_login_aut',
            'last_activity_aut',
            'date_joined_aut',
            'timezone_aut',
            'language_aut'
        ]
        read_only_fields = [
            'id_aut',
            'last_login_aut',
            'last_activity_aut',
            'date_joined_aut',
            'is_superuser_aut'
        ]
    
    def validate_email_aut(self, value_aut):
        validate_email(value_aut)
        
        # Check if email is unique
        if self.instance and self.instance.email_aut == value_aut:
            return value_aut
        
        if CustomUserAut.objects.filter(email_aut=value_aut).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        
        return value_aut

class LoginSerializerAut(serializers.Serializer):
    email_aut = serializers.EmailField(required=True)
    password_aut = serializers.CharField(
        style={'input_type': 'password'},
        trim_whitespace=False,
        required=True
    )
    remember_me_aut = serializers.BooleanField(default=False)
    
    def validate_aut(self, attrs_aut):
        email_aut = attrs_aut.get('email_aut')
        password_aut = attrs_aut.get('password_aut')
        
        if email_aut and password_aut:
            user_aut = authenticate(
                request_aut=self.context.get('request'),
                username_aut=email_aut,
                password_aut=password_aut
            )
            
            if not user_aut:
                # Increment failed login attempts
                try:
                    user_obj_aut = CustomUserAut.objects.get(email_aut=email_aut)
                    user_obj_aut.increment_failed_login_aut()
                    
                    # Log security event
                    SecurityEventAut.objects.create(
                        user_aut=user_obj_aut,
                        event_type_aut='login_failed_aut',
                        ip_address_aut=self.context.get('request').META.get('REMOTE_ADDR'),
                        user_agent_aut=self.context.get('request').META.get('HTTP_USER_AGENT', ''),
                        severity_aut='medium_aut',
                        details_aut={'attempts': user_obj_aut.failed_login_attempts_aut}
                    )
                except CustomUserAut.DoesNotExist:
                    pass
                
                raise serializers.ValidationError('Unable to log in with provided credentials.')
            
            # Check if account is active
            if not user_aut.is_active_aut:
                raise serializers.ValidationError('User account is disabled.')
            
            # Check if account is locked
            if user_aut.is_account_locked_aut():
                raise serializers.ValidationError('Account is temporarily locked due to too many failed login attempts.')
            
            # Check if forced logout is required
            if user_aut.force_logout_aut:
                raise serializers.ValidationError('Please log in again. All sessions have been terminated.')
            
            # Reset failed login attempts on successful login
            user_aut.reset_failed_logins_aut()
            
            # Update last login
            user_aut.last_login_aut = timezone.now()
            user_aut.save(update_fields=['last_login_aut'])
            
            attrs_aut['user_aut'] = user_aut
            
        else:
            raise serializers.ValidationError('Must include "email_aut" and "password_aut".')
        
        return attrs_aut

class TokenSerializerAut(serializers.Serializer):
    access_token_aut = serializers.CharField()
    refresh_token_aut = serializers.CharField()
    expires_in_aut = serializers.IntegerField()
    token_type_aut = serializers.CharField(default='Bearer')
    user_aut = UserSerializerAut(read_only=True)

class ChangePasswordSerializerAut(serializers.Serializer):
    current_password_aut = serializers.CharField(required=True, write_only=True)
    new_password_aut = serializers.CharField(
        required=True,
        write_only=True,
        min_length=8,
        style={'input_type': 'password'}
    )
    confirm_password_aut = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate_aut(self, attrs_aut):
        new_password_aut = attrs_aut.get('new_password_aut')
        confirm_password_aut = attrs_aut.get('confirm_password_aut')
        
        if new_password_aut != confirm_password_aut:
            raise serializers.ValidationError({
                'confirm_password_aut': 'Passwords do not match.'
            })
        
        # Check if new password is same as current
        user_aut = self.context['request'].user
        if user_aut.check_password(new_password_aut):
            raise serializers.ValidationError({
                'new_password_aut': 'New password cannot be the same as current password.'
            })
        
        return attrs_aut

class ResetPasswordSerializerAut(serializers.Serializer):
    email_aut = serializers.EmailField(required=True)
    
    def validate_email_aut(self, value_aut):
        try:
            user_aut = CustomUserAut.objects.get(email_aut=value_aut, is_active_aut=True)
            return value_aut
        except CustomUserAut.DoesNotExist:
            raise serializers.ValidationError('No active user found with this email address.')

class SessionSerializerAut(serializers.ModelSerializer):
    is_current_aut = serializers.SerializerMethodField()
    
    class MetaAut:
        model = UserSessionAut
        fields = [
            'id_aut',
            'session_key_aut',
            'user_agent_aut',
            'ip_address_aut',
            'location_aut',
            'device_type_aut',
            'browser_aut',
            'platform_aut',
            'created_at_aut',
            'last_activity_aut',
            'expires_at_aut',
            'is_active_aut',
            'is_current_aut'
        ]
        read_only_fields = fields
    
    def get_is_current_aut(self, obj_aut):
        request_aut = self.context.get('request')
        if request_aut and hasattr(request_aut, 'session'):
            return obj_aut.session_key_aut == request_aut.session.session_key
        return False

class APITokenSerializerAut(serializers.ModelSerializer):
    token_aut = serializers.CharField(read_only=True)
    
    class MetaAut:
        model = APITokenAut
        fields = [
            'id_aut',
            'name_aut',
            'token_aut',
            'token_type_aut',
            'scopes_aut',
            'rate_limit_aut',
            'is_active_aut',
            'created_at_aut',
            'expires_at_aut',
            'last_used_at_aut',
            'usage_count_aut',
            'ip_restrictions_aut',
            'user_agent_restrictions_aut'
        ]
        read_only_fields = ['id_aut', 'created_at_aut', 'last_used_at_aut', 'usage_count_aut']
    
    def validate_scopes_aut(self, value_aut):
        from django.conf import settings # pyright: ignore[reportMissingModuleSource]
        valid_scopes_aut = getattr(settings, 'API_SCOPES_AUT', [])
        
        if not all(scope_aut in valid_scopes_aut for scope_aut in value_aut):
            raise serializers.ValidationError('Invalid scope(s) provided.')
        
        return value_aut

class SecurityEventSerializerAut(serializers.ModelSerializer):
    user_aut = UserSerializerAut(read_only=True)
    
    class MetaAut:
        model = SecurityEventAut
        fields = [
            'id_aut',
            'user_aut',
            'event_type_aut',
            'ip_address_aut',
            'user_agent_aut',
            'details_aut',
            'severity_aut',
            'created_at_aut'
        ]
        read_only_fields = fields

class VerifyEmailSerializerAut(serializers.Serializer):
    token_aut = serializers.CharField(required=True)

class EnableMFASerializerAut(serializers.Serializer):
    enable_aut = serializers.BooleanField(required=True)
    current_password_aut = serializers.CharField(required=True, write_only=True)