from django.db import models # pyright: ignore[reportMissingModuleSource]
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin # pyright: ignore[reportMissingModuleSource]
from django.utils import timezone # pyright: ignore[reportMissingModuleSource]
from django.core.validators import MinLengthValidator, RegexValidator # pyright: ignore[reportMissingModuleSource]
from django.core.mail import send_mail # pyright: ignore[reportMissingModuleSource]
from .managers import CustomUserManagerAut # pyright: ignore[reportMissingImports]

class RoleAut(models.Model):
    ROLE_CHOICES_AUT = [
        ('admin_aut', 'Administrator'),
        ('moderator_aut', 'Moderator'),
        ('user_aut', 'Regular User'),
        ('guest_aut', 'Guest'),
        ('api_client_aut', 'API Client'),
    ]
    
    name_aut = models.CharField(max_length=50, choices=ROLE_CHOICES_AUT, unique=True)
    code_aut = models.CharField(max_length=50, unique=True)
    description_aut = models.TextField(blank=True)
    permissions_aut = models.JSONField(default=list, blank=True)
    is_active_aut = models.BooleanField(default=True)
    created_at_aut = models.DateTimeField(auto_now_add=True)
    updated_at_aut = models.DateTimeField(auto_now=True)
    
    class MetaAut:
        ordering = ['name_aut']
        indexes = [
            models.Index(fields=['code_aut']),
            models.Index(fields=['is_active_aut']),
        ]
    
    def __str__(self):
        return self.get_name_aut_display()
    
    def has_permission_aut(self, permission_code_aut):
        return permission_code_aut in self.permissions_aut

class CustomUserAut(AbstractBaseUser, PermissionsMixin):
    username_aut = models.CharField(
        max_length=50,
        unique=True,
        validators=[
            MinLengthValidator(3),
            RegexValidator(
                regex='^[a-zA-Z0-9_]+$',
                message='Username can only contain letters, numbers, and underscores'
            )
        ]
    )
    email_aut = models.EmailField(unique=True)
    first_name_aut = models.CharField(max_length=50, blank=True)
    last_name_aut = models.CharField(max_length=50, blank=True)
    
    # Role and permissions
    role_aut = models.ForeignKey(RoleAut, on_delete=models.PROTECT, related_name='users_aut', null=True)
    custom_permissions_aut = models.JSONField(default=list, blank=True)
    
    # Account status
    is_active_aut = models.BooleanField(default=True)
    is_staff_aut = models.BooleanField(default=False)
    is_superuser_aut = models.BooleanField(default=False)
    is_verified_aut = models.BooleanField(default=False)
    email_verified_aut = models.BooleanField(default=False)
    phone_verified_aut = models.BooleanField(default=False)
    
    # Security
    mfa_enabled_aut = models.BooleanField(default=False)
    mfa_secret_aut = models.CharField(max_length=100, blank=True, null=True)
    last_password_change_aut = models.DateTimeField(auto_now_add=True)
    password_expires_at_aut = models.DateTimeField(null=True, blank=True)
    
    # Session management
    last_session_key_aut = models.CharField(max_length=100, blank=True, null=True)
    concurrent_sessions_aut = models.PositiveIntegerField(default=1)
    force_logout_aut = models.BooleanField(default=False)
    
    # Tracking
    failed_login_attempts_aut = models.PositiveIntegerField(default=0)
    last_failed_login_aut = models.DateTimeField(null=True, blank=True)
    account_locked_until_aut = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    date_joined_aut = models.DateTimeField(default=timezone.now)
    last_login_aut = models.DateTimeField(null=True, blank=True)
    last_activity_aut = models.DateTimeField(null=True, blank=True)
    
    # Additional info
    timezone_aut = models.CharField(max_length=50, default='UTC')
    language_aut = models.CharField(max_length=10, default='en')
    
    objects_aut = CustomUserManagerAut()
    
    USERNAME_FIELD = 'email_aut'
    REQUIRED_FIELDS = ['username_aut']
    
    class MetaAut:
        ordering = ['-date_joined_aut']
        indexes = [
            models.Index(fields=['email_aut']),
            models.Index(fields=['username_aut']),
            models.Index(fields=['is_active_aut']),
            models.Index(fields=['role_aut', 'is_active_aut']),
            models.Index(fields=['last_activity_aut']),
        ]
    
    def __str__(self):
        return f"{self.username_aut} ({self.email_aut})"
    
    def get_full_name_aut(self):
        return f"{self.first_name_aut} {self.last_name_aut}".strip()
    
    def get_short_name_aut(self):
        return self.username_aut
    
    def email_user_aut(self, subject_aut, message_aut, from_email_aut=None, **kwargs_aut):
        send_mail(subject_aut, message_aut, from_email_aut, [self.email_aut], **kwargs_aut)
    
    def has_role_aut(self, role_codes_aut):
        if not self.role_aut:
            return False
        
        if isinstance(role_codes_aut, str):
            role_codes_aut = [role_codes_aut]
        
        return self.role_aut.code_aut in role_codes_aut
    
    def has_permission_aut(self, permission_code_aut):
        # Check superuser
        if self.is_superuser_aut:
            return True
        
        # Check custom permissions
        if permission_code_aut in self.custom_permissions_aut:
            return True
        
        # Check role permissions
        if self.role_aut and self.role_aut.has_permission_aut(permission_code_aut):
            return True
        
        return False
    
    def increment_failed_login_aut(self):
        self.failed_login_attempts_aut += 1
        self.last_failed_login_aut = timezone.now()
        
        # Lock account after 5 failed attempts
        if self.failed_login_attempts_aut >= 5:
            self.account_locked_until_aut = timezone.now() + timezone.timedelta(minutes=15)
        
        self.save(update_fields=[
            'failed_login_attempts_aut',
            'last_failed_login_aut',
            'account_locked_until_aut'
        ])
    
    def reset_failed_logins_aut(self):
        self.failed_login_attempts_aut = 0
        self.account_locked_until_aut = None
        self.save(update_fields=[
            'failed_login_attempts_aut',
            'account_locked_until_aut'
        ])
    
    def is_account_locked_aut(self):
        if self.account_locked_until_aut:
            return timezone.now() < self.account_locked_until_aut
        return False
    
    def update_last_activity_aut(self):
        self.last_activity_aut = timezone.now()
        self.save(update_fields=['last_activity_aut'])
    
    def force_logout_all_sessions_aut(self):
        self.force_logout_aut = True
        self.save(update_fields=['force_logout_aut'])

