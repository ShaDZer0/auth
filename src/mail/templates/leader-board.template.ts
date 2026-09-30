export interface LeaderboardRankTemplateData {
  siteUrl?: string;
  gameTitle: string;
  rank: number;
  score: number;
}

export default function leaderboardRank(
  data: LeaderboardRankTemplateData,
  user: { name?: string; email?: string },
): string {
  const userName = user.name || user.email || 'гравцю';
  const gameLink = data.siteUrl || 'http://localhost:3000';

  const medals = ['1', '2', '3'];
  const medal = medals[data.rank - 1];

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #e2e8f0; border-radius: 12px; border: 1px solid #334155;">
      <h2 style="color: #60a5fa; margin-top: 0;">Вітаємо, ${userName}! ${medal}</h2>
      <p style="font-size: 15px; color: #94a3b8; line-height: 1.5;">
        Ви увійшли до <b>Топ-3</b> найкращих гравців у грі <b>«${data.gameTitle}»</b>!
      </p>

      <div style="background: #1e293b; padding: 16px 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #3b82f6;">
        <p style="margin: 0; font-size: 16px;">
          Ваша позиція: <strong style="color: #facc15; font-size: 20px;">#${data.rank}</strong>
        </p>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #94a3b8;">
          Рекордний рахунок: <strong style="color: #34d399;">${data.score}</strong> очок
        </p>
      </div>

      <p style="font-size: 14px; color: #cbd5e1;">
        Втримайте лідерство або спробуйте побити абсолютний рекорд!
      </p>

      <div style="margin-top: 24px;">
        <a href="${gameLink}" 
           style="display: inline-block; padding: 10px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 6px;">
          Перейти до гри
        </a>
      </div>
    </div>
  `;
}