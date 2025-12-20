from django.shortcuts import redirect
from steamauth import auth, get_uid
from api.serializers.User_serializer import UserSerializer
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from api.serializers.Custom_token_serializer import MyTokenObtainPairSerializer

import os
import requests

APP_URL = '/login/bridge'

def steam_login(request):
    return auth('/callback', use_ssl=False)

def steam_login_callback(request):
    user = get_uid(request.GET)
    if user is None:
        return redirect('/failed')
    try:
        db_user = get_user_model().objects.get(steam_id=user)
    except get_user_model().DoesNotExist:
        STEAMAPI_KEY = os.getenv('STEAMAPI_KEY')
        response = requests.get(
            'http://steamwebapi.com/steam/api/profile',
            params={
                'id': user,
                'key': STEAMAPI_KEY
            }
        )
        response = response.json()
        print(response)
        serializer = UserSerializer(data={
            'username': response['personaname'],
            'steam_id': user,
            'avatar_url': response['avatar'],
            'is_admin': False
        })
        print(serializer)

        if serializer.is_valid():
            db_user = serializer.save()
        
            refresh = MyTokenObtainPairSerializer.get_token(db_user)    
            response = redirect(APP_URL)
            response.set_cookie(key='refresh', value=str(refresh), samesite='Lax', secure=True)
            response.set_cookie(key='access', value=str(refresh.access_token), samesite='Lax', secure=True)
     
        return response
    if(db_user):
        refresh = MyTokenObtainPairSerializer.get_token(db_user)
        response = redirect(APP_URL)
        response.set_cookie(key='refresh', value=str(refresh), samesite='Lax', secure=True)
        response.set_cookie(key='access', value=str(refresh.access_token), samesite='Lax', secure=True)
        return response   
    

def steam_bridge(request):
    response = redirect('http://localhost:3000/auth_success')
    return response