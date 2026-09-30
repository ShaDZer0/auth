import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ example: 'golden-snake-skin' })
  id: string;

  @ApiProperty({ example: 'Скін «Золота змійка»' })
  name: string;

  @ApiProperty({ example: 'Одноразова покупка.' })
  description: string;

  @ApiProperty({ example: 500, description: 'Ціна в центах' })
  amount: number;

  @ApiProperty({ example: 'usd' })
  currency: string;
}
