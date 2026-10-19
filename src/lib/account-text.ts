// Texte im Kundenbereich („Mein Bereich“), bei Nachkauf/Abo und auf der Buchungsseite, je Sprache.
// Platzhalter in {geschweiften Klammern} mit fill() ersetzen.
type T = {
  paidThanks: string; payAborted: string; alreadyBooked: string; stateSent: string;
  sent: string; left: string; unlimited: string; aboUntil: string; myMappe: string;
  more: string; moreLead: string; offersTitle: string; offersLead: string; offersEmpty: string; viaEmployer: string; answer: string; docsLead: string;
  offer: Record<"SUGGESTED" | "SELECTED" | "READY" | "SENT" | "APPLIED_MANUALLY", string>;
  booking: Record<"REQUESTED" | "PENDING_PAYMENT" | "PAID" | "IN_PROGRESS" | "DONE" | "CANCELLED", string>;
  pack: string; abo: string; perMonth: string; packTitle: string; aboTitle: string;
  terms: [string, string, string, string, string]; waiver: string; order: string; orderNoPay: string; cancel: string;
  ordered: string; failed: string; cancelAsk: string; cancelNow: string; no: string; cancelBtn: string; cancelled: string; cancelling: string;
};

const de: T = {
  paidThanks: "Danke für deinen Kauf! Sobald die Zahlung bestätigt ist, ist dein Guthaben freigeschaltet.",
  payAborted: "Die Zahlung wurde abgebrochen. Du kannst es jederzeit erneut versuchen.",
  alreadyBooked: "Du hast den Bewerbungs-Service bereits gebucht.", stateSent: "Stand: {sent} Bewerbungen verschickt.",
  sent: "Verschickte Bewerbungen", left: "Noch übrig", unlimited: "unbegrenzt", aboUntil: "Abo bezahlt bis {date}", myMappe: "Meine Bewerbungsmappe",
  more: "Mehr Bewerbungen", moreLead: "25 weitere einmalig oder unbegrenzt im Abo, jederzeit zum Monatsende kündbar.",
  offersTitle: "Deine Stellenangebote", offersLead: "Diese Stellen haben wir für dich gefunden. Unser Team prüft sie, gibt die passenden frei und bewirbt dich per E-Mail. Antworten der Firmen bekommst du direkt.",
  offersEmpty: "Sobald deine Mappe freigegeben ist, erscheinen hier passende Stellen.", viaEmployer: "Bewerbung über die Seite des Arbeitgebers", answer: "Antwort",
  docsLead: "Zeugnisse, Nachweise und Zertifikate. Wir legen sie deinen Bewerbungen bei, wenn sie passen.",
  offer: { SUGGESTED: "Vorschlag", SELECTED: "wird vorbereitet", READY: "freigegeben", SENT: "beworben", APPLIED_MANUALLY: "beworben" },
  booking: { REQUESTED: "Angefragt", PENDING_PAYMENT: "Zahlung offen", PAID: "Bezahlt", IN_PROGRESS: "In Arbeit", DONE: "Abgeschlossen", CANCELLED: "Storniert" },
  pack: "25 weitere Bewerbungen", abo: "Unbegrenzt bewerben", perMonth: "im Monat", packTitle: "25 weitere Bewerbungen für {price} (einmalig)", aboTitle: "Unbegrenzt bewerben für {price} im Monat (monatlich kündbar)",
  terms: ["Ich akzeptiere die ", "AGB", " und habe die ", "Datenschutzerklärung", " gelesen."],
  waiver: "Ich möchte, dass WoYou sofort weiter für mich bewirbt. Mir ist bekannt, dass ich bei einem Widerruf die bis dahin erbrachten Leistungen anteilig bezahle.",
  order: "Zahlungspflichtig bestellen", orderNoPay: "Zahlungspflichtig bestellen (Zahlungslink folgt)", cancel: "Abbrechen",
  ordered: "Danke! Wir haben deine Bestellung erhalten und schicken dir den Link zur Zahlung.", failed: "Das hat nicht geklappt.",
  cancelAsk: "Abo wirklich kündigen? Es läuft bis {date}.", cancelNow: "Jetzt kündigen", no: "Nein", cancelBtn: "Verträge hier kündigen",
  cancelled: "Dein Abo ist gekündigt. Du kannst bis {date} weiter unbegrenzt bewerben lassen.", cancelling: "Abo gekündigt, läuft bis {date}.",
};

