import {
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CheckoutResponseDto } from './dto/checkout-response.dto.js';
import { OrderResponseDto } from './dto/order-response.dto.js';
import { ProductResponseDto } from './dto/product-response.dto.js';

@ApiBearerAuth('JWT')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOkResponse({ type: ProductResponseDto, description: 'Товар, який можна купити' })
  @UseGuards(JwtAuthGuard)
  @Get('product')
  getProduct() {
    return this.ordersService.getProduct();
  }

  @ApiCreatedResponse({
    type: CheckoutResponseDto,
    description: 'Створено замовлення й сесію оплати Stripe',
  })
  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  checkout(@CurrentUser() currentUser: { userId: number }) {
    return this.ordersService.createCheckout(currentUser.userId);
  }

  @ApiOkResponse({ type: [OrderResponseDto], description: 'Замовлення поточного юзера' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMyOrders(@CurrentUser() currentUser: { userId: number }) {
    return this.ordersService.findForUser(currentUser.userId);
  }

  @HttpCode(200)
  @Post('webhook')
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string | undefined,
  ) {
    await this.ordersService.handleWebhook(req.rawBody, signature);
    return { received: true };
  }
}
