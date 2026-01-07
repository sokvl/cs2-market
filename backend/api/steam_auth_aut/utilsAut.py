import hashlib
import time
from datetime import datetime
from django.core.cache import cache # pyright: ignore[reportMissingModuleSource]
from django.conf import settings # pyright: ignore[reportMissingModuleSource]

def generate_nonce_aut():
    """Generate a unique nonce for authentication"""
    timestamp_aut = str(time.time())
    random_bytes_aut = hashlib.sha256(timestamp_aut.encode()).hexdigest()[:16]
    return random_bytes_aut

def validate_nonce_aut(nonce_aut):
    """Validate and consume a nonce"""
    cache_key_aut = f"nonce_{nonce_aut}"
    
    if cache.get(cache_key_aut):
        return False  # Nonce already used
    
    cache.set(cache_key_aut, True, timeout=300)  # 5 minutes
    return True

def get_user_ip_aut(request_aut):
    """Extract user IP address from request"""
    x_forwarded_for_aut = request_aut.META.get('HTTP_X_FORWARDED_FOR')
    
    if x_forwarded_for_aut:
        ip_aut = x_forwarded_for_aut.split(',')[0]
    else:
        ip_aut = request_aut.META.get('REMOTE_ADDR')
    
    return ip_aut

def format_steam_id_aut(steam_id_aut):
    """Format Steam ID consistently"""
    if not steam_id_aut:
        return None
    
    # Convert to string and ensure it's numeric
    steam_id_str_aut = str(steam_id_aut).strip()
    if steam_id_str_aut.isdigit():
        return steam_id_str_aut
    
    return None

def generate_steam_api_signature_aut(params_aut):
    """Generate signature for Steam API calls (if needed)"""
    # This is a placeholder for Steam Web API signature generation
    # Steam typically uses API keys in query params, not signatures
    return ""