const en: T = {
  paidThanks: "Thank you for your purchase! As soon as the payment is confirmed, your credit is unlocked.",
  payAborted: "The payment was cancelled. You can try again at any time.",
  alreadyBooked: "You have already booked the application service.", stateSent: "Status: {sent} applications sent.",
  sent: "Applications sent", left: "Still left", unlimited: "unlimited", aboUntil: "Subscription paid until {date}", myMappe: "My application file",
  more: "More applications", moreLead: "25 more once, or unlimited with a subscription you can cancel at the end of any month.",
  offersTitle: "Your job offers", offersLead: "We found these jobs for you. Our team checks them, approves the suitable ones and applies for you by email. Companies reply to you directly.",
  offersEmpty: "As soon as your file is approved, suitable jobs will appear here.", viaEmployer: "Apply via the employer's website", answer: "Reply",
  docsLead: "Certificates and proof of qualifications. We attach them to your applications where they fit.",
  offer: { SUGGESTED: "suggested", SELECTED: "being prepared", READY: "approved", SENT: "applied", APPLIED_MANUALLY: "applied" },
  booking: { REQUESTED: "Requested", PENDING_PAYMENT: "Payment open", PAID: "Paid", IN_PROGRESS: "In progress", DONE: "Completed", CANCELLED: "Cancelled" },
  pack: "25 more applications", abo: "Unlimited applications", perMonth: "a month", packTitle: "25 more applications for {price} (one-time)", aboTitle: "Unlimited applications for {price} a month (cancel monthly)",
  terms: ["I accept the ", "terms and conditions", " and have read the ", "privacy policy", "."],
  waiver: "I want WoYou to keep applying for me right away. I know that if I withdraw, I pay proportionally for the services provided until then.",
  order: "Order with obligation to pay", orderNoPay: "Order with obligation to pay (payment link follows)", cancel: "Cancel",
  ordered: "Thank you! We received your order and will send you the payment link.", failed: "That didn't work.",
  cancelAsk: "Really cancel the subscription? It runs until {date}.", cancelNow: "Cancel now", no: "No", cancelBtn: "Cancel contracts here",
  cancelled: "Your subscription is cancelled. You can keep applying without limit until {date}.", cancelling: "Subscription cancelled, runs until {date}.",
};

const fr: T = {
  paidThanks: "Merci pour votre achat ! Dès que le paiement est confirmé, votre crédit est activé.",
  payAborted: "Le paiement a été annulé. Vous pouvez réessayer à tout moment.",
  alreadyBooked: "Vous avez déjà réservé le service de candidature.", stateSent: "État : {sent} candidatures envoyées.",
  sent: "Candidatures envoyées", left: "Restantes", unlimited: "illimité", aboUntil: "Abonnement payé jusqu'au {date}", myMappe: "Mon dossier de candidature",
  more: "Plus de candidatures", moreLead: "25 de plus en une fois, ou illimité avec un abonnement résiliable à la fin de chaque mois.",
  offersTitle: "Vos offres d'emploi", offersLead: "Nous avons trouvé ces offres pour vous. Notre équipe les vérifie, valide celles qui conviennent et postule pour vous par e-mail. Les entreprises vous répondent directement.",
  offersEmpty: "Dès que votre dossier est validé, des offres adaptées apparaissent ici.", viaEmployer: "Candidature sur le site de l'employeur", answer: "Réponse",
  docsLead: "Diplômes, attestations et certificats. Nous les joignons à vos candidatures quand ils conviennent.",
  offer: { SUGGESTED: "proposée", SELECTED: "en préparation", READY: "validée", SENT: "candidature envoyée", APPLIED_MANUALLY: "candidature envoyée" },
  booking: { REQUESTED: "Demandé", PENDING_PAYMENT: "Paiement en attente", PAID: "Payé", IN_PROGRESS: "En cours", DONE: "Terminé", CANCELLED: "Annulé" },
  pack: "25 candidatures de plus", abo: "Candidatures illimitées", perMonth: "par mois", packTitle: "25 candidatures de plus pour {price} (paiement unique)", aboTitle: "Candidatures illimitées pour {price} par mois (résiliable chaque mois)",
  terms: ["J'accepte les ", "CGV", " et j'ai lu la ", "politique de confidentialité", "."],
  waiver: "Je souhaite que WoYou continue à postuler pour moi immédiatement. Je sais qu'en cas de rétractation, je paie au prorata les services déjà fournis.",
  order: "Commander avec obligation de paiement", orderNoPay: "Commander avec obligation de paiement (lien de paiement à suivre)", cancel: "Annuler",
  ordered: "Merci ! Nous avons reçu votre commande et vous envoyons le lien de paiement.", failed: "Cela n'a pas fonctionné.",
  cancelAsk: "Vraiment résilier l'abonnement ? Il court jusqu'au {date}.", cancelNow: "Résilier maintenant", no: "Non", cancelBtn: "Résilier les contrats ici",
  cancelled: "Votre abonnement est résilié. Vous pouvez continuer sans limite jusqu'au {date}.", cancelling: "Abonnement résilié, actif jusqu'au {date}.",
};

