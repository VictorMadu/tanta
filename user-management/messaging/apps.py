from django.apps import AppConfig

from django.dispatch import receiver
from django.core.signals import request_finished
from django.core.signals import request_started


class MyAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'messaging' 

