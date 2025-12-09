from django.contrib import admin
from .models import User, Wallet
# Register your models here.

class UserAdmin(admin.ModelAdmin):
    ordering = ['user_id']

admin.site.register(User, UserAdmin)
admin.site.register(Wallet)