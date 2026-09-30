import { User } from '../../users/entities/user.entity.js';

export const welcomeTemplate = (user: User, siteUrl: string): string => `
  <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 24px; border-radius: 8px;">
    <h2 style="color: #60a5fa;">Ласкаво просимо до Game Portal, ${user.name}!</h2>
    <p>Ваш акаунт успішно зареєстровано.</p>
    <a href="${siteUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 12px;">Перейти до ігор</a>
  </div>
`;