import smtplib
from email.message import EmailMessage
from twilio.rest import Client
from django.conf import settings


def send_email(to_email, message):
    msg = EmailMessage()
    msg.set_content(message)

    msg['Subject'] = 'Notification'
    msg['From'] = settings.EMAIL_SENDER
    msg['To'] = to_email

    with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT) as smtp:
        smtp.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
        smtp.send_message(msg)


def send_sms(to_phone_number, message):
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

    message = client.messages.create(
        body=message,
        from_=settings.TWILIO_PHONE_NUMBER,
        to=to_phone_number
    )
