from django.contrib import admin
from .models import Transaction, Notification, Rating

admin.site.register(Transaction)
admin.site.register(Notification)
admin.site.register(Rating)