from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model

def validate_token(token):
    try:
        access_token = AccessToken(token)
        user_id = access_token.payload.get('user_id')
        User = get_user_model()
        user_exists = User.objects.filter(pk=user_id).exists()
        return user_id, user_exists
    except Exception as e:
        print('Token validation error:', str(e))
        return None, False
