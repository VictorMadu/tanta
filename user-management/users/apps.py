from django.apps import AppConfig

class MyAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'notifications' 

    def ready(self):
        from . import rabbitmq_consumer
        rabbitmq_consumer.Command().handle()
