import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { OrdersService } from './orders.service.js';
import { StripeService } from './stripe.service.js';
import { Order } from './entities/order.entity.js';
import { OrderStatus } from './entities/order-status.enum.js';
import { PRODUCT } from './products.js';

const WEBHOOK_SECRET = 'whsec_test_secret';

/** Мінімальна in-memory заміна Repository<Order> */
function createFakeRepo() {
  const rows: Order[] = [];
  let nextId = 1;
  return {
    rows,
    create: (data: Partial<Order>) => ({ ...data }) as Order,
    save: async (order: Order) => {
      if (!order.id) {
        order.id = nextId++;
        order.createdAt = new Date();
        order.paidAt ??= null;
        order.stripeSessionId ??= null;
        order.stripePaymentIntentId ??= null;
        rows.push(order);
      }
      return order;
    },
    findOneBy: async (where: Partial<Order>) =>
      rows.find((r) => Object.entries(where).every(([k, v]) => r[k as keyof Order] === v)) ?? null,
    find: async ({ where }: { where: Partial<Order> }) =>
      rows.filter((r) => Object.entries(where).every(([k, v]) => r[k as keyof Order] === v)),
  };
}

function signedWebhook(event: object) {
  const payload = JSON.stringify(event);
  const signature = Stripe.webhooks.generateTestHeaderString({
    payload,
    secret: WEBHOOK_SECRET,
  });
  return { rawBody: Buffer.from(payload), signature };
}

describe('OrdersService', () => {
  let repo: ReturnType<typeof createFakeRepo>;
  let service: OrdersService;
  let createSession: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    repo = createFakeRepo();
    createSession = vi.fn().mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/c/pay/cs_test_123',
    });

    const config = { get: (key: string) => (key === 'STRIPE_WEBHOOK_SECRET' ? WEBHOOK_SECRET : key === 'STRIPE_SECRET_KEY' ? 'sk_test_x' : undefined) };
    const realStripeService = new StripeService(config as never);
    const stripeService = {
      client: { checkout: { sessions: { create: createSession } } },
      constructEvent: realStripeService.constructEvent.bind(realStripeService),
    };

    service = new OrdersService(repo as never, stripeService as never, config as never);
  });

  it('checkout створює pending-замовлення, прив\'язане до юзера, з сумою від сервера', async () => {
    const result = await service.createCheckout(42);

    expect(result.url).toContain('checkout.stripe.com');
    expect(repo.rows).toHaveLength(1);
    expect(repo.rows[0]).toMatchObject({
      userId: 42,
      amount: PRODUCT.amount,
      status: OrderStatus.PENDING,
      stripeSessionId: 'cs_test_123',
    });
    expect(createSession.mock.calls[0][0]).toMatchObject({ mode: 'payment' });
  });

  it('якщо Stripe впав - замовлення позначається expired, а не лишається pending', async () => {
    createSession.mockRejectedValue(new Error('network'));

    await expect(service.createCheckout(1)).rejects.toThrow();
    expect(repo.rows[0].status).toBe(OrderStatus.EXPIRED);
  });

  it('webhook completed+paid переводить замовлення в paid і він ідемпотентний', async () => {
    await service.createCheckout(7);

    const { rawBody, signature } = signedWebhook({
      id: 'evt_1',
      object: 'event',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test_123', object: 'checkout.session', payment_status: 'paid', payment_intent: 'pi_999' } },
    });

    await service.handleWebhook(rawBody, signature);
    expect(repo.rows[0].status).toBe(OrderStatus.PAID);
    expect(repo.rows[0].stripePaymentIntentId).toBe('pi_999');

    const firstPaidAt = repo.rows[0].paidAt;
    await service.handleWebhook(rawBody, signature); // повторна доставка
    expect(repo.rows[0].paidAt).toBe(firstPaidAt);
  });

  it('webhook з неправильним підписом відхиляється, замовлення не змінюється', async () => {
    await service.createCheckout(7);
    const { rawBody } = signedWebhook({ id: 'evt_2', object: 'event', type: 'checkout.session.completed', data: { object: { id: 'cs_test_123', payment_status: 'paid' } } });

    await expect(service.handleWebhook(rawBody, 't=1,v1=deadbeef')).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.rows[0].status).toBe(OrderStatus.PENDING);
  });

  it('webhook expired не чіпає вже оплачене замовлення', async () => {
    await service.createCheckout(7);
    repo.rows[0].status = OrderStatus.PAID;

    const { rawBody, signature } = signedWebhook({
      id: 'evt_3',
      object: 'event',
      type: 'checkout.session.expired',
      data: { object: { id: 'cs_test_123', object: 'checkout.session' } },
    });
    await service.handleWebhook(rawBody, signature);

    expect(repo.rows[0].status).toBe(OrderStatus.PAID);
  });

  it('findForUser повертає тільки замовлення цього юзера', async () => {
    await service.createCheckout(1);
    createSession.mockResolvedValue({ id: 'cs_other', url: 'https://x' });
    await service.createCheckout(2);

    const mine = await service.findForUser(1);
    expect(mine).toHaveLength(1);
    expect(mine[0]).not.toHaveProperty('userId');
  });
});