class UserSessionAut(models.Model):
    user_aut = models.ForeignKey(CustomUserAut, on_delete=models.CASCADE, related_name='sessions_aut')
    session_key_aut = models.CharField(max_length=100, unique=True)
    user_agent_aut = models.TextField(blank=True)
    ip_address_aut = models.GenericIPAddressField()
    location_aut = models.CharField(max_length=100, blank=True)
    device_type_aut = models.CharField(max_length=50, blank=True)
    browser_aut = models.CharField(max_length=50, blank=True)
    platform_aut = models.CharField(max_length=50, blank=True)
    
    # Session state
    is_active_aut = models.BooleanField(default=True)
    created_at_aut = models.DateTimeField(auto_now_add=True)
    last_activity_aut = models.DateTimeField(auto_now=True)
    expires_at_aut = models.DateTimeField()
    logged_out_at_aut = models.DateTimeField(null=True, blank=True)
    
    # Security
    csrf_token_aut = models.CharField(max_length=100, blank=True)
    is_secure_aut = models.BooleanField(default=False)
    
    class MetaAut:
        ordering = ['-created_at_aut']
        indexes = [
            models.Index(fields=['user_aut', 'is_active_aut']),
            models.Index(fields=['session_key_aut']),
            models.Index(fields=['expires_at_aut']),
        ]
    
    def __str__(self):
        return f"Session for {self.user_aut.username_aut}"
    
    def is_expired_aut(self):
        return timezone.now() > self.expires_at_aut
    
    def deactivate_aut(self):
        self.is_active_aut = False
        self.logged_out_at_aut = timezone.now()
        self.save(update_fields=['is_active_aut', 'logged_out_at_aut'])

