import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription])],
  exports: [TypeOrmModule, SubscriptionService],
  providers: [SubscriptionService],
})
export class SubscriptionModule {}
