import { ApiProperty } from '@nestjs/swagger';

export class LeaderboardEntryDto {
  @ApiProperty({ example: 'Іван Іванов' })
  name: string;

  @ApiProperty({ example: 990 })
  score: number;
}
