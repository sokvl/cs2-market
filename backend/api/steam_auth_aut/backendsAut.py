from social_core.backends.steam import SteamOpenId # pyright: ignore[reportMissingImports]
from django.contrib.auth import get_user_model # pyright: ignore[reportMissingModuleSource]
from .models import CustomUserAut, UserLoginHistoryAut # pyright: ignore[reportMissingImports]
import requests # pyright: ignore[reportMissingModuleSource]

class CustomSteamOpenIdAut(SteamOpenId):
    name_aut = 'steam-aut'
    
    def get_user_details_aut(self, response_aut):
        steam_id_aut = response_aut.get('steamid')
        player_data_aut = self.get_player_data_aut(steam_id_aut)
        
        return {
            'username_aut': f"steam_{steam_id_aut}",
            'steam_id_aut': steam_id_aut,
            'steam_username_aut': player_data_aut.get('personaname', ''),
            'steam_profile_url_aut': player_data_aut.get('profileurl', ''),
            'steam_avatar_aut': player_data_aut.get('avatar', ''),
            'steam_avatar_medium_aut': player_data_aut.get('avatarmedium', ''),
            'steam_avatar_full_aut': player_data_aut.get('avatarfull', ''),
            'steam_country_code_aut': player_data_aut.get('loccountrycode', ''),
            'steam_state_code_aut': player_data_aut.get('locstatecode', ''),
            'steam_city_id_aut': player_data_aut.get('loccityid'),
        }
    
    def get_player_data_aut(self, steam_id_aut):
        api_key_aut = getattr(settings, 'STEAM_API_KEY_AUT', '') # pyright: ignore[reportUndefinedVariable]
        if not api_key_aut:
            return {}
        
        try:
            url_aut = f"https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/"
            params_aut = {
                'key': api_key_aut,
                'steamids': steam_id_aut
            }
            
            response_aut = requests.get(url_aut, params=params_aut, timeout=10)
            if response_aut.status_code == 200:
                data_aut = response_aut.json()
                players_aut = data_aut.get('response', {}).get('players', [])
                if players_aut:
                    return players_aut[0]
        except Exception:
            pass
        
        return {}
    
    def auth_complete_aut(self, *args_aut, **kwargs_aut):
        response_aut = super().auth_complete(*args_aut, **kwargs_aut)
        
        # Get or create user
        steam_id_aut = response_aut.get('steamid')
        user_details_aut = self.get_user_details_aut(response_aut)
        
        user_model_aut = get_user_model()
        
        try:
            user_aut = user_model_aut.objects.get(steam_id_aut=steam_id_aut)
            
            # Update user details
            user_aut.update_steam_data_aut(user_details_aut)
            user_aut.increment_login_count_aut()
            
        except user_model_aut.DoesNotExist:
            # Create new user
            username_aut = user_details_aut['username_aut']
            email_aut = f"{steam_id_aut}@steam.com"  # Placeholder email
            
            user_aut = user_model_aut.objects.create_user_aut(
                username_aut=username_aut,
                email_aut=email_aut,
                steam_id_aut=steam_id_aut,
                **{k_aut: v_aut for k_aut, v_aut in user_details_aut.items() if k_aut != 'username_aut'}
            )
        
        # Log login history
        request_aut = kwargs_aut.get('request')
        if request_aut:
            UserLoginHistoryAut.objects.create(
                user_aut=user_aut,
                login_method_aut='steam_aut',
                ip_address_aut=request_aut.META.get('REMOTE_ADDR', ''),
                user_agent_aut=request_aut.META.get('HTTP_USER_AGENT', ''),
                success_aut=True
            )
        
        response_aut['user'] = user_aut
        return response_aut

class SteamJWTAuthBackendAut:
    def authenticate_aut(self, request_aut=None, steam_id_aut=None):
        try:
            user_aut = CustomUserAut.objects.get(steam_id_aut=steam_id_aut)
            return user_aut
        except CustomUserAut.DoesNotExist:
            return None
    
    def get_user_aut(self, user_id_aut):
        try:
            return CustomUserAut.objects.get(pk=user_id_aut)
        except CustomUserAut.DoesNotExist:
            return None