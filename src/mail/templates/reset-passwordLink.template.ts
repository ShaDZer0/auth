export interface ResetPasswordTemplateProps {
  name: string;
  code: string;
}

export function resetPasswordLinkTemplate({ name, code }: ResetPasswordTemplateProps): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background-color: #0f172a; color: #f8fafc; border-radius: 8px;">
      <h2 style="color: #60a5fa; margin-top: 0;">Відновлення пароля</h2>
      <p>Вітаємо, <b>${name}</b>!</p>
      <p>Ви надіслали запит на скидання пароля до вашого акаунту.</p>
      <p>Ваш код підтвердження:</p>
      <div style="background-color: #1e293b; padding: 12px 20px; border-radius: 6px; font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; color: #34d399; margin: 16px 0;">
        ${code}
      </div>
      <p style="font-size: 13px; color: #94a3b8;">Код дійсний протягом 15 хвилин. Якщо ви не робили цього запиту, проігноруйте цей лист.</p>
    </div>
  `;
}