from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Transaction, Rating, Notification

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'

class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = '__all__'

    def get_user(self, obj):
        return obj.transaction.offer.owner.username