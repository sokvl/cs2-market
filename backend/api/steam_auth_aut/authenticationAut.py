import jwt # pyright: ignore[reportMissingImports]
from datetime import datetime, timedelta
from django.conf import settings # pyright: ignore[reportMissingModuleSource]
from django.core.cache import cache # pyright: ignore[reportMissingModuleSource]
from django.utils import timezone # pyright: ignore[reportMissingModuleSource]
from rest_framework import authentication # pyright: ignore[reportMissingImports]
from rest_framework.exceptions import AuthenticationFailed # pyright: ignore[reportMissingImports]
from .models import CustomUserAut, RefreshTokenAut # pyright: ignore[reportMissingImports]
import uuid

class SteamJWTAuthenticationAut(authentication.BaseAuthentication):
    def authenticate_aut(self, request_aut):
        auth_header_aut = request_aut.headers.get('Authorization')
        
        if not auth_header_aut:
            return None
        
        try:
            scheme_aut, token_aut = auth_header_aut.split()
            if scheme_aut.lower() != 'bearer':
                return None
        except ValueError:
            return None
        
        # Validate access token
        try:
            payload_aut = self.decode_token_aut(token_aut)
            user_id_aut = payload_aut.get('user_id_aut')
            jti_aut = payload_aut.get('jti_aut')
            
            if not user_id_aut or not jti_aut:
                raise AuthenticationFailed('Invalid token payload')
            
            # Check token blacklist
            if self.is_token_blacklisted_aut(jti_aut):
                raise AuthenticationFailed('Token has been revoked')
            
            user_aut = CustomUserAut.objects.get(id_aut=user_id_aut)
            
            # Check if user is active
            if not user_aut.is_active_aut:
                raise AuthenticationFailed('User account is disabled')
            
            return (user_aut, token_aut)
            
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')
        except CustomUserAut.DoesNotExist:
            raise AuthenticationFailed('User not found')
    
    @staticmethod
    def decode_token_aut(token_aut):
        return jwt.decode(
            token_aut,
            settings.SECRET_KEY,
            algorithms=['HS256']
        )
    
    @staticmethod
    def generate_tokens_aut(user_aut, request_aut=None):
        # Generate JTI for token identification
        jti_access_aut = str(uuid.uuid4())
        jti_refresh_aut = str(uuid.uuid4())
        
        # Access token payload
        access_payload_aut = {
            'user_id_aut': user_aut.id_aut,
            'username_aut': user_aut.username_aut,
            'steam_id_aut': user_aut.steam_id_aut,
            'jti_aut': jti_access_aut,
            'exp': datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_LIFETIME_AUT),
            'iat': datetime.utcnow(),
            'type_aut': 'access'
        }
        
        # Refresh token payload
        refresh_payload_aut = {
            'user_id_aut': user_aut.id_aut,
            'jti_aut': jti_refresh_aut,
            'exp': datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_TOKEN_LIFETIME_AUT),
            'iat': datetime.utcnow(),
            'type_aut': 'refresh'
        }
        
        # Generate tokens
        access_token_aut = jwt.encode(
            access_payload_aut,
            settings.SECRET_KEY,
            algorithm='HS256'
        )
        
        refresh_token_aut = jwt.encode(
            refresh_payload_aut,
            settings.SECRET_KEY,
            algorithm='HS256'
        )
        
        # Store refresh token in database
        ip_address_aut = request_aut.META.get('REMOTE_ADDR') if request_aut else None
        user_agent_aut = request_aut.META.get('HTTP_USER_AGENT') if request_aut else None
        
        RefreshTokenAut.objects.create(
            user_aut=user_aut,
            token_aut=refresh_token_aut,
            jti_aut=jti_refresh_aut,
            expires_at_aut=timezone.now() + timedelta(days=settings.JWT_REFRESH_TOKEN_LIFETIME_AUT),
            ip_address_aut=ip_address_aut,
            user_agent_aut=user_agent_aut
        )
        
        return {
            'access_token_aut': access_token_aut,
            'refresh_token_aut': refresh_token_aut,
            'expires_in_aut': settings.JWT_ACCESS_TOKEN_LIFETIME_AUT * 60,  # in seconds
            'token_type_aut': 'Bearer',
            'user_aut': user_aut
        }
    
    @staticmethod
    def refresh_access_token_aut(refresh_token_aut):
        try:
            # Validate refresh token
            token_data_aut = SteamJWTAuthenticationAut.validate_refresh_token_aut(refresh_token_aut)
            
            # Get user
            user_aut = CustomUserAut.objects.get(id_aut=token_data_aut['user_id_aut'])
            
            # Generate new access token with new JTI
            jti_access_aut = str(uuid.uuid4())
            access_payload_aut = {
                'user_id_aut': user_aut.id_aut,
                'username_aut': user_aut.username_aut,
                'steam_id_aut': user_aut.steam_id_aut,
                'jti_aut': jti_access_aut,
                'exp': datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_LIFETIME_AUT),
                'iat': datetime.utcnow(),
                'type_aut': 'access'
            }
            
            access_token_aut = jwt.encode(
                access_payload_aut,
                settings.SECRET_KEY,
                algorithm='HS256'
            )
            
            return {
                'access_token_aut': access_token_aut,
                'expires_in_aut': settings.JWT_ACCESS_TOKEN_LIFETIME_AUT * 60,
                'token_type_aut': 'Bearer'
            }
            
        except Exception as e_aut:
            raise AuthenticationFailed(f'Token refresh failed: {str(e_aut)}')
    
    @staticmethod
    def validate_refresh_token_aut(refresh_token_aut):
        try:
            # Decode token
            payload_aut = jwt.decode(
                refresh_token_aut,
                settings.SECRET_KEY,
                algorithms=['HS256']
            )
            
            if payload_aut.get('type_aut') != 'refresh':
                raise AuthenticationFailed('Not a refresh token')
            
            # Check if token exists in database and is valid
            try:
                refresh_token_obj_aut = RefreshTokenAut.objects.get(
                    token_aut=refresh_token_aut,
                    jti_aut=payload_aut['jti_aut']
                )
                
                if not refresh_token_obj_aut.is_valid_aut():
                    raise AuthenticationFailed('Refresh token is invalid or revoked')
                
            except RefreshTokenAut.DoesNotExist:
                raise AuthenticationFailed('Refresh token not found')
            
            return payload_aut
            
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Refresh token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid refresh token')
    
    @staticmethod
    def revoke_token_aut(jti_aut):
        try:
            refresh_token_aut = RefreshTokenAut.objects.get(jti_aut=jti_aut)
            refresh_token_aut.is_revoked_aut = True
            refresh_token_aut.save()
            
            # Add to blacklist cache for immediate effect
            cache_key_aut = f"token_blacklist_{jti_aut}"
            cache.set(cache_key_aut, True, timeout=settings.JWT_ACCESS_TOKEN_LIFETIME_AUT * 60)
            
            return True
        except RefreshTokenAut.DoesNotExist:
            return False
    
    @staticmethod
    def is_token_blacklisted_aut(jti_aut):
        cache_key_aut = f"token_blacklist_{jti_aut}"
        return cache.get(cache_key_aut) is not None
    
    @staticmethod
    def logout_user_aut(refresh_token_aut):
        try:
            token_data_aut = SteamJWTAuthenticationAut.validate_refresh_token_aut(refresh_token_aut)
            SteamJWTAuthenticationAut.revoke_token_aut(token_data_aut['jti_aut'])
            return True
        except Exception:
            return False

