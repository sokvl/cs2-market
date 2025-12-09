from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from .models import Transaction, Notification
from api.signals import payment_successful
from django.contrib.auth import get_user_model
class TransactionDummy:
    pass

@receiver(pre_save, sender=Transaction)
def update_closed_date(sender, instance, **kwargs):
    if instance.is_closed and not instance.closed_date:
        instance.closed_date = timezone.now()
        payment_successful.send(sender=TransactionDummy, user=instance.offer.owner.steam_id, amount=instance.offer.price)

@receiver(post_save, sender=Transaction)
def handle_transaction_save(sender, instance, created, **kwargs):
    if created and instance.offer.is_active:
        instance.offer.is_active = False
        instance.offer.save()
        payment_successful.send(sender=TransactionDummy, user=instance.buyer.steam_id, amount=-instance.offer.price)


        item = instance.offer.item
        message = (f"Your item {item.item_name} "
                   f"{'Quantity: ' + str(instance.offer.quantity) if not item.condition else item.condition} has been sold! "
                   f"Please, deliver to: {instance.buyer.steam_tradelink} ")
        
        Notification.objects.create(
            transaction=instance,
            message=message,
            active=True
        )

@receiver(post_delete, sender=Transaction)
def handle_transaction_delete(sender, instance, **kwargs):
    if instance.offer:
        instance.offer.is_active = True
        instance.offer.save()