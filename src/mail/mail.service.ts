import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/entities/user.entity.js';
import { welcomeTemplate } from './templates/welcome.template.js'
import { newRecordTemplate } from './templates/new-record.template.js';
import { resetPasswordLinkTemplate } from './templates/reset-passwordLink.template.js'
import leaderboardRank from './templates/leader-board.template.js';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly siteUrl = process.env.PROJECT_URL || 'http://localhost:3000';

  constructor(private readonly mailerService: MailerService) {}

  async send(email: string | undefined, subject: string, html: string): Promise<boolean> {
    if (!email) {
      this.logger.warn('Спроба відправити лист на невизначену адресу (email is undefined)');
      return false;
    }

    try {
      await this.mailerService.sendMail({
        to: email,
        subject,
        html,
      });
      return true;
    } catch (error) {
      this.logger.error(`Помилка відправки листа на ${email}: ${(error as Error).message}`);
      return false;
    }
  }

  async sendWelcomeEmail(user: User): Promise<boolean> {
    return this.send(
      user.email,
      'Ласкаво просимо до Game Portal!',
      welcomeTemplate(user, this.siteUrl),
    );
  }

    async sendResetPasswordLink(user: User, code: string): Promise<void> {
    const htmlContent = resetPasswordLinkTemplate({
      name: user.name || 'користувачу',
      code,
    });

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Код для відновлення пароля',
      html: htmlContent,
    });
}

  async sendNewRecordNotification(user: User, gameName: string, score: number): Promise<boolean> {
    return this.send(
      user.email,
      `Новий рекорд у грі ${gameName}!`,
      newRecordTemplate(user, gameName, score),
    );
  }
async sendTopRankNotification(
  user: { email: string; name?: string },
  gameTitle: string,
  rank: number,
  score: number,
): Promise<boolean> {
  return await this.send(
    user.email,
    `Ви в Топ-3 гри «${gameTitle}»!`,
    leaderboardRank(
      {
        siteUrl: this.siteUrl,
        gameTitle,
        rank,
        score,
      },
      user,
    ),
  );
};
}