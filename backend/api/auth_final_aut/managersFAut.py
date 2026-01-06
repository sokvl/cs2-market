from django.contrib.auth.models import BaseUserManager # pyright: ignore[reportMissingModuleSource]
from django.utils import timezone # pyright: ignore[reportMissingModuleSource]

class CustomUserManagerAut(BaseUserManager):
    def create_user_aut(self, email_aut, username_aut, password_aut=None, **extra_fields_aut):
        if not email_aut:
            raise ValueError('The Email field must be set')
        if not username_aut:
            raise ValueError('The Username field must be set')
        
        email_aut = self.normalize_email(email_aut)
        user_aut = self.model(email_aut=email_aut, username_aut=username_aut, **extra_fields_aut)
        
        if password_aut:
            user_aut.set_password(password_aut)
        else:
            user_aut.set_unusable_password()
        
        user_aut.save(using=self._db)
        return user_aut
    
    def create_superuser_aut(self, email_aut, username_aut, password_aut=None, **extra_fields_aut):
        extra_fields_aut.setdefault('is_staff_aut', True)
        extra_fields_aut.setdefault('is_superuser_aut', True)
        extra_fields_aut.setdefault('is_active_aut', True)
        extra_fields_aut.setdefault('is_verified_aut', True)
        
        # Assign admin role if exists
        from .models import RoleAut # pyright: ignore[reportMissingImports]
        try:
            admin_role_aut = RoleAut.objects.get(code_aut='admin_aut')
            extra_fields_aut['role_aut'] = admin_role_aut
        except RoleAut.DoesNotExist:
            pass
        
        return self.create_user_aut(email_aut, username_aut, password_aut, **extra_fields_aut)