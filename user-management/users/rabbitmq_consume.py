import pika
import json
from django.core.management.base import BaseCommand
from django.conf import settings
from users.models import User
from .utils import send_email, send_sms, validate_token


class Command(BaseCommand):

    def handle(self, *args, **options):
        connection = pika.BlockingConnection(
            pika.ConnectionParameters('localhost')
        )  
        
        channel = connection.channel()
        channel.queue_declare(queue='users')

        def callback(ch, method, properties, body):
            data = json.loads(body.decode())
            token = data.get('token')
            user_id, is_valid = validate_token(token)

            response = {
                'user_id': user_id,
                'valid': is_valid
            }

            channel.basic_publish(exchange='', routing_key=properties.reply_to, properties=pika.BasicProperties(
                correlation_id=properties.correlation_id), body=json.dumps(response))
            ch.basic_ack(delivery_tag=method.delivery_tag)

        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(queue='users', on_message_callback=callback)

        print('User queue consumer started. Waiting for messages...')
        channel.start_consuming()
