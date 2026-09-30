import { MailerOptions } from '@nestjs-modules/mailer';

export const getMailerConfig = (): MailerOptions => ({
  transport: {
    service: process.env.MAIL_SERVICE || 'gmail',
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.MAIL_PORT || 587),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_AUTH_USER,
      pass: process.env.MAIL_AUTH_PASSWORD,
    },
  },
  defaults: {
    from: process.env.MAIL_FROM || '"Game Portal" <no-reply@gameportal.local>',
  },
});