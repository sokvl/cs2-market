from django.db import models # pyright: ignore[reportMissingModuleSource]
from django.contrib.auth.models import AbstractUser, BaseUserManager # pyright: ignore[reportMissingModuleSource]
from django.utils import timezone # pyright: ignore[reportMissingModuleSource]
from django.core.validators import MinValueValidator, MaxValueValidator # pyright: ignore[reportMissingModuleSource]

class CustomUserManagerAut(BaseUserManager):
    def create_user_aut(self, username_aut, email_aut=None, password_aut=None, **extra_fields_aut):
        if not username_aut:
            raise ValueError('The Username field must be set')
        email_aut = self.normalize_email(email_aut)
        user_aut = self.model(username_aut=username_aut, email_aut=email_aut, **extra_fields_aut)
        user_aut.set_password(password_aut)
        user_aut.save(using=self._db)
        return user_aut
    
    def create_superuser_aut(self, username_aut, email_aut=None, password_aut=None, **extra_fields_aut):
        extra_fields_aut.setdefault('is_staff_aut', True)
        extra_fields_aut.setdefault('is_superuser_aut', True)
        extra_fields_aut.setdefault('is_active_aut', True)
        
        return self.create_user_aut(username_aut, email_aut, password_aut, **extra_fields_aut)

class CustomUserAut(AbstractUser):
    steam_id_aut = models.CharField(max_length=100, unique=True, null=True, blank=True)
    steam_username_aut = models.CharField(max_length=100, null=True, blank=True)
    steam_profile_url_aut = models.URLField(max_length=500, null=True, blank=True)
    steam_avatar_aut = models.URLField(max_length=500, null=True, blank=True)
    steam_avatar_medium_aut = models.URLField(max_length=500, null=True, blank=True)
    steam_avatar_full_aut = models.URLField(max_length=500, null=True, blank=True)
    
    # Additional fields
    is_email_verified_aut = models.BooleanField(default=False)
    email_verification_token_aut = models.CharField(max_length=100, null=True, blank=True)
    email_verification_sent_at_aut = models.DateTimeField(null=True, blank=True)
    
    # Privacy settings
    profile_visibility_aut = models.CharField(
        max_length=20,
        choices=[
            ('public_aut', 'Public'),
            ('friends_only_aut', 'Friends Only'),
            ('private_aut', 'Private')
        ],
        default='public_aut'
    )
    
    # Statistics
    login_count_aut = models.PositiveIntegerField(default=0)
    last_login_ip_aut = models.GenericIPAddressField(null=True, blank=True)
    timezone_aut = models.CharField(max_length=50, default='UTC')
    
    # Steam-specific
    steam_country_code_aut = models.CharField(max_length=10, null=True, blank=True)
    steam_state_code_aut = models.CharField(max_length=10, null=True, blank=True)
    steam_city_id_aut = models.IntegerField(null=True, blank=True)
    steam_created_at_aut = models.DateTimeField(null=True, blank=True)
    
    objects_aut = CustomUserManagerAut()
    
    class MetaAut:
        verbose_name = 'Steam User'
        verbose_name_plural = 'Steam Users'
        indexes = [
            models.Index(fields=['steam_id_aut']),
            models.Index(fields=['username_aut']),
            models.Index(fields=['email_aut']),
        ]
    
    def __str__(self):
        return f"{self.username_aut} ({self.steam_id_aut or 'No Steam'})"
    
    def increment_login_count_aut(self):
        self.login_count_aut += 1
        self.save(update_fields=['login_count_aut'])
    
    def update_steam_data_aut(self, steam_data_aut):
        self.steam_username_aut = steam_data_aut.get('personaname')
        self.steam_profile_url_aut = steam_data_aut.get('profileurl')
        self.steam_avatar_aut = steam_data_aut.get('avatar')
        self.steam_avatar_medium_aut = steam_data_aut.get('avatarmedium')
        self.steam_avatar_full_aut = steam_data_aut.get('avatarfull')
        self.steam_country_code_aut = steam_data_aut.get('loccountrycode')
        self.steam_state_code_aut = steam_data_aut.get('locstatecode')
        self.steam_city_id_aut = steam_data_aut.get('loccityid')
        self.save()

