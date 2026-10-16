// Betreiberangaben (Impressum, Kontakt, Datenschutz, Fußzeile) – zentral hier pflegen
export const COMPANY = {
  name: "KarriereKind GmbH",
  street: "Berliner Allee 51",
  zipCity: "40229 Düsseldorf",
  country: "Deutschland",
  ceo: "Rachid Debdoubi",
  court: "Amtsgericht Düsseldorf",
  register: "HRB 99139",
  email: "info@woyou.de",
  phone: "+49 160 626 6208",
};

type L = "de" | "en" | "fr" | "ar";
export const SITE_TEXT: Record<L, {
  navOffer: string; navSteps: string; navFaq: string; navContact: string;
  aboutTitle: string; about: string[]; contactTitle: string; contactLead: string; hours: string;
  footerService: string; footerLegal: string; book: string;
}> = {
  de: {
    navOffer: "Angebot", navSteps: "Ablauf", navFaq: "FAQ", navContact: "Kontakt",
    aboutTitle: "Über WoYou",
    about: [
      "WoYou gibt es seit 2018. Wir helfen Menschen aus dem Ausland, in Deutschland Arbeit zu finden.",
      "Unser Team spricht viele Sprachen und kennt die Hürden einer Bewerbung in Deutschland aus eigener Erfahrung. Deshalb übernehmen wir den aufwendigen Teil für dich: Unterlagen nach deutschem Standard, passende Stellen und den Versand.",
    ],
    contactTitle: "Kontakt", contactLead: "Du hast eine Frage zum Bewerbungs-Service? Schreib uns oder ruf an.",
    hours: "Mo bis Fr, 9 bis 18 Uhr",
    footerService: "Bewerbungs-Service", footerLegal: "Rechtliches", book: "Jetzt buchen",
  },
  en: {
    navOffer: "Offer", navSteps: "How it works", navFaq: "FAQ", navContact: "Contact",
    aboutTitle: "About WoYou",
    about: [
      "WoYou has been around since 2018. We help people from abroad find work in Germany.",
      "Our team speaks many languages and knows the hurdles of applying in Germany first-hand. That is why we take care of the hard part for you: documents to German standards, suitable jobs and sending your applications.",
    ],
    contactTitle: "Contact", contactLead: "Do you have a question about the application service? Write to us or give us a call.",
    hours: "Mon to Fri, 9 am to 6 pm",
    footerService: "Application service", footerLegal: "Legal", book: "Book now",
  },
  fr: {
    navOffer: "Offre", navSteps: "Déroulement", navFaq: "FAQ", navContact: "Contact",
    aboutTitle: "À propos de WoYou",
    about: [
      "WoYou existe depuis 2018. Nous aidons les personnes venant de l'étranger à trouver un emploi en Allemagne.",
      "Notre équipe parle de nombreuses langues et connaît les obstacles d'une candidature en Allemagne. C'est pourquoi nous nous occupons de la partie la plus lourde : un dossier aux normes allemandes, des offres adaptées et l'envoi des candidatures.",
    ],
    contactTitle: "Contact", contactLead: "Une question sur le service de candidature ? Écrivez-nous ou appelez-nous.",
    hours: "Lun. au ven., 9 h à 18 h",
    footerService: "Service de candidature", footerLegal: "Mentions légales", book: "Réserver",
  },
  ar: {
    navOffer: "العرض", navSteps: "طريقة العمل", navFaq: "الأسئلة الشائعة", navContact: "اتصل بنا",
    aboutTitle: "عن WoYou",
    about: [
      "تأسست WoYou عام 2018. نساعد القادمين من الخارج على إيجاد عمل في ألمانيا.",
      "يتحدث فريقنا لغات عديدة ويعرف صعوبات التقديم في ألمانيا من تجربته. لذلك نتولى عنك الجزء الأصعب: ملف بالمعايير الألمانية، ووظائف مناسبة، وإرسال الطلبات.",
    ],
    contactTitle: "اتصل بنا", contactLead: "لديك سؤال عن خدمة التقديم؟ راسلنا أو اتصل بنا.",
    hours: "من الاثنين إلى الجمعة، 9 إلى 18",
    footerService: "خدمة التقديم", footerLegal: "معلومات قانونية", book: "احجز الآن",
  },
};
export const siteText = (locale: string) => SITE_TEXT[(locale in SITE_TEXT ? locale : locale === "de" ? "de" : "en") as L];
