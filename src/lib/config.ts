// Central place for things you might want to tweak quickly.

export const APP_CONFIG = {
  // Profile activation fee in EUR cents — change here and Stripe checkout follows
  profileFeeCents: 4900, // = 49,00 €
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
    emailEnabled: false, // configure SMTP in .env to enable
  },
};

export function formatFee(locale = "de"): string {
  const value = APP_CONFIG.profileFeeCents / 100;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: APP_CONFIG.currency.toUpperCase(),
  }).format(value);
}
