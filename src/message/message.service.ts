import { Injectable } from '@nestjs/common';
import { Service } from 'class/service/entity.service';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MessageService extends Service<Message> {
  constructor(
    @InjectRepository(Message)
    repository: Repository<Message>,
  ) {
    super(repository);
  }
}
