import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe | null = null;

  constructor(private readonly config: ConfigService) {}

  get client(): Stripe {
    if (!this.stripe) {
      const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
      if (!secretKey) {
        throw new ServiceUnavailableException('Stripe не налаштований (STRIPE_SECRET_KEY)');
      }
      this.stripe = new Stripe(secretKey);
    }
    return this.stripe;
  }

  constructEvent(rawBody: Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new ServiceUnavailableException('Stripe не налаштований (STRIPE_WEBHOOK_SECRET)');
    }

    try {
      return this.client.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      throw new BadRequestException('Невалідний підпис webhook');
    }
  }
}