const ar: T = {
  paidThanks: "شكرًا على الشراء! بمجرد تأكيد الدفع يتم تفعيل رصيدك.",
  payAborted: "تم إلغاء الدفع. يمكنك المحاولة مرة أخرى في أي وقت.",
  alreadyBooked: "لقد حجزت خدمة التقديم بالفعل.", stateSent: "الحالة: تم إرسال {sent} طلبًا.",
  sent: "الطلبات المرسلة", left: "المتبقي", unlimited: "غير محدود", aboUntil: "الاشتراك مدفوع حتى {date}", myMappe: "ملف التقديم الخاص بي",
  more: "المزيد من الطلبات", moreLead: "25 طلبًا إضافيًا مرة واحدة، أو عدد غير محدود باشتراك يمكن إلغاؤه في نهاية كل شهر.",
  offersTitle: "عروض العمل الخاصة بك", offersLead: "وجدنا لك هذه الوظائف. يراجعها فريقنا ويعتمد المناسبة منها ويقدّم عنك بالبريد الإلكتروني. ردود الشركات تصلك مباشرة.",
  offersEmpty: "بمجرد اعتماد ملفك ستظهر هنا وظائف مناسبة.", viaEmployer: "التقديم عبر موقع صاحب العمل", answer: "الرد",
  docsLead: "الشهادات والإثباتات. نرفقها بطلباتك عندما تكون مناسبة.",
  offer: { SUGGESTED: "مقترحة", SELECTED: "قيد التحضير", READY: "معتمدة", SENT: "تم التقديم", APPLIED_MANUALLY: "تم التقديم" },
  booking: { REQUESTED: "مطلوب", PENDING_PAYMENT: "الدفع معلق", PAID: "مدفوع", IN_PROGRESS: "قيد التنفيذ", DONE: "مكتمل", CANCELLED: "ملغى" },
  pack: "25 طلبًا إضافيًا", abo: "طلبات غير محدودة", perMonth: "شهريًا", packTitle: "25 طلبًا إضافيًا مقابل {price} (مرة واحدة)", aboTitle: "طلبات غير محدودة مقابل {price} شهريًا (يمكن الإلغاء شهريًا)",
  terms: ["أوافق على ", "الشروط والأحكام", " وقرأت ", "سياسة الخصوصية", "."],
  waiver: "أريد أن تواصل WoYou التقديم عني فورًا. أعلم أنني عند الانسحاب أدفع بشكل نسبي مقابل الخدمات المقدمة حتى ذلك الحين.",
  order: "طلب ملزم بالدفع", orderNoPay: "طلب ملزم بالدفع (سيصلك رابط الدفع)", cancel: "إلغاء",
  ordered: "شكرًا! استلمنا طلبك وسنرسل لك رابط الدفع.", failed: "لم ينجح ذلك.",
  cancelAsk: "هل تريد فعلًا إلغاء الاشتراك؟ يستمر حتى {date}.", cancelNow: "إلغاء الآن", no: "لا", cancelBtn: "إلغاء العقود من هنا",
  cancelled: "تم إلغاء اشتراكك. يمكنك مواصلة التقديم دون حدود حتى {date}.", cancelling: "تم إلغاء الاشتراك، يستمر حتى {date}.",
};

