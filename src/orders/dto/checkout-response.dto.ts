import { ApiProperty } from '@nestjs/swagger';

export class CheckoutResponseDto {
  @ApiProperty({ example: 1 })
  orderId: number;

  @ApiProperty({
    description: 'Посилання на сторінку оплати Stripe, на яку треба перенаправити юзера',
    example: 'https://checkout.stripe.com/c/pay/cs_test_...',
  })
  url: string;
}
