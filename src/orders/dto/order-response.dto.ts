import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../entities/order-status.enum.js';

export class OrderResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Скін «Золота змійка»' })
  productName: string;

  @ApiProperty({ example: 500, description: 'Сума в центах' })
  amount: number;

  @ApiProperty({ example: 'usd' })
  currency: string;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PAID })
  status: OrderStatus;

  @ApiProperty({ example: '2026-09-28T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ type: Date, nullable: true, example: '2026-09-28T10:01:00.000Z' })
  paidAt: Date | null;
}