class APITokenAut(models.Model):
    TOKEN_TYPES_AUT = [
        ('bearer_aut', 'Bearer Token'),
        ('api_key_aut', 'API Key'),
        ('jwt_aut', 'JWT'),
        ('oauth_aut', 'OAuth2'),
    ]
    
    user_aut = models.ForeignKey(CustomUserAut, on_delete=models.CASCADE, related_name='api_tokens_aut')
    name_aut = models.CharField(max_length=100)
    token_aut = models.CharField(max_length=500, unique=True)
    token_type_aut = models.CharField(max_length=20, choices=TOKEN_TYPES_AUT, default='bearer_aut')
    jti_aut = models.CharField(max_length=100, unique=True, null=True, blank=True)  # For JWT
    
    # Scopes and permissions
    scopes_aut = models.JSONField(default=list, blank=True)
    rate_limit_aut = models.PositiveIntegerField(default=100)  
    
    # Status
    is_active_aut = models.BooleanField(default=True)
    created_at_aut = models.DateTimeField(auto_now_add=True)
    expires_at_aut = models.DateTimeField(null=True, blank=True)
    last_used_at_aut = models.DateTimeField(null=True, blank=True)
    usage_count_aut = models.PositiveIntegerField(default=0)
    
    # Security
    ip_restrictions_aut = models.JSONField(default=list, blank=True)
    user_agent_restrictions_aut = models.JSONField(default=list, blank=True)
    
    class MetaAut:
        ordering = ['-created_at_aut']
        indexes = [
            models.Index(fields=['token_aut']),
            models.Index(fields=['user_aut', 'is_active_aut']),
            models.Index(fields=['expires_at_aut']),
        ]
    
    def __str__(self):
        return f"{self.name_aut} ({self.token_type_aut})"
    
    def is_valid_aut(self):
        if not self.is_active_aut:
            return False
        
        if self.expires_at_aut and timezone.now() > self.expires_at_aut:
            return False
        
        return True
    
    def increment_usage_aut(self):
        self.usage_count_aut += 1
        self.last_used_at_aut = timezone.now()
        self.save(update_fields=['usage_count_aut', 'last_used_at_aut'])
    
    def has_scope_aut(self, scope_aut):
        return scope_aut in self.scopes_aut

class RateLimitRuleAut(models.Model):
    RATE_TYPES_AUT = [
        ('user_aut', 'Per User'),
        ('ip_aut', 'Per IP'),
        ('endpoint_aut', 'Per Endpoint'),
        ('global_aut', 'Global'),
    ]
    
    name_aut = models.CharField(max_length=100)
    rate_type_aut = models.CharField(max_length=20, choices=RATE_TYPES_AUT)
    rate_limit_aut = models.CharField(max_length=50)  # e.g., "100/hour"
    scope_aut = models.CharField(max_length=100, blank=True)  # Endpoint or group
    is_active_aut = models.BooleanField(default=True)
    description_aut = models.TextField(blank=True)
    
    class MetaAut:
        ordering = ['rate_type_aut', 'scope_aut']
    
    def __str__(self):
        return f"{self.name_aut}: {self.rate_limit_aut}"

class SecurityEventAut(models.Model):
    EVENT_TYPES_AUT = [
        ('login_success_aut', 'Login Successful'),
        ('login_failed_aut', 'Login Failed'),
        ('password_change_aut', 'Password Changed'),
        ('role_change_aut', 'Role Changed'),
        ('session_start_aut', 'Session Started'),
        ('session_end_aut', 'Session Ended'),
        ('token_created_aut', 'Token Created'),
        ('token_revoked_aut', 'Token Revoked'),
        ('rate_limit_exceeded_aut', 'Rate Limit Exceeded'),
        ('suspicious_activity_aut', 'Suspicious Activity'),
    ]
    
    user_aut = models.ForeignKey(CustomUserAut, on_delete=models.SET_NULL, null=True, blank=True)
    event_type_aut = models.CharField(max_length=50, choices=EVENT_TYPES_AUT)
    ip_address_aut = models.GenericIPAddressField()
    user_agent_aut = models.TextField(blank=True)
    details_aut = models.JSONField(default=dict, blank=True)
    severity_aut = models.CharField(
        max_length=20,
        choices=[
            ('low_aut', 'Low'),
            ('medium_aut', 'Medium'),
            ('high_aut', 'High'),
            ('critical_aut', 'Critical'),
        ],
        default='low_aut'
    )
    created_at_aut = models.DateTimeField(auto_now_add=True)
    
    class MetaAut:
        ordering = ['-created_at_aut']
        indexes = [
            models.Index(fields=['user_aut', 'event_type_aut']),
            models.Index(fields=['created_at_aut']),
            models.Index(fields=['severity_aut']),
        ]
    
    def __str__(self):
        return f"{self.get_event_type_aut_display()} - {self.user_aut or 'Anonymous'}"