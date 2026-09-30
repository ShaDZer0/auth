import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../entities/game.entity.js';
import { GameResult } from '../entities/game-result.entity.js';
import { MailService } from '../../mail/mail.service.js';

@Injectable()
export class GamesSchedulerService {
  private readonly logger = new Logger(GamesSchedulerService.name);

  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    @InjectRepository(GameResult)
    private readonly gameResultRepository: Repository<GameResult>,
    private readonly mailService: MailService,
  ) {}

  @Cron('0 12 * * *', {
    timeZone: 'Europe/Kyiv',
  })
 async handleDailyTop3RankNotification(): Promise<void> {
    this.logger.log('Початок розсилки сповіщень для Топ-3 гравців по кожній грі...');

    try {
      const games = await this.gameRepository.find();

      if (!games.length) {
        this.logger.log('Ігор у каталозі не знайдено.');
        return;
      }

      for (const game of games) {
        const topResults = await this.gameResultRepository.find({
          where: { game: { id: game.id } },
          relations: { user: true },
          order: { score: 'DESC' },
          take: 3,
        });

        for (let i = 0; i < topResults.length; i++) {
          const entry = topResults[i];
          const rank = i + 1;
          const user = entry.user;

          if (user?.email) {
            await this.mailService.sendTopRankNotification(
              { email: user.email, name: user.name },
              game.name || 'Гра',
              rank,
              entry.score,
            ).catch((err) => {
              this.logger.warn(`Не вдалося надіслати лист на ${user.email}: ${err.message}`);
            });
          }
        }
      }

      this.logger.log('Розсилку для Топ-3 успішно завершено.');
    } catch (error: any) {
      this.logger.error(`Помилка під час cron розсилки: ${error.message}`);
    }
  }
}