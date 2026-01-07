from django.shortcuts import render, redirect # pyright: ignore[reportMissingModuleSource]
from django.urls import reverse # pyright: ignore[reportMissingModuleSource]
from django.contrib.auth import login as auth_login # pyright: ignore[reportMissingModuleSource]
from django.utils import timezone # pyright: ignore[reportMissingModuleSource]
from rest_framework import views, status, generics, permissions # pyright: ignore[reportMissingImports]
from rest_framework.response import Response # pyright: ignore[reportMissingImports]
from rest_framework.decorators import action, api_view, permission_classes # pyright: ignore[reportMissingImports]
from rest_framework.permissions import IsAuthenticated, AllowAny # pyright: ignore[reportMissingImports]
from rest_framework.views import APIView # pyright: ignore[reportMissingImports]
from urllib.parse import urlencode
import requests # pyright: ignore[reportMissingModuleSource]

from .models import CustomUserAut, UserLoginHistoryAut, SteamAPITokenAut # pyright: ignore[reportMissingImports]
from .serializers import ( # pyright: ignore[reportMissingImports]
    UserSerializerAut,
    SteamLoginSerializerAut,
    JWTSerializerAut,
    TokenRefreshSerializerAut,
    LogoutSerializerAut,
    SteamCallbackSerializerAut,
    UserProfileUpdateSerializerAut,
    SteamAPITokenSerializerAut,
    LoginHistorySerializerAut
)
from .authentication import SteamJWTAuthenticationAut, SteamOpenIDAuthenticationAut # pyright: ignore[reportMissingImports]
from .services import SteamAuthServiceAut, SteamAPIServiceAut, UserServiceAut # pyright: ignore[reportMissingImports]
from .permissions import IsSteamAuthenticatedAut, IsUserOwnerAut # pyright: ignore[reportMissingImports]
from .throttles import SteamLoginThrottleAut, TokenRefreshThrottleAut # pyright: ignore[reportMissingImports]

