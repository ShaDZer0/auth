import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { CreateUserDto } from '../users/dto/create-user.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { UserRole } from '../users/entities/user-role.enum.js';
import { User } from '../users/entities/user.entity.js';
import { MailService } from '../mail/mail.service.js';
import { ResetPasswordDto } from './dto/forgot-password.dto.js';

const resetTokens = new Map<string, { code: string; expiresAt: number; lastSentAt: number }>();
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

async register(createUserDto: CreateUserDto) {
  const existing = await this.usersService.findByEmail(createUserDto.email);
  if (existing) {
    throw new UnauthorizedException('Користувач з таким email вже існує');
  }

  const user = await this.usersService.create(createUserDto);

  try {
    await this.mailService.sendWelcomeEmail(user as User);
  } catch (err: any) {
    this.logger.error(`Не вдалося надіслати лист при реєстрації: ${err.message}`);
  }

  return this.buildToken(user.id, user.email, user.role);
}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Невірний email або пароль');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Невірний email або пароль');
    }

    return this.buildToken(user.id, user.email, user.role);
  }

  private buildToken(userId: number, email: string, role: UserRole) {
    const payload = { sub: userId, email, role };
    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      token,
      access_token: token,
    };
  }
  async sendPasswordResetCode(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return { message: 'Якщо акаунт існує, код відновлення надіслано на пошту' };
    }

    const existingRecord = resetTokens.get(email);
    const now = Date.now();
    const COOLDOWN_MS = 60 * 1000; 

    // Перевірка кулдауну
    if (existingRecord && now - existingRecord.lastSentAt < COOLDOWN_MS) {
      const waitSeconds = Math.ceil((COOLDOWN_MS - (now - existingRecord.lastSentAt)) / 1000);
      throw new BadRequestException(`Зачекайте ${waitSeconds} сек. перед повторною відправкою коду`);
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    resetTokens.set(email, {
      code,
      expiresAt: now + 15 * 60 * 1000, 
      lastSentAt: now,
    });

    try {
      await this.mailService.sendResetPasswordLink(user, code);
    } catch (err: any) {
      this.logger.error(`Помилка надсилання коду скидання: ${err.message}`);
    }

    return { message: 'Код відновлення надіслано на вашу пошту' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const record = resetTokens.get(dto.email);
    if (!record || record.expiresAt < Date.now() || record.code !== dto.resetCode) {
      throw new BadRequestException('Невірний або прострочений код підтвердження');
    }

    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.newPassword, salt);
    await this.usersService.updatePassword(user.id, hashedPassword);

    resetTokens.delete(dto.email);
    return { message: 'Пароль успішно змінено. Тепер ви можете увійти.' };
  }
}