import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly ONLINE_SET_KEY = 'online_users';
  constructor(private readonly configService: ConfigService) {}
  onModuleInit() {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: Number(this.configService.get<number>('REDIS_PORT', 6379)),
    });
  }
  async onModuleDestroy() {
    await this.client.quit();
  }
  async addUser(user: { id: number; name: string }) {
    await this.client.sadd(this.ONLINE_SET_KEY, JSON.stringify(user));
  }
  async removeUser(user: { id: number; name: string }) {
    await this.client.srem(this.ONLINE_SET_KEY, JSON.stringify(user));
  }
  async getOnlineUsers(): Promise<Array<{ id: number; name: string }>> {
    const raw = await this.client.smembers(this.ONLINE_SET_KEY);
    return raw.map((item) => JSON.parse(item));
  }
}