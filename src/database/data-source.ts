import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity.js';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '25889435',
  database: process.env.DB_DATABASE || 'auth_db',
  entities: [User],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
