from django.urls import path, include # pyright: ignore[reportMissingModuleSource]
from rest_framework.routers import DefaultRouter # pyright: ignore[reportMissingImports]
from .views import ( # pyright: ignore[reportMissingImports]
    SteamLoginViewAut,
    SteamCallbackViewAut,
    TokenRefreshViewAut,
    LogoutViewAut,
    UserProfileViewAut,
    SteamAPITokensViewAut,
    SteamAPITokenDetailViewAut,
    UserLoginHistoryViewAut,
    SteamFriendsViewAut,
    SteamGamesViewAut,
    ValidateTokenViewAut,
    steam_login_redirect_aut
)

router_aut = DefaultRouter()

urlpatterns_aut = [
    # Authentication endpoints
    path('login/', SteamLoginViewAut.as_view(), name='steam_login_aut'),
    path('login/redirect/', steam_login_redirect_aut, name='steam_login_redirect_aut'),
    path('callback/', SteamCallbackViewAut.as_view(), name='steam_callback_aut'),
    path('token/refresh/', TokenRefreshViewAut.as_view(), name='token_refresh_aut'),
    path('logout/', LogoutViewAut.as_view(), name='logout_aut'),
    
    # User profile
    path('profile/', UserProfileViewAut.as_view(), name='user_profile_aut'),
    
    # Steam API tokens
    path('api-tokens/', SteamAPITokensViewAut.as_view(), name='api_tokens_list_aut'),
    path('api-tokens/<int:pk>/', SteamAPITokenDetailViewAut.as_view(), name='api_token_detail_aut'),
    
    # Login history
    path('login-history/', UserLoginHistoryViewAut.as_view(), name='login_history_aut'),
    
    # Steam data
    path('friends/', SteamFriendsViewAut.as_view(), name='steam_friends_aut'),
    path('games/', SteamGamesViewAut.as_view(), name='steam_games_aut'),
    
    # Token validation
    path('validate/', ValidateTokenViewAut.as_view(), name='validate_token_aut'),
]

urlpatterns_aut += router_aut.urls