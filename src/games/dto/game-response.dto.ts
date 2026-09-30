import { ApiProperty } from '@nestjs/swagger';

export class GameResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Tetris' })
  name: string;
}
