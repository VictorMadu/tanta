import { Module } from '@nestjs/common';
import { MessagingModule } from 'src/messaging/messaging.module';
import { UserService } from './user.service';

@Module({
  imports: [MessagingModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
