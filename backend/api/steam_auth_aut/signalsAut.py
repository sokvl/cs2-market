from django.db.models.signals import post_save # pyright: ignore[reportMissingModuleSource]
from django.dispatch import receiver # pyright: ignore[reportMissingModuleSource]
from django.contrib.auth import get_user_model # pyright: ignore[reportMissingModuleSource]
from .models import UserLoginHistoryAut # pyright: ignore[reportMissingImports]

UserAut = get_user_model()

@receiver(post_save, sender=UserAut)
def create_user_profile_aut(sender_aut, instance_aut, created_aut, **kwargs_aut):
    if created_aut:
        # Initialize user profile or perform other setup
        pass

@receiver(post_save, sender=UserLoginHistoryAut)
def update_user_login_stats_aut(sender_aut, instance_aut, created_aut, **kwargs_aut):
    if created_aut and instance_aut.success_aut:
        instance_aut.user_aut.increment_login_count_aut()