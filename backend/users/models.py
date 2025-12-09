from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth import get_user_model

class User(AbstractUser):
    user_id = models.AutoField(primary_key=True)
    username = models.TextField(unique=True)
    steam_id = models.TextField()
    avatar_url = models.TextField(blank=True, null=True)
    steam_tradelink = models.TextField(blank=True, null=True)
    is_admin = models.BooleanField(default=False)
    password = models.CharField(max_length=128, blank=True, default="")
    class Meta:
        db_table = 'Users'

    def __str__(self):
        return f'{self.username} id: {self.user_id}'


class Wallet(models.Model):
    wallet_id = models.AutoField(primary_key=True)
    user = models.OneToOneField(get_user_model(), on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    class Meta:
        db_table = 'Wallets'

    def __str__(self):
        return f'{self.user}: {self.balance}'