class SteamLoginViewAut(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [SteamLoginThrottleAut]
    
    def get_aut(self, request_aut):
        # Generate redirect URL for Steam login
        redirect_url_aut = request_aut.build_absolute_uri(reverse('steam_callback_aut'))
        state_token_aut = SteamAuthServiceAut.generate_state_token_aut()
        
        login_url_aut = SteamOpenIDAuthenticationAut.get_login_url_aut(redirect_url_aut)
        
        # Store state in session
        request_aut.session['steam_auth_state_aut'] = state_token_aut
        request_aut.session['steam_redirect_aut'] = request_aut.GET.get('redirect', '/')
        
        return Response({
            'login_url_aut': login_url_aut,
            'state_aut': state_token_aut,
            'redirect_url_aut': redirect_url_aut
        })
    
    def post_aut(self, request_aut):
        serializer_aut = SteamLoginSerializerAut(data=request_aut.data)
        serializer_aut.is_valid(raise_exception=True)
        
        openid_params_aut = serializer_aut.validated_data['openid_params_aut']
        
        # Validate Steam OpenID response
        steam_id_aut = SteamOpenIDAuthenticationAut.validate_response_aut(openid_params_aut)
        
        if not steam_id_aut:
            return Response(
                {'error_aut': 'Invalid Steam authentication'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create user
        player_data_aut = SteamAPIServiceAut.get_player_summaries_aut(steam_id_aut)
        if player_data_aut:
            steam_user_data_aut = player_data_aut[0]
        else:
            steam_user_data_aut = {'steamid': steam_id_aut}
        
        user_aut = UserServiceAut.create_or_update_user_from_steam_aut(steam_user_data_aut)
        
        if not user_aut:
            return Response(
                {'error_aut': 'Failed to create user'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Generate JWT tokens
        tokens_aut = SteamJWTAuthenticationAut.generate_tokens_aut(user_aut, request_aut)
        
        # Log login history
        UserLoginHistoryAut.objects.create(
            user_aut=user_aut,
            login_method_aut='steam_aut',
            ip_address_aut=request_aut.META.get('REMOTE_ADDR', ''),
            user_agent_aut=request_aut.META.get('HTTP_USER_AGENT', ''),
            success_aut=True
        )
        
        # Increment login count
        user_aut.increment_login_count_aut()
        
        serializer_aut = JWTSerializerAut({
            'access_token_aut': tokens_aut['access_token_aut'],
            'refresh_token_aut': tokens_aut['refresh_token_aut'],
            'expires_in_aut': tokens_aut['expires_in_aut'],
            'token_type_aut': tokens_aut['token_type_aut'],
            'user_aut': user_aut
        })
        
        return Response(serializer_aut.data, status=status.HTTP_200_OK)

class SteamCallbackViewAut(APIView):
    permission_classes = [AllowAny]
    
    def get_aut(self, request_aut):
        # Render callback page that will handle the OpenID response
        return render(request_aut, 'steam_auth_aut/callback.html', {
            'openid_params_aut': dict(request_aut.GET.items())
        })

class TokenRefreshViewAut(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [TokenRefreshThrottleAut]
    
    def post_aut(self, request_aut):
        serializer_aut = TokenRefreshSerializerAut(data=request_aut.data)
        serializer_aut.is_valid(raise_exception=True)
        
        refresh_token_aut = serializer_aut.validated_data['refresh_token_aut']
        
        try:
            new_tokens_aut = SteamJWTAuthenticationAut.refresh_access_token_aut(refresh_token_aut)
            return Response(new_tokens_aut, status=status.HTTP_200_OK)
        except Exception as e_aut:
            return Response(
                {'error_aut': str(e_aut)},
                status=status.HTTP_400_BAD_REQUEST
            )

class LogoutViewAut(APIView):
    permission_classes = [IsAuthenticated]
    
    def post_aut(self, request_aut):
        serializer_aut = LogoutSerializerAut(data=request_aut.data)
        serializer_aut.is_valid(raise_exception=True)
        
        refresh_token_aut = serializer_aut.validated_data.get('refresh_token_aut')
        
        if refresh_token_aut:
            SteamJWTAuthenticationAut.logout_user_aut(refresh_token_aut)
        
        return Response(
            {'message_aut': 'Successfully logged out'},
            status=status.HTTP_200_OK
        )

class UserProfileViewAut(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializerAut
    permission_classes = [IsAuthenticated, IsUserOwnerAut]
    
    def get_object_aut(self):
        return self.request.user
    
    def retrieve_aut(self, request_aut, *args_aut, **kwargs_aut):
        instance_aut = self.get_object_aut()
        serializer_aut = self.get_serializer(instance_aut)
        return Response(serializer_aut.data)
    
    def update_aut(self, request_aut, *args_aut, **kwargs_aut):
        partial_aut = kwargs_aut.pop('partial', False)
        instance_aut = self.get_object_aut()
        serializer_aut = UserProfileUpdateSerializerAut(
            instance_aut,
            data=request_aut.data,
            partial=partial_aut
        )
        serializer_aut.is_valid(raise_exception=True)
        self.perform_update_aut(serializer_aut)
        
        return Response(UserSerializerAut(instance_aut).data)

class SteamAPITokensViewAut(generics.ListCreateAPIView):
    serializer_class = SteamAPITokenSerializerAut
    permission_classes = [IsAuthenticated]
    
    def get_queryset_aut(self):
        return SteamAPITokenAut.objects.filter(user_aut=self.request.user)
    
    def perform_create_aut(self, serializer_aut):
        import secrets
        token_aut = secrets.token_urlsafe(32)
        serializer_aut.save(user_aut=self.request.user, token_aut=token_aut)

class SteamAPITokenDetailViewAut(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SteamAPITokenSerializerAut
    permission_classes = [IsAuthenticated, IsUserOwnerAut]
    
    def get_queryset_aut(self):
        return SteamAPITokenAut.objects.filter(user_aut=self.request.user)

class UserLoginHistoryViewAut(generics.ListAPIView):
    serializer_class = LoginHistorySerializerAut
    permission_classes = [IsAuthenticated]
    
    def get_queryset_aut(self):
        return UserLoginHistoryAut.objects.filter(
            user_aut=self.request.user
        ).order_by('-created_at_aut')

class SteamFriendsViewAut(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_aut(self, request_aut):
        user_aut = request_aut.user
        
        if not user_aut.steam_id_aut:
            return Response(
                {'error_aut': 'No Steam account linked'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        friends_aut = SteamAPIServiceAut.get_friend_list_aut(user_aut.steam_id_aut)
        
        return Response({
            'count_aut': len(friends_aut),
            'friends_aut': friends_aut
        })

class SteamGamesViewAut(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_aut(self, request_aut):
        user_aut = request_aut.user
        
        if not user_aut.steam_id_aut:
            return Response(
                {'error_aut': 'No Steam account linked'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        games_aut = SteamAPIServiceAut.get_owned_games_aut(user_aut.steam_id_aut)
        
        return Response({
            'count_aut': len(games_aut),
            'games_aut': games_aut
        })

class ValidateTokenViewAut(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_aut(self, request_aut):
        return Response({
            'valid_aut': True,
            'user_aut': UserSerializerAut(request_aut.user).data
        })

@api_view(['GET'])
@permission_classes([AllowAny])
def steam_login_redirect_aut(request_aut):
    """Direct redirect to Steam login (for web browsers)"""
    redirect_url_aut = request_aut.build_absolute_uri(reverse('steam_callback_aut'))
    login_url_aut = SteamOpenIDAuthenticationAut.get_login_url_aut(redirect_url_aut)
    return redirect(login_url_aut)