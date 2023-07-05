import { Injectable } from '@nestjs/common';
import config from 'src/config';
import { MessagingService } from 'src/messaging/messaging.service';

@Injectable()
export class UserService {
  constructor(private messagingService: MessagingService) {}

  async authorize({ token }: { token: string | null }) {
    console.log('AUth in');

    try {
      const response = await this.messagingService.publishWithDirectResponse<
        Authorized | UnAuthorized
      >(config.rabbitMq.routingKey.authorization, { token });

      console.log('response', response);

      return { userId: response.user_id, isAuthorized: response.is_authorized };
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  }
}

export interface Authorized {
  user_id: string;
  is_authorized: true;
}

export interface UnAuthorized {
  user_id: null;
  is_authorized: false;
}
