import requests # pyright: ignore[reportMissingModuleSource]
import json
from django.core.cache import cache # pyright: ignore[reportMissingModuleSource]
from django.conf import settings # pyright: ignore[reportMissingModuleSource]
from django.contrib.auth.models import User # pyright: ignore[reportMissingModuleSource]
from .models import InventoryItemFep # pyright: ignore[reportMissingImports]

class SteamInventoryServiceFep:
    STEAM_API_BASE_FEP = "https://api.steampowered.com"
    
    def __init__(self):
        self.api_key_fep = settings.STEAM_API_KEY
        self.cache_timeout_fep = settings.CACHE_TIMEOUT_FEP
    
    def get_inventory_cache_key_fep(self, steam_id_fep, app_id_fep=730):
        return f"steam_inventory_{steam_id_fep}_{app_id_fep}"
    
    def fetch_steam_inventory_fep(self, steam_id_fep, app_id_fep=730):
        cache_key_fep = self.get_inventory_cache_key_fep(steam_id_fep, app_id_fep)
        
        cached_data_fep = cache.get(cache_key_fep)
        if cached_data_fep:
            return cached_data_fep
        
        try:
            url_fep = f"{self.STEAM_API_BASE_FEP}/IEconItems_{app_id_fep}/GetPlayerItems/v0001/"
            params_fep = {
                'key': self.api_key_fep,
                'SteamID': steam_id_fep
            }
            
            response_fep = requests.get(url_fep, params=params_fep)
            response_fep.raise_for_status()
            inventory_data_fep = response_fep.json()
            
            cache.set(cache_key_fep, inventory_data_fep, self.cache_timeout_fep)
            return inventory_data_fep
            
        except requests.RequestException as e_fep:
            print(f"Error fetching Steam inventory: {e_fep}")
            return None
        except json.JSONDecodeError as e_fep:
            print(f"Error parsing Steam response: {e_fep}")
            return None
    
    def sync_user_inventory_fep(self, user_fep, steam_id_fep):
        steam_data_fep = self.fetch_steam_inventory_fep(steam_id_fep)
        
        if not steam_data_fep or 'result' not in steam_data_fep:
            return False
        
        items_fep = steam_data_fep.get('result', {}).get('items', [])
        
        existing_items_fep = InventoryItemFep.objects.filter(
            user_fep=user_fep
        ).values_list('steam_id_fep', flat=True)
        
        new_items_fep = []
        for item_data_fep in items_fep:
            item_id_fep = item_data_fep.get('id')
            
            if item_id_fep not in existing_items_fep:
                new_item_fep = InventoryItemFep(
                    steam_id_fep=item_id_fep,
                    app_id_fep=item_data_fep.get('appid', 730),
                    name_fep=item_data_fep.get('market_hash_name', 'Unknown'),
                    quantity_fep=item_data_fep.get('amount', 1),
                    tradable_fep=bool(item_data_fep.get('tradable', 0)),
                    marketable_fep=bool(item_data_fep.get('marketable', 0)),
                    type_fep=item_data_fep.get('type'),
                    rarity_fep=item_data_fep.get('rarity'),
                    image_url_fep=item_data_fep.get('image_url', ''),
                    user_fep=user_fep
                )
                new_items_fep.append(new_item_fep)
        
        if new_items_fep:
            InventoryItemFep.objects.bulk_create(new_items_fep)
        
        return True
    
    def clear_inventory_cache_fep(self, steam_id_fep, app_id_fep=730):
        cache_key_fep = self.get_inventory_cache_key_fep(steam_id_fep, app_id_fep)
        cache.delete(cache_key_fep)
        return True
    
    def validate_steam_id_fep(self, steam_id_fep):
        try:
            steam_id_int_fep = int(steam_id_fep)
            return 76561197960265728 <= steam_id_int_fep <= 76561202255233023
        except ValueError:
            return False