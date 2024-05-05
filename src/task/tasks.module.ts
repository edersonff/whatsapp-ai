import { Module } from '@nestjs/common';
import { TasksService } from './task.service';
import { SubscriptionModule } from 'src/subscription/subscription.module';
import { UserModule } from 'src/user/user.module';
import { MessageModule } from 'src/message/message.module';

@Module({
  imports: [UserModule, SubscriptionModule, MessageModule],
  exports: [TasksService],
  providers: [TasksService],
})
export class TasksModule {}
