import { webhookCallback } from "grammy";
import { getBot } from "@/lib/telegram-bot";

export async function POST(req: Request) {
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
