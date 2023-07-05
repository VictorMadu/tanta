import { Module } from '@nestjs/common';
import { MessagingModule } from 'src/messaging/messaging.module';
import { NotificationService } from './notification.service';

@Module({
  imports: [MessagingModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
