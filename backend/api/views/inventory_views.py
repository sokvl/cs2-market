from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import os
import requests
from urllib.parse import quote
from offers.models import Item, Offer
from django.contrib.auth import get_user_model

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_inventory(request, user_id):
    try:
        SA_KEY = os.getenv('STEAMAPI_KEY')
        if (user_id == None):
            return Response({'Error': 'Provide user_id param'}, status=400)
        try:
            user = get_user_model().objects.get(steam_id=user_id)
        except get_user_model().DoesNotExist:
            return Response({'Error': 'This user has never been created.'}, status=400)

        data = requests.get(f"https://www.steamwebapi.com/steam/api/inventory?key={SA_KEY}&steam_id={user_id}&sort=price_max&currency=USD")
        return JsonResponse({'inventory': data.json()}, status=200)            
    except Exception as e:
        return JsonResponse({'error': str(e), "req": request.data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_item_details(request):
    try:
        inspect_link = request.data["inspect_link"]
        SA_KEY = os.getenv('STEAMAPI_KEY')
        if (inspect_link == None):
            return Response({'Error': 'Provide inspect_link param'}, status=400)

        data = requests.get(f"https://www.steamwebapi.com/float/api/item?key={SA_KEY}&url={inspect_link}")
        return JsonResponse({'item_details': data.json()}, status=200)
    except Exception as e:
        return Response({'error': str(e), "req": request.data})

