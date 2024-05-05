import { Injectable } from '@nestjs/common';
import { Service } from 'class/service/entity.service';
import { Subscription } from './entities/subscription.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import stripe from 'stripe';

@Injectable()
export class SubscriptionService extends Service<Subscription> {
  constructor(
    @InjectRepository(Subscription)
    repository: Repository<Subscription>,
  ) {
    super(repository);
  }
}
