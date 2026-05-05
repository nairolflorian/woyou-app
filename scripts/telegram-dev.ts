/**
 * Long-polling runner for the Telegram bot during local development.
 *
 *   npm run telegram:dev
 *
 * In production you instead set a webhook to /api/telegram/webhook
 * (see README "Telegram setup").
 */
import "dotenv/config";
import { getBot } from "../src/lib/telegram-bot";

const bot = getBot();
if (!bot) {
  console.error(
    "TELEGRAM_BOT_TOKEN not set. Add it to .env (see README → Telegram setup)."
  );
  process.exit(1);
}
console.log("WoYou Telegram bot running (long-polling). Ctrl+C to stop.");
bot.start();
