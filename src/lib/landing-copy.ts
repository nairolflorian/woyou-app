// Startseite nach dem Konzept „Ehrlichkeit als Verkaufsargument“ (Entwurf v2, 18.10.2026), umgestellt auf Weg 1
// (22.10.2026): verkauft werden Unterlagen plus Bewerbungswerkzeug, keine Bewerbungen, kein Jobversprechen.
// Versprechen und Grenze im selben Blick, „Bitte beachte“ direkt beim Preis, realistische Erwartung, Selbstcheck.
// Deutsch, Englisch, Französisch; andere Sprachen sehen Englisch, bis eine geprüfte Übersetzung da ist.
// Preise kommen aus src/lib/angebot.ts.
import { ANGEBOT, formatPrice } from "@/lib/angebot";

export type Lang = "de" | "en" | "fr";

type Landing = {
  badge: string; h1: string; sub: string; ctaStart: string; ctaCheck: string; trust: string[]; trustNote: string;
  priceTitle: string; priceNote: string; ctaLogin: string; register: string;
  careTitle: string; care: string[]; careStrong: string;
  doTitle: string; doYes: string; doNo: string; yes: string[]; no: string[];
  realTitle: string; real: { n: string; t: string; d: string }[];
  checkTitle: string; checkLead: string; checkBtn: string;
  sampleTitle: string; sampleLead: string; sampleCv: string; sampleLetter: string; sampleNote: string; sampleDesigns: string;
  stepsTitle: string; steps: { t: string; d: string }[];
  faqTitle: string; faq: { q: string; a: string }[];
  facts: string[];
  jobs: string[];
};

