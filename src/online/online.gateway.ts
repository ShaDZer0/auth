import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service.js';
import { RedisService } from '../redis/redis.service.js';

@WebSocketGateway({
  cors: { origin: '*' },
})

export class OnlineGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly redisService: RedisService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) {
        client.disconnect();
        return;
      }
      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = this.jwtService.verify(token, { secret });
      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        client.disconnect();
        return;
      }
      client.data.user = { id: user.id, name: user.name };
      await this.redisService.addUser(client.data.user);
      await this.broadcastOnlineUsers();
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    if (client.data.user) {
      await this.redisService.removeUser(client.data.user);
      await this.broadcastOnlineUsers();
    }
  }

  private async broadcastOnlineUsers() {
    const users = await this.redisService.getOnlineUsers();
    this.server.emit('onlineUsersUpdated', users);
  }
}