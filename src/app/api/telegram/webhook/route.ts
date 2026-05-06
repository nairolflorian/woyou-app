import { webhookCallback } from "grammy";
import { getBot } from "@/lib/telegram-bot";

// Telegram sends `X-Telegram-Bot-Api-Secret-Token` with every webhook request
// when we registered with `secret_token`. Reject anything else — that header
// can only be spoofed if someone already knows our env secret.

export async function POST(req: Request) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expected) {
    const got = req.headers.get("x-telegram-bot-api-secret-token");
    if (got !== expected) {
      return new Response("Forbidden", { status: 403 });
    }
  }
  const bot = getBot();
  if (!bot) {
    return new Response("Bot not configured", { status: 503 });
  }
  const handler = webhookCallback(bot, "std/http");
  return handler(req);
}

export async function GET() {
  return new Response("WoYou Telegram webhook ready", { status: 200 });
}
