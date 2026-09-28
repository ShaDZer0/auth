import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { Game } from '../games/entities/game.entity.js';
import { GameResult } from '../games/entities/game-result.entity.js';
import { Order } from '../orders/entities/order.entity.js';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '25889435',
  database: process.env.DB_DATABASE || 'auth_db',
  entities: [User, Game, GameResult, Order],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});