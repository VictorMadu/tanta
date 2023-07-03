from rest_framework import generics
from rest_framework.permissions import AllowAny
from .serializers import  UserSerializer
from .models import User
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken
from django.contrib.auth import get_user_model


class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (AllowAny,)


@api_view(['GET'])
def user_details(request):
    print(" request.headers.get('Authorization', '')",  request.headers.get('Authorization', ''))
    token = request.headers.get('Authorization', '').split(' ')[-1]  
    user = get_user_details_from_token(token)
    if user:
        data = {
            'email': user.email,
            'id': user.pk,
            'mobile_number': user.mobile_number
        }
        return Response(data)
    else:
        return Response({'detail': 'Invalid token'}, status=401)


def get_user_details_from_token(token):
    try:
        access_token = AccessToken(token)
        user_id = access_token.payload['user_id']
        user = get_user_model()
        userObj = user.objects.get(pk=user_id)
        return userObj
    except (Exception):
        return None
