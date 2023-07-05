from typing import Any, Callable, Dict, List, Tuple
import pika
import json
from django.conf import settings

RoutingKey = str
Handler = Callable[[Dict], Dict]
Callback = Callable[[Any, Any, Any, Any], None]


class MessagingService:

    def __init__(self) -> None:
        self.handlers: List[Tuple[RoutingKey, Callback]] = []

        self.host = settings.RABBITMQ_HOST
        self.port = settings.RABBITMQ_PORT
        self.exchange = settings.RABBITMQ_EXCHANGE

    def set_handler_for_route(self, routing_key: RoutingKey, callback: Callback) -> None:
        self.handlers.append([routing_key, callback])

    def on_ready(self) -> None:
        params = pika.ConnectionParameters(host=self.host, port=self.port)

        self.connection = pika.BlockingConnection(params)
        self.channel = self.connection.channel()

        for routing_key, callback in self.handlers:
            self.channel.exchange_declare(
                exchange=self.exchange,
                exchange_type='direct'
            )

            result = self.channel.queue_declare(
                queue='',
                exclusive=True
            )

            queue_name = result.method.queue

            self.channel.queue_bind(
                queue=queue_name,
                exchange=self.exchange,
                routing_key=routing_key
            )

            self.channel.basic_consume(
                queue=queue_name,
                on_message_callback=callback,
                auto_ack=True
            )

        self.channel.start_consuming()

    def createCallbackWithNoResponse(self, handler: Handler) -> Callback:
        def callback(ch, method, properties, body):
            handler(json.loads(body))

        return callback

    def createCallbackWithResponseToPublisher(self, handler: Handler) -> Callback:
        def callback(ch, method, properties, body):
            payload = handler(json.loads(body))
            response_json = json.dumps(payload)

            self.channel.basic_publish(
                exchange='',
                routing_key=properties.reply_to,
                properties=pika.BasicProperties(
                    correlation_id=properties.correlation_id
                ),
                body=response_json
            )

        return callback

    def stop(self) -> None:
        self.channel.close()



