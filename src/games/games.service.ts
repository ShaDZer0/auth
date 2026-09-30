import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './entities/game.entity.js';
import { GameResult } from './entities/game-result.entity.js';
import { CreateGameDto } from './dto/create-game.dto.js';
import { TrackGameDto } from './dto/track-game.dto.js';
import { GameResponseDto } from './dto/game-response.dto.js';
import { GameResultResponseDto } from './dto/game-result-response.dto.js';
import { LeaderboardEntryDto } from './dto/leaderboard-entry.dto.js';
import { User } from '../users/entities/user.entity.js'
import { MailService } from '../mail/mail.service.js';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    @InjectRepository(GameResult)
    private readonly gameResultRepository: Repository<GameResult>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  async createGame(dto: CreateGameDto): Promise<GameResponseDto> {
    const existing = await this.gameRepository.findOneBy({ name: dto.name });
    if (existing) {
      throw new ConflictException('Гра з такою назвою вже існує');
    }
    const game = this.gameRepository.create(dto);
    const saved = await this.gameRepository.save(game);
    return this.toGameResponseDto(saved);
  }

  async findAllGames(): Promise<GameResponseDto[]> {
    const games = await this.gameRepository.find();
    return games.map((game) => this.toGameResponseDto(game));
  }

  async trackGame(userId: number, dto: TrackGameDto): Promise<GameResult> {
    const { gameId, score } = dto;
    const game = await this.gameRepository.findOne({ where: { id: gameId } });
    if (!game) throw new NotFoundException('Гру не знайдено');

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Користувача не знайдено');

    let existingResult = await this.gameResultRepository.findOne({
      where: { user: { id: userId }, game: { id: gameId } },
      relations: { user: true, game: true },
    });

    let isNewRecord = false;

    if (!existingResult) {
      existingResult = this.gameResultRepository.create({ user, game, score });
      await this.gameResultRepository.save(existingResult);
      isNewRecord = true;
    } else if (score > existingResult.score) {
      existingResult.score = score;
      await this.gameResultRepository.save(existingResult);
      isNewRecord = true;
    }

    if (isNewRecord) {
      this.mailService
        .sendNewRecordNotification(user, game.name, score)
        .catch((err) => {
          this.logger.error(`Помилка надсилання сповіщення про рекорд: ${err.message}`);
        });
    }
    return existingResult;
  }


  async findResultsForUser(userId: number): Promise<GameResultResponseDto[]> {
    const results = await this.gameResultRepository.find({
      where: { userId },
      relations: { game: true },
      order: { id: 'DESC' },
    });
    return results.map((result) => this.toGameResultResponseDto(result, result.game));
  }

  async getLeaderboard(gameId: number, limit = 3): Promise<LeaderboardEntryDto[]> {
    const game = await this.gameRepository.findOneBy({ id: gameId });
    if (!game) {
      throw new NotFoundException(`Гру з id ${gameId} не знайдено`);
    }

    const rows = await this.gameResultRepository
      .createQueryBuilder('result')
      .innerJoin('result.user', 'user')
      .select('user.name', 'name')
      .addSelect('MAX(result.score)', 'score')
      .where('result.gameId = :gameId', { gameId })
      .groupBy('user.id')
      .addGroupBy('user.name')
      .orderBy('MAX(result.score)', 'DESC')
      .limit(limit)
      .getRawMany<{ name: string; score: string }>();

    return rows.map((row) => {
      const dto = new LeaderboardEntryDto();
      dto.name = row.name;
      dto.score = Number(row.score);
      return dto;
    });
  }

  private toGameResponseDto(game: Game): GameResponseDto {
    const dto = new GameResponseDto();
    dto.id = game.id;
    dto.name = game.name;
    return dto;
  }

  private toGameResultResponseDto(
    result: GameResult,
    game: Game,
  ): GameResultResponseDto {
    const dto = new GameResultResponseDto();
    dto.id = result.id;
    dto.score = result.score;
    dto.userId = result.userId;
    dto.gameId = result.gameId;
    dto.game = this.toGameResponseDto(game);
    return dto;
  }
}
