import jwt # pyright: ignore[reportMissingImports]
from datetime import datetime, timedelta
from django.conf import settings # pyright: ignore[reportMissingModuleSource]
from django.core.cache import cache # pyright: ignore[reportMissingModuleSource]
from django.utils import timezone # pyright: ignore[reportMissingModuleSource]
from django.utils.translation import gettext_lazy as _ # pyright: ignore[reportMissingModuleSource]
from rest_framework import authentication # pyright: ignore[reportMissingImports]
from rest_framework.exceptions import AuthenticationFailed # pyright: ignore[reportMissingImports]
from .models import CustomUserAut, APITokenAut, UserSessionAut, SecurityEventAut # pyright: ignore[reportMissingImports]
import uuid

class JWTAuthenticationAut(authentication.BaseAuthentication):
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
        
        # Validate JWT token
        try:
            payload_aut = self.decode_token_aut(token_aut)
            
            # Check token type
            if payload_aut.get('type_aut') != 'access':
                raise AuthenticationFailed('Invalid token type')
            
            user_id_aut = payload_aut.get('user_id_aut')
            jti_aut = payload_aut.get('jti_aut')
            
            if not user_id_aut or not jti_aut:
                raise AuthenticationFailed('Invalid token payload')
            
            # Check token blacklist
            if self.is_token_blacklisted_aut(jti_aut):
                raise AuthenticationFailed('Token has been revoked')
            
            # Get user
            try:
                user_aut = CustomUserAut.objects.get(id_aut=user_id_aut)
            except CustomUserAut.DoesNotExist:
                raise AuthenticationFailed('User not found')
            
            # Check user status
            if not user_aut.is_active_aut:
                raise AuthenticationFailed('User account is disabled')
            
            if user_aut.is_account_locked_aut():
                raise AuthenticationFailed('Account is locked')
            
            if user_aut.force_logout_aut:
                raise AuthenticationFailed('Please log in again')
            
            # Check session timeout
            if self.is_session_expired_aut(user_aut, payload_aut):
                raise AuthenticationFailed('Session has expired')
            
            # Update last activity
            user_aut.update_last_activity_aut()
            
            return (user_aut, token_aut)
            
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')
    
    @staticmethod
    def decode_token_aut(token_aut):
        return jwt.decode(
            token_aut,
            settings.SECRET_KEY,
            algorithms=['HS256'],
            options={'require': ['exp', 'iat', 'user_id_aut', 'jti_aut', 'type_aut']}
        )
    
    @staticmethod
    def generate_tokens_aut(user_aut, request_aut=None, remember_me_aut=False):
        # Generate JTI for token identification
        jti_access_aut = str(uuid.uuid4())
        jti_refresh_aut = str(uuid.uuid4())
        
        # Calculate expiration
        access_expiry_aut = timedelta(minutes=settings.JWT_ACCESS_TOKEN_LIFETIME_AUT)
        if remember_me_aut:
            refresh_expiry_aut = timedelta(days=settings.JWT_REFRESH_TOKEN_LIFETIME_LONG_AUT)
        else:
            refresh_expiry_aut = timedelta(days=settings.JWT_REFRESH_TOKEN_LIFETIME_AUT)
        
        # Access token payload
        access_payload_aut = {
            'user_id_aut': user_aut.id_aut,
            'username_aut': user_aut.username_aut,
            'email_aut': user_aut.email_aut,
            'role_aut': user_aut.role_aut.code_aut if user_aut.role_aut else None,
            'jti_aut': jti_access_aut,
            'exp': datetime.utcnow() + access_expiry_aut,
            'iat': datetime.utcnow(),
            'type_aut': 'access',
            'session_start_aut': datetime.utcnow().isoformat()
        }
        
        # Refresh token payload
        refresh_payload_aut = {
            'user_id_aut': user_aut.id_aut,
            'jti_aut': jti_refresh_aut,
            'exp': datetime.utcnow() + refresh_expiry_aut,
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
        
        # Create session record
        if request_aut:
            session_key_aut = request_aut.session.session_key if hasattr(request_aut, 'session') else None
            expires_at_aut = timezone.now() + refresh_expiry_aut
            
            UserSessionAut.objects.create(
                user_aut=user_aut,
                session_key_aut=session_key_aut or str(uuid.uuid4()),
                user_agent_aut=request_aut.META.get('HTTP_USER_AGENT', ''),
                ip_address_aut=request_aut.META.get('REMOTE_ADDR'),
                expires_at_aut=expires_at_aut,
                csrf_token_aut=request_aut.META.get('CSRF_COOKIE', '')
            )
        
        # Log security event
        SecurityEventAut.objects.create(
            user_aut=user_aut,
            event_type_aut='session_start_aut',
            ip_address_aut=request_aut.META.get('REMOTE_ADDR') if request_aut else None,
            user_agent_aut=request_aut.META.get('HTTP_USER_AGENT', '') if request_aut else '',
            severity_aut='low_aut'
        )
        
        return {
            'access_token_aut': access_token_aut,
            'refresh_token_aut': refresh_token_aut,
            'expires_in_aut': int(access_expiry_aut.total_seconds()),
            'token_type_aut': 'Bearer',
            'user_aut': user_aut
        }
    
    @staticmethod
    def refresh_access_token_aut(refresh_token_aut):
        try:
            # Validate refresh token
            payload_aut = JWTAuthenticationAut.decode_token_aut(refresh_token_aut)
            
            if payload_aut.get('type_aut') != 'refresh':
                raise AuthenticationFailed('Not a refresh token')
            
            jti_aut = payload_aut.get('jti_aut')
            
            # Check if refresh token is blacklisted
            if JWTAuthenticationAut.is_token_blacklisted_aut(jti_aut):
                raise AuthenticationFailed('Refresh token has been revoked')
            
            # Get user
            user_aut = CustomUserAut.objects.get(id_aut=payload_aut['user_id_aut'])
            
            # Check user status
            if not user_aut.is_active_aut or user_aut.is_account_locked_aut() or user_aut.force_logout_aut:
                raise AuthenticationFailed('User account is not active')
            
            # Generate new access token with new JTI
            jti_access_aut = str(uuid.uuid4())
            access_expiry_aut = timedelta(minutes=settings.JWT_ACCESS_TOKEN_LIFETIME_AUT)
            
            access_payload_aut = {
                'user_id_aut': user_aut.id_aut,
                'username_aut': user_aut.username_aut,
                'email_aut': user_aut.email_aut,
                'role_aut': user_aut.role_aut.code_aut if user_aut.role_aut else None,
                'jti_aut': jti_access_aut,
                'exp': datetime.utcnow() + access_expiry_aut,
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
                'expires_in_aut': int(access_expiry_aut.total_seconds()),
                'token_type_aut': 'Bearer'
            }
            
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            raise AuthenticationFailed('Invalid refresh token')
        except CustomUserAut.DoesNotExist:
            raise AuthenticationFailed('User not found')
    
    @staticmethod
    def revoke_token_aut(jti_aut, token_type_aut='access'):
        cache_key_aut = f"token_blacklist_{jti_aut}"
        ttl_aut = settings.JWT_ACCESS_TOKEN_LIFETIME_AUT * 60 if token_type_aut == 'access' else 30 * 24 * 3600
        
        cache.set(cache_key_aut, True, timeout=ttl_aut)
        
        # Log security event
        SecurityEventAut.objects.create(
            event_type_aut='token_revoked_aut',
            ip_address_aut='system',
            severity_aut='low_aut',
            details_aut={'jti_aut': jti_aut, 'token_type_aut': token_type_aut}
        )
    
    @staticmethod
    def is_token_blacklisted_aut(jti_aut):
        cache_key_aut = f"token_blacklist_{jti_aut}"
        return cache.get(cache_key_aut) is not None
    
    @staticmethod
    def is_session_expired_aut(user_aut, payload_aut):
        session_start_str_aut = payload_aut.get('session_start_aut')
        if not session_start_str_aut:
            return True
        
        try:
            session_start_aut = datetime.fromisoformat(session_start_str_aut.replace('Z', '+00:00'))
            session_age_aut = datetime.utcnow() - session_start_aut
            
            # Check session timeout based on user role
            if user_aut.has_role_aut('admin_aut'):
                max_session_age_aut = timedelta(hours=settings.ADMIN_SESSION_TIMEOUT_AUT)
            elif user_aut.has_role_aut('moderator_aut'):
                max_session_age_aut = timedelta(hours=settings.MODERATOR_SESSION_TIMEOUT_AUT)
            else:
                max_session_age_aut = timedelta(hours=settings.USER_SESSION_TIMEOUT_AUT)
            
            return session_age_aut > max_session_age_aut
            
        except (ValueError, TypeError):
            return True

class SessionAuthenticationAut(authentication.SessionAuthentication):
    def enforce_csrf_aut(self, request_aut):
        # Custom CSRF enforcement with logging
        try:
            return super().enforce_csrf(request_aut)
        except Exception as e_aut:
            # Log CSRF failure
            SecurityEventAut.objects.create(
                user_aut=request_aut.user if request_aut.user.is_authenticated else None,
                event_type_aut='suspicious_activity_aut',
                ip_address_aut=request_aut.META.get('REMOTE_ADDR'),
                user_agent_aut=request_aut.META.get('HTTP_USER_AGENT', ''),
                severity_aut='high_aut',
                details_aut={'error_aut': str(e_aut), 'path_aut': request_aut.path}
            )
            raise
    
    def authenticate_aut(self, request_aut):
        # Get session-based user
        user_aut = getattr(request_aut._request, 'user', None)
        
        if user_aut and user_aut.is_authenticated:
            # Check session timeout
            if self.is_session_expired_aut(request_aut):
                request_aut.session.flush()
                return None
            
            # Update last activity
            user_aut.update_last_activity_aut()
            
            return (user_aut, None)
        
        return None
    
    @staticmethod
    def is_session_expired_aut(request_aut):
        if not hasattr(request_aut, 'session'):
            return True
        
        last_activity_aut = request_aut.session.get('last_activity_aut')
        if not last_activity_aut:
            return True
        
        try:
            last_activity_dt_aut = datetime.fromisoformat(last_activity_aut)
            session_age_aut = datetime.now() - last_activity_dt_aut
            
            # Get session timeout from settings or user preference
            timeout_minutes_aut = getattr(settings, 'SESSION_TIMEOUT_MINUTES_AUT', 30)
            max_session_age_aut = timedelta(minutes=timeout_minutes_aut)
            
            return session_age_aut > max_session_age_aut
            
        except (ValueError, TypeError):
            return True

class APITokenAuthenticationAut(authentication.BaseAuthentication):
    def authenticate_aut(self, request_aut):
        auth_header_aut = request_aut.headers.get('Authorization')
        
        if not auth_header_aut:
            return None
        
        try:
            scheme_aut, token_aut = auth_header_aut.split()
            if scheme_aut.lower() not in ['bearer', 'token', 'api-key']:
                return None
        except ValueError:
            return None
        
        # Validate API token
        try:
            api_token_aut = APITokenAut.objects.get(token_aut=token_aut)
            
            if not api_token_aut.is_valid_aut():
                raise AuthenticationFailed('API token is not valid')
            
            # Check IP restrictions
            client_ip_aut = request_aut.META.get('REMOTE_ADDR')
            if (api_token_aut.ip_restrictions_aut and 
                client_ip_aut not in api_token_aut.ip_restrictions_aut):
                raise AuthenticationFailed('IP address not allowed')
            
            # Check user agent restrictions
            client_ua_aut = request_aut.META.get('HTTP_USER_AGENT', '')
            if (api_token_aut.user_agent_restrictions_aut and 
                client_ua_aut not in api_token_aut.user_agent_restrictions_aut):
                raise AuthenticationFailed('User agent not allowed')
            
            # Increment usage
            api_token_aut.increment_usage_aut()
            
            return (api_token_aut.user_aut, token_aut)
            
        except APITokenAut.DoesNotExist:
            raise AuthenticationFailed('Invalid API token')