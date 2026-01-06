from django.db import models # pyright: ignore[reportMissingModuleSource]
from django.contrib.auth.models import User # pyright: ignore[reportMissingModuleSource]
from django.core.validators import MinValueValidator, MaxValueValidator # pyright: ignore[reportMissingModuleSource]

class ItemCategoryFep(models.Model):
    name_fep = models.CharField(max_length=100, unique=True)
    slug_fep = models.SlugField(max_length=100, unique=True)
    description_fep = models.TextField(blank=True)
    parent_fep = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children_fep')
    created_at_fep = models.DateTimeField(auto_now_add=True)
    
    class MetaFep:
        verbose_name_plural = 'Item Categories'
        ordering = ['name_fep']
    
    def __str__(self):
        return self.name_fep
    
    def get_full_path_fep(self):
        if self.parent_fep:
            return f"{self.parent_fep.get_full_path_fep()} > {self.name_fep}"
        return self.name_fep

class ItemFep(models.Model):
    STATUS_CHOICES_FEP = [
        ('draft_fep', 'Draft'),
        ('active_fep', 'Active'),
        ('sold_fep', 'Sold'),
        ('reserved_fep', 'Reserved'),
        ('expired_fep', 'Expired'),
    ]
    
    CONDITION_CHOICES_FEP = [
        ('new_fep', 'New'),
        ('like_new_fep', 'Like New'),
        ('good_fep', 'Good'),
        ('fair_fep', 'Fair'),
        ('poor_fep', 'Poor'),
    ]
    
    title_fep = models.CharField(max_length=200)
    description_fep = models.TextField()
    seller_fep = models.ForeignKey(User, on_delete=models.CASCADE, related_name='items_for_sale_fep')
    category_fep = models.ForeignKey(ItemCategoryFep, on_delete=models.PROTECT, related_name='items_fep')
    price_fep = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    condition_fep = models.CharField(max_length=20, choices=CONDITION_CHOICES_FEP, default='good_fep')
    status_fep = models.CharField(max_length=20, choices=STATUS_CHOICES_FEP, default='draft_fep')
    quantity_fep = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    location_fep = models.CharField(max_length=200)
    latitude_fep = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude_fep = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    views_fep = models.PositiveIntegerField(default=0)
    favorites_fep = models.PositiveIntegerField(default=0)
    is_negotiable_fep = models.BooleanField(default=False)
    is_shippable_fep = models.BooleanField(default=True)
    shipping_cost_fep = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    tags_fep = models.JSONField(default=list, blank=True)
    metadata_fep = models.JSONField(default=dict, blank=True)
    created_at_fep = models.DateTimeField(auto_now_add=True)
    updated_at_fep = models.DateTimeField(auto_now=True)
    published_at_fep = models.DateTimeField(null=True, blank=True)
    expires_at_fep = models.DateTimeField(null=True, blank=True)
    
    class MetaFep:
        ordering = ['-created_at_fep']
        indexes = [
            models.Index(fields=['status_fep', 'published_at_fep']),
            models.Index(fields=['category_fep', 'price_fep']),
            models.Index(fields=['seller_fep', 'created_at_fep']),
            models.Index(fields=['title_fep'], name='title_idx_fep'),
        ]
    
    def __str__(self):
        return f"{self.title_fep} - ${self.price_fep}"
    
    def increment_views_fep(self):
        self.views_fep += 1
        self.save(update_fields=['views_fep'])
    
    def increment_favorites_fep(self):
        self.favorites_fep += 1
        self.save(update_fields=['favorites_fep'])
    
    def get_full_price_fep(self):
        return self.price_fep + self.shipping_cost_fep
    
    def is_available_fep(self):
        return self.status_fep == 'active_fep' and self.quantity_fep > 0
    
    def mark_as_sold_fep(self):
        self.status_fep = 'sold_fep'
        self.save(update_fields=['status_fep'])

class ItemImageFep(models.Model):
    item_fep = models.ForeignKey(ItemFep, on_delete=models.CASCADE, related_name='images_fep')
    image_fep = models.ImageField(upload_to='items/images/')
    alt_text_fep = models.CharField(max_length=200, blank=True)
    is_primary_fep = models.BooleanField(default=False)
    order_fep = models.PositiveIntegerField(default=0)
    created_at_fep = models.DateTimeField(auto_now_add=True)
    
    class MetaFep:
        ordering = ['order_fep', 'created_at_fep']
        unique_together = ['item_fep', 'order_fep']
    
    def __str__(self):
        return f"Image for {self.item_fep.title_fep}"

class ItemFavoriteFep(models.Model):
    user_fep = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorite_items_fep')
    item_fep = models.ForeignKey(ItemFep, on_delete=models.CASCADE, related_name='favorited_by_fep')
    created_at_fep = models.DateTimeField(auto_now_add=True)
    
    class MetaFep:
        unique_together = ['user_fep', 'item_fep']
        ordering = ['-created_at_fep']
    
    def __str__(self):
        return f"{self.user_fep.username} favorites {self.item_fep.title_fep}"

class ItemSearchHistoryFep(models.Model):
    user_fep = models.ForeignKey(User, on_delete=models.CASCADE, related_name='search_history_fep', null=True, blank=True)
    query_fep = models.CharField(max_length=500)
    filters_fep = models.JSONField(default=dict, blank=True)
    result_count_fep = models.PositiveIntegerField(default=0)
    created_at_fep = models.DateTimeField(auto_now_add=True)
    
    class MetaFep:
        ordering = ['-created_at_fep']
    
    def __str__(self):
        return f"Search: {self.query_fep}"