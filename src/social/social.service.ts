import { Injectable } from '@nestjs/common';
import { Service } from 'class/service/entity.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Social } from './entities/social.entity';

@Injectable()
export class SocialService extends Service<Social> {
  constructor(
    @InjectRepository(Social)
    repository: Repository<Social>,
  ) {
    super(repository);
  }
}
