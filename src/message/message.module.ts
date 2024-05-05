import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  exports: [TypeOrmModule, MessageService],
  providers: [MessageService],
})
export class MessageModule {}
