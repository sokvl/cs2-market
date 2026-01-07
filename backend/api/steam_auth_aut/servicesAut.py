import json
import hashlib
import time
from datetime import datetime, timedelta
from django.core.cache import cache # pyright: ignore[reportMissingModuleSource]
from django.conf import settings # pyright: ignore[reportMissingModuleSource]
from django.utils import timezone # pyright: ignore[reportMissingModuleSource]
from .models import CustomUserAut, SteamLoginSessionAut, SteamAPITokenAut # pyright: ignore[reportMissingImports]
import requests # pyright: ignore[reportMissingModuleSource]

class SteamAuthServiceAut:
    @staticmethod
    def generate_state_token_aut():
        import secrets
        state_token_aut = secrets.token_urlsafe(32)
        
        # Store state token in cache with 10 minute expiration
        cache_key_aut = f"steam_state_{state_token_aut}"
        cache.set(cache_key_aut, True, timeout=600)
        
        return state_token_aut
    
    @staticmethod
    def validate_state_token_aut(state_token_aut):
        cache_key_aut = f"steam_state_{state_token_aut}"
        is_valid_aut = cache.get(cache_key_aut)
        
        if is_valid_aut:
            # Remove token after validation to prevent reuse
            cache.delete(cache_key_aut)
            return True
        
        return False
    
    @staticmethod
    def create_login_session_aut(user_aut, request_aut):
        import secrets
        
        session_key_aut = secrets.token_urlsafe(64)
        expires_at_aut = timezone.now() + timedelta(days=7)
        
        session_aut = SteamLoginSessionAut.objects.create(
            user_aut=user_aut,
            session_key_aut=session_key_aut,
            ip_address_aut=request_aut.META.get('REMOTE_ADDR', ''),
            user_agent_aut=request_aut.META.get('HTTP_USER_AGENT', ''),
            expires_at_aut=expires_at_aut
        )
        
        # Store session in cache for quick access
        cache_key_aut = f"steam_session_{session_key_aut}"
        cache.set(cache_key_aut, {
            'user_id_aut': user_aut.id_aut,
            'session_id_aut': session_aut.id_aut,
            'expires_at_aut': expires_at_aut.isoformat()
        }, timeout=7 * 24 * 3600)  # 7 days
        
        return session_key_aut
    
    @staticmethod
    def validate_session_aut(session_key_aut):
        cache_key_aut = f"steam_session_{session_key_aut}"
        cached_session_aut = cache.get(cache_key_aut)
        
        if cached_session_aut:
            return CustomUserAut.objects.get(id_aut=cached_session_aut['user_id_aut'])
        
        try:
            session_aut = SteamLoginSessionAut.objects.get(
                session_key_aut=session_key_aut,
                is_active_aut=True
            )
            
            if session_aut.is_expired_aut():
                session_aut.is_active_aut = False
                session_aut.save()
                return None
            
            # Refresh cache
            cache.set(cache_key_aut, {
                'user_id_aut': session_aut.user_aut.id_aut,
                'session_id_aut': session_aut.id_aut,
                'expires_at_aut': session_aut.expires_at_aut.isoformat()
            }, timeout=7 * 24 * 3600)
            
            return session_aut.user_aut
            
        except SteamLoginSessionAut.DoesNotExist:
            return None
    
    @staticmethod
    def invalidate_session_aut(session_key_aut):
        try:
            session_aut = SteamLoginSessionAut.objects.get(session_key_aut=session_key_aut)
            session_aut.is_active_aut = False
            session_aut.save()
            
            # Remove from cache
            cache_key_aut = f"steam_session_{session_key_aut}"
            cache.delete(cache_key_aut)
            
            return True
        except SteamLoginSessionAut.DoesNotExist:
            return False

