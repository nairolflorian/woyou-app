// Central place for things you might want to tweak quickly.

export const APP_CONFIG = {
  currency: "eur",
  brand: {
    name: "WoYou",
    tagline: {
      de: "Deine Zukunft in Deutschland",
      en: "Your future in Germany",
      fr: "Votre avenir en Allemagne",
      ar: "مستقبلك في ألمانيا",
    },
  },
  channels: {
    telegramBotEnabled: !!process.env.TELEGRAM_BOT_TOKEN,
    whatsappEnabled: false, // not in demo (paid API)
    emailEnabled: !!process.env.SMTP_HOST, // SMTP in .env → siehe src/lib/mail.ts
  },
};

