import pika
import json
from django.core.management.base import BaseCommand
from django.conf import settings
from users.models import User
from .utils import send_email, send_sms


class Command(BaseCommand):

    def handle(self, *args, **options):
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=settings.RABBITMQ_HOST)
        )
        channel = connection.channel()

        channel.queue_declare(queue=settings.RABBITMQ_QUEUE)

        def callback(ch, method, properties, body):
            try:
                payload = json.loads(body)
                user_id = payload.get('user_id')
                message = payload.get('message')
                notification_type = payload.get('notification_type')

                user = User.objects.get(id=user_id)
                if notification_type == 'email':
                    email = user.email
                    send_email(email, message)
                elif notification_type == 'mobile':
                    mobile_number = user.mobile_number
                    send_sms(mobile_number, message)

                ch.basic_ack(delivery_tag=method.delivery_tag)
            except Exception as e:
                print(f"Error processing message: {str(e)}")
                ch.basic_reject(delivery_tag=method.delivery_tag, requeue=False)

        channel.basic_consume(queue=settings.RABBITMQ_QUEUE, on_message_callback=callback)

        print('RabbitMQ consumer started. Press CTRL+C to exit.')
        channel.start_consuming()
