import { User } from '../../users/entities/user.entity.js';

interface ResetPassContext {
  siteUrl: string;
  token: string;
}

export const resetPasswordTemplate = (context: ResetPassContext, user: User): string => `
  <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 24px; border-radius: 8px;">
    <h2 style="color: #60a5fa;">Відновлення пароля</h2>
    <p>Привіт, ${user.name || user.email}!</p>
    <p>Було отримано запит на скидання пароля для вашого облікового запису.</p>
    <p>
      <a href="${context.siteUrl}/reset-password?token=${context.token}" 
         style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Скинути пароль
      </a>
    </p>
    <p style="font-size: 12px; color: #94a3b8; margin-top: 16px;">Якщо ви не робили цього запиту, просто проігноруйте цей лист.</p>
  </div>
`;