class SteamAPIServiceAut:
    @staticmethod
    def get_player_summaries_aut(steam_ids_aut):
        if not steam_ids_aut:
            return []
        
        api_key_aut = getattr(settings, 'STEAM_API_KEY_AUT', '')
        if not api_key_aut:
            return []
        
        # Convert to comma-separated string if list
        if isinstance(steam_ids_aut, list):
            steam_ids_str_aut = ','.join(map(str, steam_ids_aut))
        else:
            steam_ids_str_aut = str(steam_ids_aut)
        
        cache_key_aut = f"steam_player_{hashlib.md5(steam_ids_str_aut.encode()).hexdigest()}"
        cached_data_aut = cache.get(cache_key_aut)
        
        if cached_data_aut:
            return cached_data_aut
        
        try:
            url_aut = "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/"
            params_aut = {
                'key': api_key_aut,
                'steamids': steam_ids_str_aut
            }
            
            response_aut = requests.get(url_aut, params=params_aut, timeout=10)
            if response_aut.status_code == 200:
                data_aut = response_aut.json()
                players_aut = data_aut.get('response', {}).get('players', [])
                
                # Cache for 5 minutes
                cache.set(cache_key_aut, players_aut, timeout=300)
                return players_aut
                
        except Exception as e_aut:
            print(f"Steam API error: {e_aut}")
        
        return []
    
    @staticmethod
    def get_friend_list_aut(steam_id_aut):
        api_key_aut = getattr(settings, 'STEAM_API_KEY_AUT', '')
        if not api_key_aut:
            return []
        
        cache_key_aut = f"steam_friends_{steam_id_aut}"
        cached_data_aut = cache.get(cache_key_aut)
        
        if cached_data_aut:
            return cached_data_aut
        
        try:
            url_aut = "https://api.steampowered.com/ISteamUser/GetFriendList/v0001/"
            params_aut = {
                'key': api_key_aut,
                'steamid': steam_id_aut,
                'relationship': 'friend'
            }
            
            response_aut = requests.get(url_aut, params=params_aut, timeout=10)
            if response_aut.status_code == 200:
                data_aut = response_aut.json()
                friends_aut = data_aut.get('friendslist', {}).get('friends', [])
                
                # Extract friend Steam IDs
                friend_ids_aut = [friend_aut.get('steamid') for friend_aut in friends_aut]
                
                # Get friend summaries
                friend_summaries_aut = SteamAPIServiceAut.get_player_summaries_aut(friend_ids_aut)
                
                # Cache for 10 minutes
                cache.set(cache_key_aut, friend_summaries_aut, timeout=600)
                return friend_summaries_aut
                
        except Exception as e_aut:
            print(f"Steam friends API error: {e_aut}")
        
        return []
    
    @staticmethod
    def get_owned_games_aut(steam_id_aut):
        api_key_aut = getattr(settings, 'STEAM_API_KEY_AUT', '')
        if not api_key_aut:
            return []
        
        cache_key_aut = f"steam_games_{steam_id_aut}"
        cached_data_aut = cache.get(cache_key_aut)
        
        if cached_data_aut:
            return cached_data_aut
        
        try:
            url_aut = "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/"
            params_aut = {
                'key': api_key_aut,
                'steamid': steam_id_aut,
                'include_appinfo': 1,
                'include_played_free_games': 1
            }
            
            response_aut = requests.get(url_aut, params=params_aut, timeout=10)
            if response_aut.status_code == 200:
                data_aut = response_aut.json()
                games_aut = data_aut.get('response', {}).get('games', [])
                
                # Cache for 30 minutes
                cache.set(cache_key_aut, games_aut, timeout=1800)
                return games_aut
                
        except Exception as e_aut:
            print(f"Steam games API error: {e_aut}")
        
        return []

class UserServiceAut:
    @staticmethod
    def create_or_update_user_from_steam_aut(steam_data_aut):
        steam_id_aut = steam_data_aut.get('steamid')
        if not steam_id_aut:
            return None
        
        try:
            user_aut = CustomUserAut.objects.get(steam_id_aut=steam_id_aut)
            
            # Update user data
            user_aut.steam_username_aut = steam_data_aut.get('personaname', user_aut.steam_username_aut)
            user_aut.steam_profile_url_aut = steam_data_aut.get('profileurl', user_aut.steam_profile_url_aut)
            user_aut.steam_avatar_aut = steam_data_aut.get('avatar', user_aut.steam_avatar_aut)
            user_aut.steam_avatar_medium_aut = steam_data_aut.get('avatarmedium', user_aut.steam_avatar_medium_aut)
            user_aut.steam_avatar_full_aut = steam_data_aut.get('avatarfull', user_aut.steam_avatar_full_aut)
            user_aut.steam_country_code_aut = steam_data_aut.get('loccountrycode', user_aut.steam_country_code_aut)
            user_aut.steam_state_code_aut = steam_data_aut.get('locstatecode', user_aut.steam_state_code_aut)
            user_aut.steam_city_id_aut = steam_data_aut.get('loccityid', user_aut.steam_city_id_aut)
            
            user_aut.save()
            
        except CustomUserAut.DoesNotExist:
            # Create new user
            username_aut = f"steam_{steam_id_aut}"
            email_aut = f"{steam_id_aut}@steam.com"
            
            user_aut = CustomUserAut.objects.create_user_aut(
                username_aut=username_aut,
                email_aut=email_aut,
                steam_id_aut=steam_id_aut,
                steam_username_aut=steam_data_aut.get('personaname', ''),
                steam_profile_url_aut=steam_data_aut.get('profileurl', ''),
                steam_avatar_aut=steam_data_aut.get('avatar', ''),
                steam_avatar_medium_aut=steam_data_aut.get('avatarmedium', ''),
                steam_avatar_full_aut=steam_data_aut.get('avatarfull', ''),
                steam_country_code_aut=steam_data_aut.get('loccountrycode', ''),
                steam_state_code_aut=steam_data_aut.get('locstatecode', ''),
                steam_city_id_aut=steam_data_aut.get('loccityid'),
            )
        
        return user_aut