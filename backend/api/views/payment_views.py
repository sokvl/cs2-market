from django.http import HttpResponse
from django.shortcuts import redirect
import requests
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from rest_framework.decorators import api_view
from api.signals import payment_successful
import stripe
import os
import json

class StripePaymentSender:
    pass

@csrf_exempt
@api_view(['GET'])
def create_checkout_session(request, amount, user_id):
    try:
        domain_url = 'http://localhost:3001/'
        stripe.api_key = os.getenv('SECRET_STRIPE_API_KEY')
        checkout_session = stripe.checkout.Session.create(
            success_url=domain_url + 'success?session_id={CHECKOUT_SESSION_ID}/',
            cancel_url=domain_url + 'cancelled/',
            payment_method_types=['card'],
            mode='payment',
            customer=stripe.Customer.create(metadata={'user_sid':user_id}),
            line_items=[{
                'price_data': {
                    'product_data': {'name': 'Balance refill'},
                    'currency': 'usd',
                    'unit_amount': amount*100,
                },
                'quantity': 1
            }]
        )
        return Response({'sessionId': checkout_session['id']})
    except Exception as e:
        return Response({'error': str(e), "req": request.data})


@csrf_exempt
def stripe_webhook(request):
  payload = request.body
  event = None
  signature_header = request.META['HTTP_STRIPE_SIGNATURE']

  try:
    event = stripe.Event.construct_from(
      json.loads(payload), os.getenv('STRIPE_ENDPOINT_SECRET')
    )
  except ValueError as e:
    return HttpResponse(status=400)

  if event.type == 'payment_intent.succeeded':
    payment_intent = event.data.object 
    customer_id = event.data.object.customer
    customer = stripe.Customer.retrieve(customer_id)
    u_id = customer.metadata.user_sid
    payment_successful.send(sender=StripePaymentSender, user=u_id, amount=(payment_intent.amount/100))

  return HttpResponse(status=200)