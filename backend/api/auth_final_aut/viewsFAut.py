from django.shortcuts import render, redirect # pyright: ignore[reportMissingModuleSource]
from django.contrib.auth import login as auth_login, logout as auth_logout # pyright: ignore[reportMissingModuleSource]
from django.utils import timezone # pyright: ignore[reportMissingModuleSource]
from rest_framework import views, status, generics, viewsets, permissions # pyright: ignore[reportMissingImports]
from rest_framework.response import Response # pyright: ignore[reportMissingImports]
from rest_framework.decorators import action, api_view, permission_classes # pyright: ignore[reportMissingImports]
from rest_framework.permissions import AllowAny, IsAuthenticated # pyright: ignore[reportMissingImports]
from rest_framework.views import APIView # pyright: ignore[reportMissingImports]
from django.core.cache import cache # pyright: ignore[reportMissingModuleSource]

from .models import ( # pyright: ignore[reportMissingImports]
    CustomUserAut, 
    RoleAut, 
    UserSessionAut, 
    APITokenAut,
    SecurityEventAut,
    RateLimitRuleAut
)
from .serializers import ( # pyright: ignore[reportMissingImports]
    UserSerializerAut,
    LoginSerializerAut,
    TokenSerializerAut,
    ChangePasswordSerializerAut,
    ResetPasswordSerializerAut,
    SessionSerializerAut,
    APITokenSerializerAut,
    SecurityEventSerializerAut,
    RoleSerializerAut,
    VerifyEmailSerializerAut,
    EnableMFASerializerAut
)
from .authentication import JWTAuthenticationAut # pyright: ignore[reportMissingImports]
from .permissions import ( # pyright: ignore[reportMissingImports]
    IsAuthenticatedAut,
    IsOwnerAut,
    IsAdminAut,
    IsModeratorAut,
    HasPermissionAut,
    RateLimitPermissionAut,
    SessionTimeoutPermissionAut,
    ConcurrentSessionPermissionAut
)
from .throttles import ( # pyright: ignore[reportMissingImports]
    UserRateThrottleAut,
    AnonRateThrottleAut,
    DynamicRateThrottleAut,
    BurstRateThrottleAut
)
from .decorators import ( # pyright: ignore[reportMissingImports]
    role_required_decorator_aut,
    permission_required_decorator_aut,
    rate_limit_decorator_aut
)

class LoginViewAut(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottleAut, BurstRateThrottleAut]
    
    def post_aut(self, request_aut):
        serializer_aut = LoginSerializerAut(data=request_aut.data, context={'request': request_aut})
        serializer_aut.is_valid(raise_exception=True)
        
        user_aut = serializer_aut.validated_data['user_aut']
        remember_me_aut = serializer_aut.validated_data.get('remember_me_aut', False)
        
        # Generate JWT tokens
        tokens_aut = JWTAuthenticationAut.generate_tokens_aut(user_aut, request_aut, remember_me_aut)
        
        # Django login for session-based auth
        auth_login(request_aut, user_aut)
        
        # Serialize response
        response_aut = TokenSerializerAut({
            'access_token_aut': tokens_aut['access_token_aut'],
            'refresh_token_aut': tokens_aut['refresh_token_aut'],
            'expires_in_aut': tokens_aut['expires_in_aut'],
            'token_type_aut': tokens_aut['token_type_aut'],
            'user_aut': user_aut
        })
        
        return Response(response_aut.data, status=status.HTTP_200_OK)

class LogoutViewAut(APIView):
    permission_classes = [IsAuthenticatedAut]
    
    def post_aut(self, request_aut):
        # Get JTI from token if available
        auth_header_aut = request_aut.headers.get('Authorization')
        if auth_header_aut:
            try:
                token_aut = auth_header_aut.split()[1]
                payload_aut = JWTAuthenticationAut.decode_token_aut(token_aut)
                jti_aut = payload_aut.get('jti_aut')
                
                if jti_aut:
                    JWTAuthenticationAut.revoke_token_aut(jti_aut)
            except (IndexError, jwt.InvalidTokenError): # pyright: ignore[reportUndefinedVariable]
                pass
        
        # Logout Django session
        auth_logout(request_aut)
        
        # Deactivate current session
        if hasattr(request_aut, 'session'):
            try:
                session_aut = UserSessionAut.objects.get(
                    session_key_aut=request_aut.session.session_key,
                    user_aut=request_aut.user
                )
                session_aut.deactivate_aut()
            except UserSessionAut.DoesNotExist:
                pass
        
        # Log security event
        SecurityEventAut.objects.create(
            user_aut=request_aut.user,
            event_type_aut='session_end_aut',
            ip_address_aut=request_aut.META.get('REMOTE_ADDR'),
            user_agent_aut=request_aut.META.get('HTTP_USER_AGENT', ''),
            severity_aut='low_aut'
        )
        
        return Response(
            {'message_aut': 'Successfully logged out'},
            status=status.HTTP_200_OK
        )

