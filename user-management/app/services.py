from messaging.messaging_service import MessagingService
from features.users.authorization_service import AuthorizationService
from features.notifications.notification_service import NotificationService




messaging_service = MessagingService()

authorization_service = AuthorizationService(messaging_service)

notification_service = NotificationService(
    messaging_service, authorization_service)



messaging_service.on_ready()
authorization_service.on_ready()
notification_service.on_ready()