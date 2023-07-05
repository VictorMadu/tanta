from rest_framework import generics
from rest_framework.permissions import AllowAny
from .serializers import  UserSerializer
from .models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
from app.services import authorization_service


class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (AllowAny,)


@api_view(['GET'])
def user_details(request):
    token = request.headers.get('Authorization', '').split(' ')[-1]  
    user = authorization_service.get_user_data(token)
    if user:
        data = {
            'email': user.email,
            'id': user.pk,
            'mobile_number': user.mobile_number
        }
        return Response(data)
    else:
        return Response({'detail': 'Invalid token'}, status=401)


