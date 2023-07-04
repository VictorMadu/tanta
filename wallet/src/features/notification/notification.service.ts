import { Injectable } from '@nestjs/common';
import { NotificationType } from './notification-type';
import { NotifyUser } from './notify-user';

@Injectable()
export class NotificationService {
  async notifyUser({
    userId,
    message,
    notificationType,
  }: NotifyUser): Promise<void> {
    throw new Error();
    // TODO: Use Kafka or RabbitMQ to communicate
  }
}
