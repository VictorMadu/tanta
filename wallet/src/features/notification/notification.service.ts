import { Injectable } from '@nestjs/common';
import { MessagingService } from 'src/messaging/messaging.service';
import { NotificationType } from './notification-type';
import { NotifyUser } from './notify-user';

@Injectable()
export class NotificationService {
  constructor(private messagingService: MessagingService) {}

  async notifyUser({
    userId,
    message,
    notificationType,
  }: NotifyUser): Promise<void> {
    console.log({ userId, message, notificationType });
    return;
    // TODO: Use Kafka or RabbitMQ to communicate
  }
}
