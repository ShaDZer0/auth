import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service.js';
import { getMailerConfig } from './mail.config.js';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [],
      useFactory: () => getMailerConfig(),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}