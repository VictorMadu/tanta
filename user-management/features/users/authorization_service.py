from typing import Dict
from messaging.messaging_service import MessagingService


class AuthorizationService:

    def __init__(self, messaging_service: MessagingService) -> None:
        self.messaging_service = messaging_service

    def on_ready(self):

        self.messaging_service.set_handler_for_route(
            routing_key='notification_service_notify',
            callback=self.messaging_service.createCallbackWithNoResponse(
                lambda p: self.notify(p))
        )

    def authorize(self, payload: Dict[str, str]) -> Dict:
        out = {}

        token = payload.get('token')
        user_pk = self.get_user_pk(token)

        if (user_pk == None):
            out['is_authorized'] = False
            out['user_id'] = None
        else:
            out['is_authorized'] = True
            out['user_id'] = str(user_pk)

        return out

    def get_user_data(self, token: str | None):
        from django.contrib.auth import get_user_model

        if (token == None):
            return None

        try:
            user_id = self.get_user_id_from_token(token)
            user = get_user_model()
            userData = user.objects.get(pk=user_id)
            return userData
        except (Exception):
            return None

    def get_user_id_from_token(self, token: str | None):
        from rest_framework_simplejwt.tokens import AccessToken

        if (token == None):
            return None

        try:
            access_token = AccessToken(token)
            user_id = access_token.payload['user_id']
            return user_id
        except (Exception):
            return None

    def get_user_data_from_id(self, id: str):
        from django.contrib.auth import get_user_model

        try:
            user = get_user_model()
            userData = user.objects.get(pk=id)
            return userData
        except (Exception):
            return None


