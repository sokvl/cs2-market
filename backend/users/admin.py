from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import User, Wallet

@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    ordering = ('id',)
    list_display = ('id', 'username', 'email', 'steam_id', 'is_active', 'is_staff')

    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Steam', {'fields': ('steam_id', 'trade_link', 'avatar_url')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'steam_id', 'password1', 'password2'),
        }),
    )

    search_fields = ('username', 'email', 'steam_id')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'balance')