function build(lang: Lang): Landing {
  const f = (c: number) => formatPrice(c, lang);
  const price = f(ANGEBOT.startpaket.priceCents), months = ANGEBOT.startpaket.toolMonths;
  const month = f(ANGEBOT.verlaengerung.priceCents), abo = f(ANGEBOT.abo.priceCents);
  if (lang === "en") return {
    badge: "APPLYING IN GERMANY",
    h1: "Your application documents to German standards. And a tool to apply yourself.",
    sub: "We create your application documents to German standards and give you a tool to find suitable jobs and apply yourself. You decide where you apply, and every reply comes straight to you. Whether an employer invites you is their decision, not ours.",
    ctaStart: `Start now · ${price}`, ctaCheck: "Self-check first",
    trust: ["No placement", "No guarantee", "You apply yourself"],
    trustNote: "We cannot guarantee a job. But we tell you upfront where you stand.",
    priceTitle: `Starter package · documents and ${months} months of the tool`, priceNote: `one-time · then ${month} per month or ${abo} a month as a subscription, cancellable monthly`,
    ctaLogin: "Log in and book", register: "No account yet? Register for free",
    careTitle: "Please note",
    care: [
      "To work in Germany you need recognised qualifications and language skills. We do not take care of that.",
      "We make sure your documents look good and are complete, and we give you a tool for your search. Where you apply is up to you. Whether someone hires you is up to the employer.",
      "For context: of 20 people applying from abroad, on average about 2 get a job. You should know that before you book.",
    ],
    careStrong: "If that feels too uncertain: don't book. That's okay.",
    doTitle: "What you get from us and what you don't", doYes: "What we do", doNo: "What we don't do",
    yes: [
      "We check your documents and bring them up to German standards",
      "Your CV in German in four designs, plus a cover letter template as Word and PDF",
      "Job search across the job board of the Federal Employment Agency and other public job boards, prefilled with your profile",
      "A matching cover letter for every job you choose, ready to download",
      "Your own overview: where you applied and what came back",
      "We tell you honestly if your profile has little chance right now",
    ],
    no: [
      "We do not place you in jobs and are not a placement agency",
      "We do not send applications and do not contact companies",
      "We do not pick jobs for you. You decide",
      "We do not guarantee a job, an interview or a reply",
      "We do not obtain visas or recognition of qualifications",
    ],
    realTitle: "What you realistically get",
    real: [
      { n: "1", t: "CV the way German companies expect it", d: "In German, cleanly designed and checked by us. Plus a cover letter template." },
      { n: String(months), t: "months of the application tool", d: "Job search, a cover letter for each job and your overview. After that you extend if you want to." },
      { n: "100 %", t: "your decision", d: "You choose the jobs and send every application yourself, from your own inbox or via the employer's website. Replies come straight to you." },
      { n: "+", t: "documents that belong to you", d: "Download your CV and cover letters at any time and use them anywhere, also after the tool has expired." },
    ],
    checkTitle: "Is WoYou right for you?", checkLead: "Five short questions, free. Then we tell you openly whether booking makes sense for you.", checkBtn: "Go to self-check",
    sampleTitle: "This is what your documents look like", sampleLead: "This is what the CV and cover letter we create with you look like. Simple and easy to read, the way HR departments like it.", sampleCv: "Sample CV", sampleLetter: "Sample cover letter", sampleNote: "Sample with a fictional person", sampleDesigns: "Four designs and six colours to choose from. You pick them in your application folder.",
    stepsTitle: "How it works",
    steps: [
      { t: "Self-check", d: "free, takes a minute" },
      { t: "Book", d: `${price}, online` },
      { t: "Folder", d: "fill in your details, we check them" },
      { t: "Find jobs", d: "search and save in the tool" },
      { t: "Apply yourself", d: "replies come straight to you" },
    ],
    faqTitle: "FAQ",
    faq: [
      { q: "What are my chances of getting a job?", a: "On average, about 2 out of 20 people applying from abroad get a job. We make your documents as good as possible. What an employer requires, we cannot change." },
      { q: "Why don't you give a guarantee?", a: "Because nobody honestly can. Anyone who promises you a job promises something they don't control. We only sell what we really deliver: documents and a tool." },
      { q: "Do you apply to companies for me?", a: "No. You decide where you apply and send your application from your own email address or via the employer's website. We have no contact with employers and don't read any replies." },
      { q: "Where do the jobs come from?", a: "From the job board of the German Federal Employment Agency and other public job boards. The search is prefilled with your profile. You can filter by job, place, radius and working hours and see which German level is required." },
      { q: "Do I get my money back if it doesn't work out?", a: "No. You pay for your documents and the time with the tool, not for a job. Your statutory right of withdrawal is not affected." },
      { q: "Are there any extra costs?", a: `The starter package costs ${price} once and includes ${months} months of the application tool. After that you can extend: ${month} for one month or ${abo} a month as a subscription, cancellable at the end of any month. If you don't extend, your access simply ends. No hidden fees.` },
      { q: "Can I use my documents myself?", a: "Yes. You can download your CV and cover letters at any time and use them for any application, also after the tool has expired." },
      { q: "How do I pay?", a: "Securely online by card through our payment provider Stripe." },
    ],
    facts: ["KarriereKind GmbH, Düsseldorf", "Servers in Germany", "Payment via Stripe", "Personal contact"],
    jobs: ["Care", "Hospitality", "Skilled trades", "Office", "Technology"],
  };
  if (lang === "fr") return {
    badge: "CANDIDATER EN ALLEMAGNE",
    h1: "Votre dossier de candidature aux normes allemandes. Et un outil pour postuler vous-même.",
    sub: "Nous créons votre dossier de candidature aux normes allemandes et vous donnons un outil pour trouver des offres adaptées et postuler vous-même. Vous décidez où vous postulez et vous recevez toutes les réponses directement. C'est l'employeur qui décide de vous inviter, pas nous.",
    ctaStart: `Commencer · ${price}`, ctaCheck: "D'abord l'auto-test",
    trust: ["Pas de placement", "Pas de garantie", "Vous postulez vous-même"],
    trustNote: "Nous ne garantissons pas d'emploi. Mais nous vous disons dès le départ où vous en êtes.",
    priceTitle: `Pack de départ · dossier et ${months} mois d'outil`, priceNote: `paiement unique · ensuite ${month} par mois ou ${abo} par mois en abonnement, résiliable chaque mois`,
    ctaLogin: "Se connecter et réserver", register: "Pas encore de compte ? Inscription gratuite",
    careTitle: "À noter malgré tout",
    care: [
      "Pour travailler en Allemagne, il faut des qualifications reconnues et des connaissances linguistiques. Nous ne nous en occupons pas.",
      "Nous veillons à ce que votre dossier soit soigné et complet, et nous vous donnons un outil pour votre recherche. Où vous postulez, c'est vous qui décidez. Vous embaucher, c'est l'employeur qui décide.",
      "Pour situer : sur 20 personnes qui postulent depuis l'étranger, environ 2 obtiennent un poste en moyenne. Mieux vaut le savoir avant de réserver.",
    ],
    careStrong: "Si c'est trop incertain pour vous : ne réservez pas. C'est tout à fait correct.",
    doTitle: "Ce que vous obtenez chez nous et ce que vous n'obtenez pas", doYes: "Ce que nous faisons", doNo: "Ce que nous ne faisons pas",
    yes: [
      "Nous vérifions vos documents et les mettons aux normes allemandes",
      "Votre CV en allemand en quatre designs, plus un modèle de lettre en Word et PDF",
      "Une recherche d'emploi dans la bourse de l'Agence fédérale pour l'emploi et d'autres bourses publiques, préremplie avec votre profil",
      "Une lettre adaptée pour chaque offre que vous choisissez, à télécharger",
      "Votre propre suivi : où vous avez postulé et ce qui est revenu",
      "Nous vous disons franchement si votre profil a peu de chances en ce moment",
    ],
    no: [
      "Nous ne plaçons personne et ne sommes pas une agence de placement",
      "Nous n'envoyons pas de candidatures et ne contactons pas d'entreprises",
      "Nous ne choisissons pas d'offres pour vous. C'est vous qui décidez",
      "Nous ne garantissons ni poste, ni entretien, ni réponse",
      "Nous ne nous occupons ni du visa ni de la reconnaissance des diplômes",
    ],
    realTitle: "Ce que vous obtenez réellement",
    real: [
      { n: "1", t: "CV comme l'attendent les entreprises allemandes", d: "En allemand, soigné et vérifié par nous. Plus un modèle de lettre." },
      { n: String(months), t: "mois d'outil de candidature", d: "Recherche d'emploi, une lettre par offre et votre suivi. Ensuite, vous prolongez si vous le souhaitez." },
      { n: "100 %", t: "votre décision", d: "Vous choisissez les offres et envoyez chaque candidature vous-même, depuis votre boîte e-mail ou sur le site de l'employeur. Les réponses vous arrivent directement." },
      { n: "+", t: "des documents qui vous appartiennent", d: "Téléchargez votre CV et vos lettres à tout moment et utilisez-les partout, même après la fin de l'outil." },
    ],
    checkTitle: "WoYou vous convient-il ?", checkLead: "Cinq questions courtes, gratuit. Ensuite nous vous disons franchement si une réservation vaut la peine pour vous.", checkBtn: "Faire l'auto-test",
    sampleTitle: "Voici à quoi ressemblent vos documents", sampleLead: "Voici à quoi ressemblent le CV et la lettre que nous créons avec vous. Simples et lisibles, comme les services RH les aiment.", sampleCv: "CV modèle", sampleLetter: "Lettre modèle", sampleNote: "Modèle avec une personne fictive", sampleDesigns: "Quatre designs et six couleurs au choix. Vous les choisissez dans votre dossier.",
    stepsTitle: "Déroulement",
    steps: [
      { t: "Auto-test", d: "gratuit, une minute" },
      { t: "Réserver", d: `${price}, en ligne` },
      { t: "Dossier", d: "vous remplissez, nous vérifions" },
      { t: "Trouver des offres", d: "chercher et garder dans l'outil" },
      { t: "Postuler vous-même", d: "les réponses vous arrivent directement" },
    ],
    faqTitle: "Questions fréquentes",
    faq: [
      { q: "Quelle est ma chance d'obtenir un poste ?", a: "En moyenne, environ 2 personnes sur 20 qui postulent depuis l'étranger obtiennent un poste. Nous rendons votre dossier aussi bon que possible. Les exigences des employeurs, nous ne pouvons pas les changer." },
      { q: "Pourquoi ne donnez-vous pas de garantie ?", a: "Parce que personne ne peut honnêtement la donner. Celui qui vous promet un poste promet quelque chose qu'il ne maîtrise pas. Nous vendons seulement ce que nous fournissons vraiment : un dossier et un outil." },
      { q: "Postulez-vous pour moi auprès des entreprises ?", a: "Non. Vous décidez où vous postulez et envoyez votre candidature depuis votre propre adresse e-mail ou sur le site de l'employeur. Nous n'avons aucun contact avec les employeurs et ne lisons pas les réponses." },
      { q: "D'où viennent les offres ?", a: "De la bourse de l'emploi de l'Agence fédérale allemande pour l'emploi et d'autres bourses publiques. La recherche reprend votre profil. Vous filtrez par métier, lieu, rayon et temps de travail, et vous voyez le niveau d'allemand demandé." },
      { q: "Suis-je remboursé si cela ne marche pas ?", a: "Non. Vous payez pour votre dossier et le temps avec l'outil, pas pour un poste. Votre droit légal de rétractation n'est pas concerné." },
      { q: "Y a-t-il d'autres frais ?", a: `Le pack de départ coûte ${price} une seule fois et comprend ${months} mois d'outil de candidature. Ensuite, vous pouvez prolonger : ${month} pour un mois ou ${abo} par mois en abonnement, résiliable à la fin de chaque mois. Sans prolongation, l'accès s'arrête simplement. Aucun frais caché.` },
      { q: "Puis-je utiliser mes documents moi-même ?", a: "Oui. Vous pouvez télécharger votre CV et vos lettres à tout moment et les utiliser pour toute candidature, même après la fin de l'outil." },
      { q: "Comment payer ?", a: "En ligne par carte, de façon sécurisée, via notre prestataire de paiement Stripe." },
    ],
    facts: ["KarriereKind GmbH, Düsseldorf", "Serveurs en Allemagne", "Paiement via Stripe", "Interlocuteur personnel"],
    jobs: ["Soins", "Restauration", "Artisanat", "Bureau", "Technique"],
  };
  return {
    badge: "BEWERBEN IN DEUTSCHLAND",
    h1: "Deine Bewerbungsunterlagen nach deutschem Standard. Und ein Werkzeug, mit dem du dich selbst bewirbst.",
    sub: "Wir erstellen deine Bewerbungsunterlagen nach deutschem Standard und geben dir ein Werkzeug, mit dem du passende Stellen findest und dich selbst bewirbst. Du entscheidest, wo du dich bewirbst, und bekommst alle Antworten direkt. Ob dich ein Arbeitgeber einlädt, entscheidet er. Nicht wir.",
    ctaStart: `Jetzt starten · ${price}`, ctaCheck: "Erst Selbstcheck",
    trust: ["Keine Vermittlung", "Keine Garantie", "Du bewirbst dich selbst"],
    trustNote: "Eine Jobgarantie gibt es bei uns nicht. Dafür sagen wir dir vorher, woran du bist.",
    priceTitle: `Startpaket · Unterlagen und ${months} Monate Werkzeug`, priceNote: `einmalig · danach ${month} je Monat oder ${abo} im Monat im Abo, monatlich kündbar`,
    ctaLogin: "Anmelden und buchen", register: "Noch kein Konto? Kostenlos registrieren",
    careTitle: "Bitte beachte trotzdem",
    care: [
      "Für eine Beschäftigung in Deutschland sind anerkannte Qualifikationen und Sprachkenntnisse nötig. Darum kümmern wir uns nicht.",
      "Wir sorgen dafür, dass deine Unterlagen gut aussehen und vollständig sind, und geben dir ein Werkzeug für die Suche. Wo du dich bewirbst, entscheidest du. Ob dich jemand einstellt, entscheidet der Arbeitgeber.",
      "Zur Einordnung: Von 20 Menschen, die sich aus dem Ausland bewerben, bekommen im Schnitt etwa 2 eine Stelle. Das solltest du wissen, bevor du buchst.",
    ],
    careStrong: "Wenn dir das zu unsicher ist: Buche nicht. Das ist in Ordnung.",
    doTitle: "Was du bei uns bekommst und was nicht", doYes: "Das machen wir", doNo: "Das machen wir nicht",
    yes: [
      "Wir prüfen deine Unterlagen und bringen sie auf deutschen Standard",
      "Dein Lebenslauf auf Deutsch in vier Designs, dazu eine Anschreiben-Vorlage als Word und PDF",
      "Stellensuche über die Jobbörse der Bundesagentur und weitere öffentliche Stellenbörsen, vorbelegt mit deinem Profil",
      "Für jede Stelle, die du auswählst, ein passendes Anschreiben zum Herunterladen",
      "Deine eigene Übersicht: wo du dich beworben hast und was zurückkam",
      "Wir sagen dir ehrlich, wenn dein Profil aktuell kaum Chancen hat",
    ],
    no: [
      "Wir vermitteln keine Jobs und sind keine Vermittlungsagentur",
      "Wir verschicken keine Bewerbungen und schreiben keine Firmen an",
      "Wir suchen keine Stellen für dich aus. Das entscheidest du",
      "Wir garantieren keine Stelle, kein Gespräch, keine Antwort",
      "Wir beschaffen kein Visum und keine Berufsanerkennung",
    ],
    realTitle: "Was du realistisch bekommst",
    real: [
      { n: "1", t: "Lebenslauf, wie ihn deutsche Firmen erwarten", d: "Auf Deutsch, sauber gestaltet und von uns geprüft. Dazu eine Anschreiben-Vorlage." },
      { n: String(months), t: "Monate Bewerbungswerkzeug", d: "Stellensuche, Anschreiben je Stelle und deine Übersicht. Danach verlängerst du, wenn du willst." },
      { n: "100 %", t: "deine Entscheidung", d: "Du wählst die Stellen aus und schickst jede Bewerbung selbst, aus deinem Postfach oder über die Seite des Arbeitgebers. Antworten kommen direkt zu dir." },
      { n: "+", t: "Unterlagen, die dir gehören", d: "Lebenslauf und Anschreiben kannst du jederzeit herunterladen und überall nutzen, auch wenn das Werkzeug abgelaufen ist." },
    ],
    checkTitle: "Passt WoYou zu dir?", checkLead: "Fünf kurze Fragen, kostenlos. Danach sagen wir dir offen, ob sich eine Buchung für dich lohnt.", checkBtn: "Zum Selbstcheck",
    sampleTitle: "So sehen deine Unterlagen aus", sampleLead: "So sehen Lebenslauf und Anschreiben aus, die wir mit dir erstellen. Schlicht und gut lesbar, so wie Personalabteilungen es mögen.", sampleCv: "Muster-Lebenslauf", sampleLetter: "Muster-Anschreiben", sampleNote: "Muster mit erfundener Person", sampleDesigns: "Vier Designs und sechs Farben zur Wahl. Du suchst sie in deiner Bewerbungsmappe aus.",
    stepsTitle: "So läuft es ab",
    steps: [
      { t: "Selbstcheck", d: "kostenlos, dauert eine Minute" },
      { t: "Buchen", d: `${price}, online` },
      { t: "Mappe", d: "du füllst aus, wir prüfen" },
      { t: "Stellen finden", d: "im Werkzeug suchen und merken" },
      { t: "Selbst bewerben", d: "Antworten kommen direkt zu dir" },
    ],
    faqTitle: "Häufige Fragen",
    faq: [
      { q: "Wie hoch ist meine Chance auf eine Stelle?", a: "Im Schnitt bekommen etwa 2 von 20 Menschen, die sich aus dem Ausland bewerben, eine Stelle. Wir machen deine Unterlagen so gut wie möglich. Was ein Arbeitgeber verlangt, können wir nicht ändern." },
      { q: "Warum gebt ihr keine Garantie?", a: "Weil das niemand ehrlich kann. Wer dir eine Stelle verspricht, verspricht etwas, das er nicht in der Hand hat. Wir verkaufen dir nur, was wir auch wirklich liefern: Unterlagen und ein Werkzeug." },
      { q: "Bewerbt ihr mich bei Firmen?", a: "Nein. Du entscheidest selbst, wo du dich bewirbst, und schickst die Bewerbung aus deinem eigenen E-Mail-Postfach oder über die Seite des Arbeitgebers. Wir haben keinen Kontakt zu Arbeitgebern und lesen keine Antworten mit." },
      { q: "Woher kommen die Stellen?", a: "Aus der Jobbörse der Bundesagentur für Arbeit und weiteren öffentlichen Stellenbörsen. Die Suche ist mit deinem Profil vorbelegt. Du filterst nach Beruf, Ort, Umkreis und Arbeitszeit und siehst, welches Deutsch verlangt wird." },
      { q: "Bekomme ich mein Geld zurück, wenn es nicht klappt?", a: "Nein. Du bezahlst für deine Unterlagen und die Zeit mit dem Werkzeug, nicht für eine Stelle. Dein gesetzliches Widerrufsrecht bleibt davon unberührt." },
      { q: "Kommen noch weitere Kosten dazu?", a: `Das Startpaket kostet einmalig ${price} und enthält ${months} Monate Bewerbungswerkzeug. Danach kannst du verlängern: ${month} für einen Monat oder ${abo} im Monat im Abo, jederzeit zum Monatsende kündbar. Wenn du nichts verlängerst, endet der Zugang einfach. Versteckte Gebühren gibt es nicht.` },
      { q: "Darf ich meine Unterlagen selbst nutzen?", a: "Ja. Lebenslauf und Anschreiben kannst du jederzeit herunterladen und für jede Bewerbung verwenden, auch wenn das Werkzeug abgelaufen ist." },
      { q: "Wie bezahle ich?", a: "Sicher online mit Karte über unseren Zahlungsanbieter Stripe." },
    ],
    facts: ["KarriereKind GmbH, Düsseldorf", "Server in Deutschland", "Zahlung über Stripe", "Persönliche Ansprechperson"],
    jobs: ["Pflege", "Gastronomie", "Handwerk", "Büro", "Technik"],
  };
}

