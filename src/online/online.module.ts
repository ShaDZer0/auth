// src/online/online.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt'; // 👈 імпортуємо JwtModule
import { OnlineGateway } from './online.gateway.js';
import { UsersModule } from '../users/users.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    JwtModule,
    UsersModule,
    AuthModule,
  ],
  providers: [OnlineGateway],
})
export class OnlineModule {}