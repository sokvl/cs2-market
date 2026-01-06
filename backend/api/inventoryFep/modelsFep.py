from django.db import models # pyright: ignore[reportMissingModuleSource]
from django.contrib.auth.models import User # pyright: ignore[reportMissingModuleSource]

class InventoryItemFep(models.Model):
    steam_id_fep = models.CharField(max_length=100)
    app_id_fep = models.IntegerField()
    name_fep = models.CharField(max_length=255)
    quantity_fep = models.IntegerField(default=1)
    tradable_fep = models.BooleanField(default=False)
    marketable_fep = models.BooleanField(default=False)
    type_fep = models.CharField(max_length=50, null=True, blank=True)
    rarity_fep = models.CharField(max_length=50, null=True, blank=True)
    image_url_fep = models.URLField(null=True, blank=True)
    last_updated_fep = models.DateTimeField(auto_now=True)
    user_fep = models.ForeignKey(User, on_delete=models.CASCADE, related_name='inventory_items_fep')

    class MetaFep:
        ordering = ['-last_updated_fep']
        indexes = [
            models.Index(fields=['user_fep', 'last_updated_fep']),
            models.Index(fields=['app_id_fep', 'type_fep']),
        ]

    def __str__(self):
        return f"{self.name_fep} ({self.steam_id_fep})"
    
    def is_tradable_now_fep(self):
        return self.tradable_fep and self.marketable_fep
    
    def get_full_name_fep(self):
        return f"{self.name_fep} - {self.type_fep}"