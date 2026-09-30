import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { GamesService } from './games.service.js';
import { GamesController } from './games.controller.js';
import { Game } from './entities/game.entity.js';
import { GameResult } from './entities/game-result.entity.js';
import { User } from '../users/entities/user.entity.js'
import { MailModule } from '../mail/mail.module.js';
import { GamesSchedulerService } from './cron/games-shedule.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Game, GameResult, User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MailModule,
  ],
  controllers: [GamesController],
  providers: [GamesService, GamesSchedulerService],
  exports: [GamesService],
})
export class GamesModule {}
