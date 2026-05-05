/**
 * One-shot helper to register the webhook URL with Telegram.
 *
 *   npm run telegram:set-webhook -- https://your-domain.de/api/telegram/webhook
 */
import "dotenv/config";

async function main() {
  const url = process.argv[2];
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN missing in .env");
    process.exit(1);
  }
  if (!url) {
    console.error("Usage: npm run telegram:set-webhook -- <https URL>");
    process.exit(1);
  }
  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  console.log(await res.json());
}
main();