const hi: T = {
  paidThanks: "ख़रीदारी के लिए धन्यवाद! भुगतान की पुष्टि होते ही आपका क्रेडिट चालू हो जाएगा।",
  payAborted: "भुगतान रद्द हो गया। आप कभी भी फिर से कोशिश कर सकते हैं।",
  alreadyBooked: "आप आवेदन सेवा पहले ही बुक कर चुके हैं।", stateSent: "स्थिति: {sent} आवेदन भेजे गए।",
  sent: "भेजे गए आवेदन", left: "बाकी", unlimited: "असीमित", aboUntil: "सदस्यता {date} तक भुगतान की गई", myMappe: "मेरी आवेदन फ़ाइल",
  more: "और आवेदन", moreLead: "एक बार में 25 और, या असीमित सदस्यता जिसे हर महीने के अंत में रद्द किया जा सकता है।",
  offersTitle: "आपके लिए नौकरियाँ", offersLead: "ये नौकरियाँ हमने आपके लिए खोजी हैं। हमारी टीम इन्हें जाँचती है, उपयुक्त को मंज़ूरी देती है और ईमेल से आपकी ओर से आवेदन करती है। कंपनियाँ सीधे आपको जवाब देती हैं।",
  offersEmpty: "आपकी फ़ाइल स्वीकृत होते ही यहाँ उपयुक्त नौकरियाँ दिखेंगी।", viaEmployer: "नियोक्ता की वेबसाइट से आवेदन", answer: "जवाब",
  docsLead: "प्रमाणपत्र और योग्यता के दस्तावेज़। जहाँ ठीक हों, हम इन्हें आपके आवेदनों के साथ लगाते हैं।",
  offer: { SUGGESTED: "सुझाव", SELECTED: "तैयारी में", READY: "मंज़ूर", SENT: "आवेदन भेजा", APPLIED_MANUALLY: "आवेदन भेजा" },
  booking: { REQUESTED: "अनुरोध किया", PENDING_PAYMENT: "भुगतान बाकी", PAID: "भुगतान हो गया", IN_PROGRESS: "काम चल रहा है", DONE: "पूरा", CANCELLED: "रद्द" },
  pack: "25 और आवेदन", abo: "असीमित आवेदन", perMonth: "प्रति माह", packTitle: "{price} में 25 और आवेदन (एक बार)", aboTitle: "{price} प्रति माह में असीमित आवेदन (हर महीने रद्द कर सकते हैं)",
  terms: ["मैं ", "नियम और शर्तें", " स्वीकार करता/करती हूँ और ", "गोपनीयता नीति", " पढ़ ली है।"],
  waiver: "मैं चाहता/चाहती हूँ कि WoYou तुरंत मेरे लिए आवेदन जारी रखे। मुझे पता है कि वापस लेने पर तब तक की सेवाओं का अनुपात में भुगतान करना होगा।",
  order: "भुगतान के साथ ऑर्डर करें", orderNoPay: "भुगतान के साथ ऑर्डर करें (भुगतान लिंक बाद में आएगा)", cancel: "रद्द करें",
  ordered: "धन्यवाद! हमें आपका ऑर्डर मिल गया है, हम भुगतान का लिंक भेजेंगे।", failed: "यह काम नहीं किया।",
  cancelAsk: "क्या सच में सदस्यता रद्द करनी है? यह {date} तक चलेगी।", cancelNow: "अभी रद्द करें", no: "नहीं", cancelBtn: "अनुबंध यहाँ रद्द करें",
  cancelled: "आपकी सदस्यता रद्द हो गई है। आप {date} तक असीमित आवेदन करवा सकते हैं।", cancelling: "सदस्यता रद्द, {date} तक चलेगी।",
};

const ALL = { de, en, fr, ar, hi };
export const accountText = (locale: string): T => ALL[(locale in ALL ? locale : "en") as keyof typeof ALL];
export const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));
