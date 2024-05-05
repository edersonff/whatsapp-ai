import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('webhook')
  webwook(@Request() req) {
    const event = req.body;

    if (event.type !== 'payment_intent.succeeded') {
      return;
    }

    const paymentIntent = event.data.object;

    console.log('PaymentIntent was successful!', paymentIntent);
  }
}