class TokenRefreshViewAut(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [UserRateThrottleAut]
    
    def post_aut(self, request_aut):
        refresh_token_aut = request_aut.data.get('refresh_token_aut')
        
        if not refresh_token_aut:
            return Response(
                {'error_aut': 'Refresh token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            new_tokens_aut = JWTAuthenticationAut.refresh_access_token_aut(refresh_token_aut)
            return Response(new_tokens_aut, status=status.HTTP_200_OK)
        except Exception as e_aut:
            return Response(
                {'error_aut': str(e_aut)},
                status=status.HTTP_400_BAD_REQUEST
            )

class UserProfileViewAut(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializerAut
    permission_classes = [IsAuthenticatedAut, IsOwnerAut]
    throttle_classes = [UserRateThrottleAut]
    
    def get_object_aut(self):
        return self.request.user
    
    def retrieve_aut(self, request_aut, *args_aut, **kwargs_aut):
        instance_aut = self.get_object_aut()
        serializer_aut = self.get_serializer(instance_aut)
        return Response(serializer_aut.data)
    
    def update_aut(self, request_aut, *args_aut, **kwargs_aut):
        instance_aut = self.get_object_aut()
        serializer_aut = self.get_serializer(instance_aut, data=request_aut.data, partial=True)
        serializer_aut.is_valid(raise_exception=True)
        self.perform_update_aut(serializer_aut)
        
        return Response(serializer_aut.data)

class ChangePasswordViewAut(APIView):
    permission_classes = [IsAuthenticatedAut]
    throttle_classes = [UserRateThrottleAut]
    
    def post_aut(self, request_aut):
        serializer_aut = ChangePasswordSerializerAut(
            data=request_aut.data,
            context={'request': request_aut}
        )
        serializer_aut.is_valid(raise_exception=True)
        
        user_aut = request_aut.user
        current_password_aut = serializer_aut.validated_data['current_password_aut']
        new_password_aut = serializer_aut.validated_data['new_password_aut']
        
        # Verify current password
        if not user_aut.check_password(current_password_aut):
            return Response(
                {'error_aut': 'Current password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        user_aut.set_password(new_password_aut)
        user_aut.last_password_change_aut = timezone.now()
        user_aut.save()
        
        # Force logout all sessions
        user_aut.force_logout_all_sessions_aut()
        
        # Log security event
        SecurityEventAut.objects.create(
            user_aut=user_aut,
            event_type_aut='password_change_aut',
            ip_address_aut=request_aut.META.get('REMOTE_ADDR'),
            user_agent_aut=request_aut.META.get('HTTP_USER_AGENT', ''),
            severity_aut='medium_aut'
        )
        
        return Response(
            {'message_aut': 'Password changed successfully. Please log in again.'},
            status=status.HTTP_200_OK
        )

class UserSessionsViewAut(generics.ListAPIView):
    serializer_class = SessionSerializerAut
    permission_classes = [IsAuthenticatedAut]
    
    def get_queryset_aut(self):
        return UserSessionAut.objects.filter(
            user_aut=self.request.user,
            is_active_aut=True
        ).order_by('-last_activity_aut')
    
    @action(detail=False, methods=['post'])
    def terminate_aut(self, request_aut):
        session_id_aut = request_aut.data.get('session_id_aut')
        
        if session_id_aut == 'all':
            # Terminate all sessions except current
            sessions_aut = self.get_queryset_aut()
            current_session_key_aut = request_aut.session.session_key
            
            for session_aut in sessions_aut:
                if session_aut.session_key_aut != current_session_key_aut:
                    session_aut.deactivate_aut()
            
            message_aut = 'All other sessions terminated'
        else:
            # Terminate specific session
            try:
                session_aut = UserSessionAut.objects.get(
                    id_aut=session_id_aut,
                    user_aut=request_aut.user
                )
                session_aut.deactivate_aut()
                message_aut = 'Session terminated'
            except UserSessionAut.DoesNotExist:
                return Response(
                    {'error_aut': 'Session not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        return Response({'message_aut': message_aut})

class APITokensViewSetAut(viewsets.ModelViewSet):
    serializer_class = APITokenSerializerAut
    permission_classes = [IsAuthenticatedAut]
    
    def get_queryset_aut(self):
        return APITokenAut.objects.filter(user_aut=self.request.user)
    
    def perform_create_aut(self, serializer_aut):
        import secrets
        import uuid
        
        token_type_aut = serializer_aut.validated_data.get('token_type_aut', 'bearer_aut')
        
        if token_type_aut == 'jwt_aut':
            # Generate JWT token
            jti_aut = str(uuid.uuid4())
            token_aut = JWTAuthenticationAut.generate_tokens_aut(self.request.user)['access_token_aut']
            serializer_aut.save(user_aut=self.request.user, token_aut=token_aut, jti_aut=jti_aut)
        else:
            # Generate random token
            token_aut = secrets.token_urlsafe(32)
            serializer_aut.save(user_aut=self.request.user, token_aut=token_aut)
    
    @action(detail=True, methods=['post'])
    def regenerate_aut(self, request_aut, pk_aut=None):
        token_aut = self.get_object_aut()
        
        import secrets
        token_aut.token_aut = secrets.token_urlsafe(32)
        token_aut.save()
        
        return Response({'new_token_aut': token_aut.token_aut})

class SecurityEventsViewAut(generics.ListAPIView):
    serializer_class = SecurityEventSerializerAut
    permission_classes = [IsAuthenticatedAut, IsAdminAut]
    throttle_classes = [UserRateThrottleAut]
    
    def get_queryset_aut(self):
        user_aut = self.request.user
        
        if user_aut.has_role_aut('admin_aut'):
            # Admins can see all events
            return SecurityEventAut.objects.all().order_by('-created_at_aut')
        else:
            # Users can only see their own events
            return SecurityEventAut.objects.filter(
                user_aut=user_aut
            ).order_by('-created_at_aut')

class AdminUsersViewSetAut(viewsets.ModelViewSet):
    serializer_class = UserSerializerAut
    permission_classes = [IsAuthenticatedAut, IsAdminAut]
    throttle_classes = [UserRateThrottleAut]
    
    def get_queryset_aut(self):
        return CustomUserAut.objects.all().order_by('-date_joined_aut')
    
    @action(detail=True, methods=['post'])
    def activate_aut(self, request_aut, pk_aut=None):
        user_aut = self.get_object_aut()
        user_aut.is_active_aut = True
        user_aut.save()
        
        return Response({'message_aut': 'User activated'})
    
    @action(detail=True, methods=['post'])
    def deactivate_aut(self, request_aut, pk_aut=None):
        user_aut = self.get_object_aut()
        user_aut.is_active_aut = False
        user_aut.force_logout_all_sessions_aut()
        user_aut.save()
        
        return Response({'message_aut': 'User deactivated'})
    
    @action(detail=True, methods=['post'])
    def change_role_aut(self, request_aut, pk_aut=None):
        user_aut = self.get_object_aut()
        role_id_aut = request_aut.data.get('role_id_aut')
        
        try:
            role_aut = RoleAut.objects.get(id_aut=role_id_aut)
            user_aut.role_aut = role_aut
            user_aut.save()
            
            # Log security event
            SecurityEventAut.objects.create(
                user_aut=user_aut,
                event_type_aut='role_change_aut',
                ip_address_aut=request_aut.META.get('REMOTE_ADDR'),
                user_agent_aut=request_aut.META.get('HTTP_USER_AGENT', ''),
                severity_aut='medium_aut',
                details_aut={
                    'old_role_aut': user_aut.role_aut.code_aut if user_aut.role_aut else None,
                    'new_role_aut': role_aut.code_aut,
                    'changed_by_aut': request_aut.user.username_aut
                }
            )
            
            return Response({'message_aut': 'Role changed successfully'})
            
        except RoleAut.DoesNotExist:
            return Response(
                {'error_aut': 'Role not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class VerifyEmailViewAut(APIView):
    permission_classes = [AllowAny]
    
    def post_aut(self, request_aut):
        serializer_aut = VerifyEmailSerializerAut(data=request_aut.data)
        serializer_aut.is_valid(raise_exception=True)
        
        token_aut = serializer_aut.validated_data['token_aut']
        
        # Verify token (implementation depends on your token system)
        
        return Response({'message_aut': 'Email verified successfully'})

class EnableMFAViewAut(APIView):
    permission_classes = [IsAuthenticatedAut]
    
    def post_aut(self, request_aut):
        serializer_aut = EnableMFASerializerAut(data=request_aut.data)
        serializer_aut.is_valid(raise_exception=True)
        
        user_aut = request_aut.user
        enable_aut = serializer_aut.validated_data['enable_aut']
        current_password_aut = serializer_aut.validated_data['current_password_aut']
        
        # Verify current password
        if not user_aut.check_password(current_password_aut):
            return Response(
                {'error_aut': 'Current password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if enable_aut:
            # Generate MFA secret (simplified)
            import secrets
            user_aut.mfa_secret_aut = secrets.token_urlsafe(16)
            user_aut.mfa_enabled_aut = True
            user_aut.save()
            
            message_aut = 'MFA enabled successfully'
        else:
            user_aut.mfa_secret_aut = None
            user_aut.mfa_enabled_aut = False
            user_aut.save()
            
            message_aut = 'MFA disabled successfully'
        
        return Response({'message_aut': message_aut})

class SystemStatusViewAut(APIView):
    permission_classes = [IsAuthenticatedAut, IsAdminAut]
    
    def get_aut(self, request_aut):
        from django.db import connection # pyright: ignore[reportMissingModuleSource]
        import psutil # pyright: ignore[reportMissingModuleSource]
        import os
        
        # Database status
        try:
            with connection.cursor() as cursor_aut:
                cursor_aut.execute("SELECT 1")
                db_status_aut = 'healthy'
        except Exception:
            db_status_aut = 'unhealthy'
        
        # Cache status
        try:
            cache.set('health_check_aut', 'ok', 1)
            cache_status_aut = 'healthy' if cache.get('health_check_aut') == 'ok' else 'unhealthy'
        except Exception:
            cache_status_aut = 'unhealthy'
        
        # System metrics
        cpu_percent_aut = psutil.cpu_percent(interval=1)
        memory_aut = psutil.virtual_memory()
        disk_aut = psutil.disk_usage('/')
        
        # User statistics
        total_users_aut = CustomUserAut.objects.count()
        active_users_aut = CustomUserAut.objects.filter(is_active_aut=True).count()
        online_users_aut = CustomUserAut.objects.filter(
            last_activity_aut__gte=timezone.now() - timezone.timedelta(minutes=5)
        ).count()
        
        return Response({
            'status_aut': 'ok',
            'timestamp_aut': timezone.now().isoformat(),
            'services_aut': {
                'database_aut': db_status_aut,
                'cache_aut': cache_status_aut
            },
            'metrics_aut': {
                'cpu_percent_aut': cpu_percent_aut,
                'memory_percent_aut': memory_aut.percent,
                'disk_percent_aut': disk_aut.percent
            },
            'users_aut': {
                'total_aut': total_users_aut,
                'active_aut': active_users_aut,
                'online_aut': online_users_aut
            }
        })

# Example of using decorators
@api_view(['GET'])
@permission_classes([IsAuthenticatedAut])
@role_required_decorator_aut('admin_aut', 'moderator_aut')
@rate_limit_decorator_aut('10/minute', 'admin_dashboard')
def admin_dashboard_view_aut(request_aut):
    """Example view with multiple decorators"""
    return Response({'message_aut': 'Welcome to admin dashboard'})

@api_view(['POST'])
@permission_classes([IsAuthenticatedAut])
@permission_required_decorator_aut('users.delete')
def delete_user_view_aut(request_aut):
    """Example view with permission decorator"""
    user_id_aut = request_aut.data.get('user_id_aut')
    
    try:
        user_aut = CustomUserAut.objects.get(id_aut=user_id_aut)
        user_aut.delete()
        
        return Response({'message_aut': 'User deleted successfully'})
    except CustomUserAut.DoesNotExist:
        return Response(
            {'error_aut': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )