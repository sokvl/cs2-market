from rest_framework import serializers

from transactions.models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
    def create(self, validated_data):
        item = Notification.objects.create(**validated_data)
        return item
