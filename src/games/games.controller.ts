import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { GamesService } from './games.service.js';
import { CreateGameDto } from './dto/create-game.dto.js';
import { TrackGameDto } from './dto/track-game.dto.js';
import { GameResponseDto } from './dto/game-response.dto.js';
import { LeaderboardEntryDto } from './dto/leaderboard-entry.dto.js';
import { GameResultResponseDto } from './dto/game-result-response.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { UserRole } from '../users/entities/user-role.enum.js';

@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @ApiCreatedResponse({ type: GameResponseDto, description: 'Гру додано в каталог' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  createGame(@Body() dto: CreateGameDto) {
    return this.gamesService.createGame(dto);
  }

  @ApiOkResponse({ type: [GameResponseDto], description: 'Каталог ігор' })
  @Get()
  findAllGames() {
    return this.gamesService.findAllGames();
  }

  @ApiCreatedResponse({ type: GameResultResponseDto, description: 'Результат записано' })
  @Post('track-game')
  trackGame(
    @CurrentUser() currentUser: { userId: number },
    @Body() dto: TrackGameDto,
  ) {
    return this.gamesService.trackGame(currentUser.userId, dto);
  }

  @ApiOkResponse({ type: [GameResultResponseDto], description: 'Власні результати юзера' })
  @Get('me')
  getMyResults(@CurrentUser() currentUser: { userId: number }) {
    return this.gamesService.findResultsForUser(currentUser.userId);
  }
  @ApiParam({ name: 'gameId', type: Number, example: 1, description: 'ID гри з каталогу' })
  @ApiOkResponse({
    type: [LeaderboardEntryDto],
    description: 'Топ-3 гравців за найкращим результатом у цій грі',
  })
  @Get(':gameId/leaderboard')
  getLeaderboard(@Param('gameId') gameId: string) {
    return this.gamesService.getLeaderboard(+gameId);
  }
}