class SteamLoginSessionAut(models.Model):
    user_aut = models.ForeignKey(CustomUserAut, on_delete=models.CASCADE, related_name='steam_sessions_aut')
    session_key_aut = models.CharField(max_length=100, unique=True)
    ip_address_aut = models.GenericIPAddressField()
    user_agent_aut = models.TextField()
    created_at_aut = models.DateTimeField(auto_now_add=True)
    expires_at_aut = models.DateTimeField()
    is_active_aut = models.BooleanField(default=True)
    
    class MetaAut:
        ordering = ['-created_at_aut']
        indexes = [
            models.Index(fields=['session_key_aut']),
            models.Index(fields=['user_aut', 'created_at_aut']),
        ]
    
    def __str__(self):
        return f"Steam session for {self.user_aut.username_aut}"
    
    def is_expired_aut(self):
        return timezone.now() > self.expires_at_aut

class RefreshTokenAut(models.Model):
    user_aut = models.ForeignKey(CustomUserAut, on_delete=models.CASCADE, related_name='refresh_tokens_aut')
    token_aut = models.CharField(max_length=500, unique=True)
    jti_aut = models.CharField(max_length=100, unique=True)  # JWT ID for blacklisting
    created_at_aut = models.DateTimeField(auto_now_add=True)
    expires_at_aut = models.DateTimeField()
    is_revoked_aut = models.BooleanField(default=False)
    ip_address_aut = models.GenericIPAddressField(null=True, blank=True)
    user_agent_aut = models.TextField(null=True, blank=True)
    
    class MetaAut:
        ordering = ['-created_at_aut']
        indexes = [
            models.Index(fields=['token_aut']),
            models.Index(fields=['user_aut', 'expires_at_aut']),
            models.Index(fields=['jti_aut']),
        ]
    
    def __str__(self):
        return f"Refresh token for {self.user_aut.username_aut}"
    
    def is_valid_aut(self):
        return not self.is_revoked_aut and timezone.now() < self.expires_at_aut

class SteamAPITokenAut(models.Model):
    user_aut = models.ForeignKey(CustomUserAut, on_delete=models.CASCADE, related_name='steam_api_tokens_aut')
    token_aut = models.CharField(max_length=100)
    is_active_aut = models.BooleanField(default=True)
    created_at_aut = models.DateTimeField(auto_now_add=True)
    last_used_at_aut = models.DateTimeField(null=True, blank=True)
    usage_count_aut = models.PositiveIntegerField(default=0)
    
    class MetaAut:
        ordering = ['-created_at_aut']
    
    def __str__(self):
        return f"Steam API token for {self.user_aut.username_aut}"
    
    def increment_usage_aut(self):
        self.usage_count_aut += 1
        self.last_used_at_aut = timezone.now()
        self.save(update_fields=['usage_count_aut', 'last_used_at_aut'])

class UserLoginHistoryAut(models.Model):
    user_aut = models.ForeignKey(CustomUserAut, on_delete=models.CASCADE, related_name='login_history_aut')
    login_method_aut = models.CharField(
        max_length=20,
        choices=[
            ('steam_aut', 'Steam'),
            ('email_aut', 'Email'),
            ('admin_aut', 'Admin')
        ]
    )
    ip_address_aut = models.GenericIPAddressField()
    user_agent_aut = models.TextField()
    location_aut = models.CharField(max_length=100, null=True, blank=True)
    success_aut = models.BooleanField(default=True)
    created_at_aut = models.DateTimeField(auto_now_add=True)
    
    class MetaAut:
        ordering = ['-created_at_aut']
        verbose_name_plural = 'User Login Histories'
    
    def __str__(self):
        return f"{self.user_aut.username_aut} login at {self.created_at_aut}"