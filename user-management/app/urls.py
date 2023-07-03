from django.urls import path, include
from users.views import UserRegistrationView, user_details
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
   path('api/register', UserRegistrationView.as_view(), name='register'),
    path('api/token', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/user-details', user_details, name='user_details'),
]
