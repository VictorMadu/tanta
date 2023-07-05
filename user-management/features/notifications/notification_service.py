from typing import Dict


from features.users.authorization_service import AuthorizationService
from messaging.messaging_service import MessagingService
from django.conf import settings
import smtplib
from email.message import EmailMessage
from twilio.rest import Client


class NotificationService:

    def __init__(self,
                 messaging_service: MessagingService,
                 authorization_service: AuthorizationService
                 ) -> None:

        self.messaging_service = messaging_service
        self.authorization_service = authorization_service

        self.email_host = settings.EMAIL_HOST
        self.email_port = settings.EMAIL_PORT
        self.email_user = settings.EMAIL_USER
        self.email_password = settings.EMAIL_PASSWORD
        self.from_email = settings.EMAIL_SENDER

        self.twilio_acc_sid = settings.TWILIO_ACCOUNT_SID
        self.twilio_auth_token = settings.TWILIO_AUTH_TOKEN
        self.twilio_sender_phone = settings.TWILIO_PHONE_NUMBER
        self.binding_key = settings.RABBITMQ_NOTIFICATION_BINDING_KEY

    def on_ready(self):
        self.messaging_service.set_handler_for_route(
            routing_key=self.binding_key,
            callback=self.messaging_service.createCallbackWithNoResponse(
                lambda p: self.notify(p))
        )

    def notify(self, payload: Dict[str, str]) -> None:
        user_id: str = payload['user_id']
        message: str = payload['message']
        notification_type = payload['notification_type']

        user = self.authorization_service.get_user_data_from_id(user_id)

        if (user == None):
            return None

        if (notification_type == 'EMAIL'):
            self.send_email(user, message)
        elif (notification_type == 'MOBILE'):
            self.send_sms(user, message)

    def send_email(self, user: any, message: str):

        msg = EmailMessage()
        msg.set_content(message)

        msg['Subject'] = 'Notification'
        msg['From'] = self.from_email
        msg['To'] = user.email

        try:
            # TODO: Set smtp during initialization of class to avoid re-creating new one
            with smtplib.SMTP(self.email_host, self.email_port) as smtp:
                smtp.login(self.email_user, self.email_password)
                smtp.send_message(msg)
        except (Exception):
            print("Sending Email: ", message)
            return None

    def send_sms(self, user: any, message: str):
        try:
            # TODO: Set twilio client during initialization of class to avoid re-creating new one

            client = Client(self.twilio_acc_sid, self.twilio_auth_token)

            message = client.messages.create(
                body=message,
                from_=self.twilio_sender_phoneR,
                to=user.mobile_number
            )
        except (Exception):
            print("Sending SMS: ", message)
            return None



