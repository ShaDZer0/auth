import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type Stripe from 'stripe';
import { Order } from './entities/order.entity.js';
import { OrderStatus } from './entities/order-status.enum.js';
import { PRODUCT } from './products.js';
import { StripeService } from './stripe.service.js';
import { CheckoutResponseDto } from './dto/checkout-response.dto.js';
import { OrderResponseDto } from './dto/order-response.dto.js';
import { ProductResponseDto } from './dto/product-response.dto.js';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly stripeService: StripeService,
    private readonly config: ConfigService,
  ) {}

  getProduct(): ProductResponseDto {
    const dto = new ProductResponseDto();
    dto.id = PRODUCT.id;
    dto.name = PRODUCT.name;
    dto.description = PRODUCT.description;
    dto.amount = PRODUCT.amount;
    dto.currency = PRODUCT.currency;
    return dto;
  }

  async createCheckout(userId: number): Promise<CheckoutResponseDto> {
    const order = await this.ordersRepository.save(
      this.ordersRepository.create({
        userId,
        productId: PRODUCT.id,
        productName: PRODUCT.name,
        amount: PRODUCT.amount,
        currency: PRODUCT.currency,
        status: OrderStatus.PENDING,
      }),
    );

    const appUrl = this.config.get<string>('APP_URL') ?? 'http://localhost:3000';

    try {
      const session = await this.stripeService.client.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: PRODUCT.currency,
              product_data: { name: PRODUCT.name, description: PRODUCT.description },
              unit_amount: PRODUCT.amount,
            },
            quantity: 1,
          },
        ],
        client_reference_id: String(userId),
        metadata: { orderId: String(order.id) },
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        success_url: `${appUrl}/?payment=success`,
        cancel_url: `${appUrl}/?payment=cancel`,
      });

      if (!session.url) {
        throw new Error('Stripe не повернув посилання на оплату');
      }

      order.stripeSessionId = session.id;
      await this.ordersRepository.save(order);

      return Object.assign(new CheckoutResponseDto(), {
        orderId: order.id,
        url: session.url,
      });
    } catch (error) {
      order.status = OrderStatus.EXPIRED;
      await this.ordersRepository.save(order);
      this.logger.error(`Не вдалося створити Stripe-сесію для замовлення ${order.id}`, error);

      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Не вдалося створити платіж');
    }
  }

  async findForUser(userId: number): Promise<OrderResponseDto[]> {
    const orders = await this.ordersRepository.find({
      where: { userId },
      order: { id: 'DESC' },
    });
    return orders.map((order) => this.toResponseDto(order));
  }

  async handleWebhook(rawBody: Buffer | undefined, signature: string | undefined): Promise<void> {
    if (!rawBody || !signature) {
      throw new BadRequestException('Відсутнє тіло запиту або підпис Stripe');
    }

    const event = this.stripeService.constructEvent(rawBody, signature);

    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object;
        if (session.payment_status === 'paid') {
          await this.markPaid(session);
        }
        break;
      }
      case 'checkout.session.expired':
        await this.markExpired(event.data.object.id);
        break;
      default:
        break;
    }
  }

  private async markPaid(session: Stripe.Checkout.Session): Promise<void> {
    const order = await this.ordersRepository.findOneBy({ stripeSessionId: session.id });
    if (!order) {
      this.logger.warn(`Оплата для невідомої сесії ${session.id}`);
      return;
    }
    if (order.status === OrderStatus.PAID) {
      return; 
    }

    order.status = OrderStatus.PAID;
    order.paidAt = new Date();
    order.stripePaymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : (session.payment_intent?.id ?? null);
    await this.ordersRepository.save(order);
  }

  private async markExpired(sessionId: string): Promise<void> {
    const order = await this.ordersRepository.findOneBy({ stripeSessionId: sessionId });
    if (order && order.status === OrderStatus.PENDING) {
      order.status = OrderStatus.EXPIRED;
      await this.ordersRepository.save(order);
    }
  }

  private toResponseDto(order: Order): OrderResponseDto {
    const dto = new OrderResponseDto();
    dto.id = order.id;
    dto.productName = order.productName;
    dto.amount = order.amount;
    dto.currency = order.currency;
    dto.status = order.status;
    dto.createdAt = order.createdAt;
    dto.paidAt = order.paidAt;
    return dto;
  }
}
