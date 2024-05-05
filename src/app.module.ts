import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { dataSourceOptions } from './db/data-source';
import { UserModule } from './user/user.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { TasksModule } from './task/tasks.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(dataSourceOptions),
    UserModule,
    SubscriptionModule,
    TasksModule,
    MessageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
