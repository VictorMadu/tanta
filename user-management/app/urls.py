from django.urls import path, include
from features.users.views import UserRegistrationView, user_details
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
   path('api/auth/register', UserRegistrationView.as_view(), name='register'),
    path('api/auth/token', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/users/details', user_details, name='user_details'),
]