export const LANDING: Record<Lang, Landing> = { de: build("de"), en: build("en"), fr: build("fr") };
export const landingCopy = (locale: string) => LANDING[(locale === "de" || locale === "fr" ? locale : "en") as Lang];

// Bildwelt (siehe BILDWELT.md): echte Menschen bei der Arbeit, fünf Berufe im Wechsel, freie Unsplash-Lizenz
const U = (id: string, w = 1200) => `https://images.unsplash.com/${id}?w=${w}&q=75&auto=format&fit=crop`;
export const IMAGES = {
  hero: [
    U("photo-1765896387387-0538bc9f997e"), // Pflege: Pflegekraft mit älterer Dame
    U("photo-1577219491135-ce391730fb2c"), // Gastronomie: Koch in der Küche
    U("photo-1646640381839-02748ae8ddf0"), // Handwerk: Handwerker mit Bohrmaschine
    U("photo-1758876202618-7197443c717f"), // Büro: Kollegin am Arbeitsplatz
    U("photo-1621905251189-08b45d6a269e"), // Technik: Elektriker mit Helm
  ],
  talk: U("photo-1573497620053-ea5300f94f21", 900), // Erstgespräch
  papers: U("photo-1664382953403-fc1ac77073a0", 900), // Logistik: zwei Kolleginnen im Lager
};
