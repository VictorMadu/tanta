import { NotificationType } from './notification-type';

export interface NotifyUser {
  userId: string;
  message: string;
  notificationType: NotificationType;
}