class SteamOpenIDAuthenticationAut:
    STEAM_OPENID_URL_AUT = "https://steamcommunity.com/openid/login"
    
    @staticmethod
    def get_login_url_aut(redirect_url_aut):
        import urllib.parse
        params_aut = {
            'openid.ns': 'http://specs.openid.net/auth/2.0',
            'openid.mode': 'checkid_setup',
            'openid.return_to': redirect_url_aut,
            'openid.realm': settings.STEAM_REALM_AUT,
            'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
            'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
        }
        
        return f"{SteamOpenIDAuthenticationAut.STEAM_OPENID_URL_AUT}?{urllib.parse.urlencode(params_aut)}"
    
    @staticmethod
    def validate_response_aut(response_params_aut):
        import requests # pyright: ignore[reportMissingModuleSource]
        from urllib.parse import urlencode
        
        # Add mode for verification
        verification_params_aut = response_params_aut.copy()
        verification_params_aut['openid.mode'] = 'check_authentication'
        
        # Send verification request to Steam
        response_aut = requests.post(
            SteamOpenIDAuthenticationAut.STEAM_OPENID_URL_AUT,
            data=verification_params_aut
        )
        
        if response_aut.status_code == 200:
            response_text_aut = response_aut.text
            if 'is_valid:true' in response_text_aut:
                # Extract Steam ID from claimed_id
                claimed_id_aut = response_params_aut.get('openid.claimed_id', '')
                if 'steamcommunity.com/openid/id/' in claimed_id_aut:
                    steam_id_aut = claimed_id_aut.split('steamcommunity.com/openid/id/')[-1]
                    return steam_id_aut
        
        return None