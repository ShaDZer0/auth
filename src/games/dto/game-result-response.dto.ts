import { ApiProperty } from '@nestjs/swagger';
import { GameResponseDto } from './game-response.dto.js';

export class GameResultResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 4500 })
  score: number;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 1 })
  gameId: number;

  @ApiProperty({ type: () => GameResponseDto })
  game: GameResponseDto;
}
