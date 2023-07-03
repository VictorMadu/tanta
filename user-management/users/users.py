from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    mobile_number = models.CharField(max_length=15, unique=True)
