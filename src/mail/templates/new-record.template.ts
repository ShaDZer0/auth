import { User } from '../../users/entities/user.entity.js';

export const newRecordTemplate = (user: User, gameName: string, score: number): string => `
  <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 24px; border-radius: 8px;">
    <h2 style="color: #34d399;">Новий рекорд у грі ${gameName}!</h2>
    <p>Вітаємо, ${user.name}!</p>
    <p>Ви встановили новий результат: <strong>${score} очок</strong> і увійшли до таблиці лідерів.</p>
  </div>
`;