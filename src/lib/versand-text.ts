// Texte für den Selbstversand (Bewerbung prüfen, selbst senden, eintragen) und die Bewerbungs-Adresse im Profil.
// Deutsch, Englisch, Französisch, Arabisch (rechts nach links), Hindi; alle anderen Sprachen bekommen Englisch.
// Textregeln: du-Form, menschlich, keine langen Gedankenstriche, kein Jobversprechen.
// Klar sagen: Die Person schickt selbst aus dem eigenen Postfach, WoYou verschickt nichts.
// Keine Server-Importe: wird in Client-Komponenten verwendet.
import { wLang } from "@/lib/werkzeug-text";

type HowTo = { title: string; text: string };
export type VersandUI = {
  open: string; stepCheck: string; stepSend: string; stepDone: string; next: string; back: string;
  letterHead: string; letterHint: string; letterView: string; needLetter: string;
  cvHead: string; cvHint: string; cvView: string; cvEdit: string;
  mailHead: string; to: string; toPh: string; toFromAd: string; toMissing: string; portal: string;
  subject: string; body: string; reset: string; save: string; saved: string; from: string; fromNone: string; fromChange: string;
  sendLead: string; openMail: string; openMailHint: string; noRecipient: string; truncated: string;
  pdfHead: string; bundle: string; letterPdf: string; cvPdf: string; twoFiles: string;
  eml: string; emlHint: string;
  copyHead: string; copyTo: string; copySubject: string; copyBody: string; copied: string;
  howTo: string; howToList: HowTo[];
  doneHead: string; doneLead: string; sentOn: string; followUp: string; sentBtn: string; sentOk: string;
  followUpOn: string; followUpDue: string; followUpClear: string;
  profileHead: string; profileLead: string; profilePh: string; profileSave: string; profileSaved: string; profileNow: string;
};

const de: VersandUI = {
  open: "Bewerbung prüfen und senden", stepCheck: "1. Prüfen", stepSend: "2. Senden", stepDone: "3. Eintragen", next: "Weiter", back: "Zurück",
  letterHead: "Anschreiben", letterHint: "Lies das Anschreiben in Ruhe und ändere, was nicht passt. Deine Änderungen werden gespeichert, sobald du das Feld verlässt.",
  letterView: "Anschreiben ansehen", needLetter: "Für diese Stelle gibt es noch kein Anschreiben. Wir setzen es aus deiner Bewerbungsmappe zusammen.",
  cvHead: "Lebenslauf", cvHint: "Deinen Lebenslauf änderst du in der Bewerbungsmappe. Die Änderung gilt dann für alle Bewerbungen.", cvView: "Lebenslauf ansehen", cvEdit: "In der Bewerbungsmappe ändern",
  mailHead: "E-Mail", to: "An (E-Mail-Adresse aus der Anzeige)", toPh: "z. B. bewerbung@firma.de", toFromAd: "Aus der Anzeige übernommen. Prüf sie bitte kurz.",
  toMissing: "In der Anzeige haben wir keine E-Mail-Adresse gefunden. Schau in der Anzeige nach und trag sie hier ein. Manche Firmen nehmen Bewerbungen nur über ihr eigenes Bewerbungsportal an, dann lädst du dort die PDF hoch.",
  portal: "Zur Anzeige bzw. zum Bewerbungsportal",
  subject: "Betreff", body: "Text der E-Mail", reset: "Vorschlag wiederherstellen", save: "Speichern", saved: "Gespeichert.",
  from: "Du schreibst von deiner eigenen Adresse: {email}", fromNone: "Trag in Mein Bereich deine E-Mail-Adresse für Bewerbungen ein.", fromChange: "Adresse ändern",
  sendLead: "Du schickst die Bewerbung selbst aus deinem eigenen Postfach. Antworten kommen direkt zu dir. WoYou verschickt nichts und liest nichts mit.",
  openMail: "In meinem Mailprogramm öffnen", openMailHint: "Empfänger, Betreff und Text sind schon eingetragen. Häng danach die PDF an.",
  noRecipient: "Ohne Empfänger öffnet sich eine leere Adresszeile. Du kannst die Adresse auch dort eintragen.",
  truncated: "Der Text ist für diesen Weg zu lang und wurde gekürzt. Kopier ihn lieber mit dem Knopf unten.",
  pdfHead: "Unterlagen als PDF herunterladen", bundle: "Anschreiben und Lebenslauf (eine PDF)", letterPdf: "nur Anschreiben", cvPdf: "nur Lebenslauf",
  twoFiles: "Du nutzt deinen eigenen Lebenslauf. Lade bitte beide Dateien herunter und häng beide an.",
  eml: "Fertige E-Mail mit Anhängen herunterladen (.eml)", emlHint: "Für Outlook, Apple Mail oder Thunderbird am Computer. Die Anhänge sind schon dabei.",
  copyHead: "Für Webmail und Handy", copyTo: "Adresse kopieren", copySubject: "Betreff kopieren", copyBody: "Text kopieren", copied: "Kopiert.",
  howTo: "So geht's auf deinem Gerät",
  howToList: [
    { title: "Computer mit Outlook, Apple Mail oder Thunderbird", text: "Lade die .eml-Datei herunter und öffne sie mit Doppelklick. Outlook öffnet sie als Entwurf. In Apple Mail wählst du im Menü „Nachricht“ den Punkt „Erneut senden“, in Thunderbird „Als neu bearbeiten“. Prüf alles und klick auf Senden." },
    { title: "Gmail (App oder Browser)", text: "Lade zuerst die PDF herunter. Tipp dann auf „In meinem Mailprogramm öffnen“ oder kopier Adresse, Betreff und Text in eine neue E-Mail. Über die Büroklammer wählst du „Datei anhängen“, die PDF liegt im Ordner Downloads." },
    { title: "iPhone Mail", text: "Lade zuerst die PDF herunter, sie liegt dann in der App Dateien unter Downloads. Tipp auf „In meinem Mailprogramm öffnen“, dann in den Text und auf das Symbol über der Tastatur. Mit „Datei anhängen“ wählst du die PDF aus." },
    { title: "Outlook-App am Handy", text: "Lade zuerst die PDF herunter. Tipp auf „In meinem Mailprogramm öffnen“ und wähl Outlook. Über die Büroklammer hängst du die PDF aus Downloads an." },
  ],
  doneHead: "Abgeschickt?", doneLead: "Wenn die E-Mail raus ist, trag es hier ein. So behältst du den Überblick.", sentOn: "Gesendet am",
  followUp: "Erinnere mich ans Nachfassen am", sentBtn: "Ich habe gesendet", sentOk: "Eingetragen: beworben am {date}.",
  followUpOn: "Nachfassen am {date}", followUpDue: "Zeit zum Nachfassen (seit {date})", followUpClear: "Erinnerung entfernen",
  profileHead: "E-Mail-Adresse für Bewerbungen",
  profileLead: "Diese Adresse steht in deinem Anschreiben, im Lebenslauf und im E-Mail-Entwurf. Firmen antworten dorthin. Wir brauchen dafür kein Passwort und verschicken keine Bewerbungen.",
  profilePh: "leer lassen = {email}", profileSave: "Speichern", profileSaved: "Gespeichert.", profileNow: "Aktuell: {email}",
};

const en: VersandUI = {
  open: "Check and send application", stepCheck: "1. Check", stepSend: "2. Send", stepDone: "3. Record", next: "Next", back: "Back",
  letterHead: "Cover letter", letterHint: "Read the cover letter calmly and change anything that doesn't fit. Your changes are saved as soon as you leave the field.",
  letterView: "View cover letter", needLetter: "There is no cover letter for this job yet. We put it together from your application folder.",
  cvHead: "CV", cvHint: "You change your CV in the application folder. The change then applies to all applications.", cvView: "View CV", cvEdit: "Change in the application folder",
  mailHead: "Email", to: "To (email address from the advert)", toPh: "e.g. jobs@company.de", toFromAd: "Taken from the advert. Please check it quickly.",
  toMissing: "We didn't find an email address in the advert. Have a look at the advert and enter it here. Some companies only accept applications through their own application portal. In that case you upload the PDF there.",
  portal: "Go to the advert or application portal",
  subject: "Subject", body: "Email text", reset: "Restore suggestion", save: "Save", saved: "Saved.",
  from: "You write from your own address: {email}", fromNone: "Enter your email address for applications in My area.", fromChange: "Change address",
  sendLead: "You send the application yourself from your own inbox. Replies come straight to you. WoYou doesn't send anything and doesn't read along.",
  openMail: "Open in my email program", openMailHint: "Recipient, subject and text are already filled in. Then attach the PDF.",
  noRecipient: "Without a recipient the address line stays empty. You can also enter the address there.",
  truncated: "The text is too long for this way and was shortened. Better copy it with the button below.",
  pdfHead: "Download documents as PDF", bundle: "Cover letter and CV (one PDF)", letterPdf: "cover letter only", cvPdf: "CV only",
  twoFiles: "You use your own CV. Please download both files and attach both.",
  eml: "Download finished email with attachments (.eml)", emlHint: "For Outlook, Apple Mail or Thunderbird on a computer. The attachments are already included.",
  copyHead: "For webmail and phone", copyTo: "Copy address", copySubject: "Copy subject", copyBody: "Copy text", copied: "Copied.",
  howTo: "How it works on your device",
  howToList: [
    { title: "Computer with Outlook, Apple Mail or Thunderbird", text: "Download the .eml file and double-click it. Outlook opens it as a draft. In Apple Mail choose \"Send Again\" in the \"Message\" menu, in Thunderbird \"Edit as New Message\". Check everything and click Send." },
    { title: "Gmail (app or browser)", text: "Download the PDF first. Then tap \"Open in my email program\" or copy address, subject and text into a new email. Use the paper clip and \"Attach file\". The PDF is in the Downloads folder." },
    { title: "iPhone Mail", text: "Download the PDF first, it is then in the Files app under Downloads. Tap \"Open in my email program\", tap into the text and then the icon above the keyboard. Choose the PDF with \"Attach file\"." },
    { title: "Outlook app on the phone", text: "Download the PDF first. Tap \"Open in my email program\" and choose Outlook. Use the paper clip to attach the PDF from Downloads." },
  ],
  doneHead: "Sent it?", doneLead: "Once the email is out, record it here. That way you keep track.", sentOn: "Sent on",
  followUp: "Remind me to follow up on", sentBtn: "I have sent it", sentOk: "Recorded: applied on {date}.",
  followUpOn: "Follow up on {date}", followUpDue: "Time to follow up (since {date})", followUpClear: "Remove reminder",
  profileHead: "Email address for applications",
  profileLead: "This address appears in your cover letter, your CV and the email draft. Companies reply to it. We don't need a password for this and we don't send applications.",
  profilePh: "leave empty = {email}", profileSave: "Save", profileSaved: "Saved.", profileNow: "Current: {email}",
};

const fr: VersandUI = {
  open: "Vérifier et envoyer la candidature", stepCheck: "1. Vérifier", stepSend: "2. Envoyer", stepDone: "3. Noter", next: "Suivant", back: "Retour",
  letterHead: "Lettre de motivation", letterHint: "Lisez la lettre tranquillement et changez ce qui ne convient pas. Vos changements sont enregistrés dès que vous quittez le champ.",
  letterView: "Voir la lettre", needLetter: "Il n'y a pas encore de lettre pour cette offre. Nous la composons à partir de votre dossier.",
  cvHead: "CV", cvHint: "Vous modifiez votre CV dans le dossier de candidature. Le changement vaut alors pour toutes les candidatures.", cvView: "Voir le CV", cvEdit: "Modifier dans le dossier",
  mailHead: "E-mail", to: "À (adresse e-mail de l'annonce)", toPh: "p. ex. bewerbung@firma.de", toFromAd: "Reprise de l'annonce. Vérifiez-la rapidement.",
  toMissing: "Nous n'avons pas trouvé d'adresse e-mail dans l'annonce. Regardez dans l'annonce et saisissez-la ici. Certaines entreprises n'acceptent les candidatures que via leur propre portail. Dans ce cas, vous y déposez le PDF.",
  portal: "Vers l'annonce ou le portail de candidature",
  subject: "Objet", body: "Texte de l'e-mail", reset: "Rétablir la proposition", save: "Enregistrer", saved: "Enregistré.",
  from: "Vous écrivez depuis votre propre adresse : {email}", fromNone: "Indiquez votre adresse e-mail de candidature dans Mon espace.", fromChange: "Changer l'adresse",
  sendLead: "Vous envoyez la candidature vous-même depuis votre propre boîte. Les réponses vous arrivent directement. WoYou n'envoie rien et ne lit rien.",
  openMail: "Ouvrir dans ma messagerie", openMailHint: "Destinataire, objet et texte sont déjà remplis. Joignez ensuite le PDF.",
  noRecipient: "Sans destinataire, la ligne d'adresse reste vide. Vous pouvez aussi saisir l'adresse là-bas.",
  truncated: "Le texte est trop long pour cette méthode et a été raccourci. Copiez-le plutôt avec le bouton ci-dessous.",
  pdfHead: "Télécharger les documents en PDF", bundle: "Lettre et CV (un seul PDF)", letterPdf: "lettre seule", cvPdf: "CV seul",
  twoFiles: "Vous utilisez votre propre CV. Téléchargez les deux fichiers et joignez les deux.",
  eml: "Télécharger l'e-mail prêt avec pièces jointes (.eml)", emlHint: "Pour Outlook, Apple Mail ou Thunderbird sur ordinateur. Les pièces jointes sont déjà incluses.",
  copyHead: "Pour webmail et téléphone", copyTo: "Copier l'adresse", copySubject: "Copier l'objet", copyBody: "Copier le texte", copied: "Copié.",
  howTo: "Comment faire sur votre appareil",
  howToList: [
    { title: "Ordinateur avec Outlook, Apple Mail ou Thunderbird", text: "Téléchargez le fichier .eml et ouvrez-le par double-clic. Outlook l'ouvre comme brouillon. Dans Apple Mail, choisissez « Renvoyer » dans le menu « Message », dans Thunderbird « Modifier en tant que nouveau message ». Vérifiez tout et cliquez sur Envoyer." },
    { title: "Gmail (application ou navigateur)", text: "Téléchargez d'abord le PDF. Touchez ensuite « Ouvrir dans ma messagerie » ou copiez adresse, objet et texte dans un nouvel e-mail. Avec le trombone, choisissez « Joindre un fichier ». Le PDF se trouve dans Téléchargements." },
    { title: "Mail sur iPhone", text: "Téléchargez d'abord le PDF, il se trouve alors dans l'app Fichiers sous Téléchargements. Touchez « Ouvrir dans ma messagerie », puis le texte et l'icône au-dessus du clavier. Choisissez le PDF avec « Joindre un fichier »." },
    { title: "Application Outlook sur téléphone", text: "Téléchargez d'abord le PDF. Touchez « Ouvrir dans ma messagerie » et choisissez Outlook. Avec le trombone, joignez le PDF depuis Téléchargements." },
  ],
  doneHead: "Envoyé ?", doneLead: "Une fois l'e-mail parti, notez-le ici. Ainsi vous gardez une vue d'ensemble.", sentOn: "Envoyé le",
  followUp: "Me rappeler de relancer le", sentBtn: "J'ai envoyé", sentOk: "Noté : candidature le {date}.",
  followUpOn: "Relancer le {date}", followUpDue: "Moment de relancer (depuis le {date})", followUpClear: "Supprimer le rappel",
  profileHead: "Adresse e-mail pour les candidatures",
  profileLead: "Cette adresse figure dans votre lettre, votre CV et le brouillon d'e-mail. Les entreprises y répondent. Nous n'avons pas besoin de mot de passe et n'envoyons pas de candidatures.",
  profilePh: "laisser vide = {email}", profileSave: "Enregistrer", profileSaved: "Enregistré.", profileNow: "Actuellement : {email}",
};

// Übersetzung bitte von Muttersprachler:in prüfen lassen (Arabisch, Hocharabisch für Marokko)
const ar: VersandUI = {
  open: "مراجعة الطلب وإرساله", stepCheck: "1. المراجعة", stepSend: "2. الإرسال", stepDone: "3. التسجيل", next: "التالي", back: "رجوع",
  letterHead: "رسالة التحفيز", letterHint: "اقرأ الرسالة بهدوء وغيّر ما لا يناسبك. تُحفظ تعديلاتك عندما تغادر الحقل.",
  letterView: "عرض الرسالة", needLetter: "لا توجد بعد رسالة لهذه الوظيفة. نُعدّها من ملف طلبك.",
  cvHead: "السيرة الذاتية", cvHint: "تُعدّل سيرتك الذاتية في ملف الطلب. ويسري التعديل بعدها على كل الطلبات.", cvView: "عرض السيرة الذاتية", cvEdit: "التعديل في ملف الطلب",
  mailHead: "البريد الإلكتروني", to: "إلى (البريد الإلكتروني من الإعلان)", toPh: "مثلًا bewerbung@firma.de", toFromAd: "مأخوذ من الإعلان. تحقّق منه بسرعة من فضلك.",
  toMissing: "لم نجد بريدًا إلكترونيًا في الإعلان. انظر في الإعلان وأدخله هنا. بعض الشركات تقبل الطلبات فقط عبر بوابة التوظيف الخاصة بها، وفي هذه الحالة ترفع ملف PDF هناك.",
  portal: "إلى الإعلان أو بوابة التوظيف",
  subject: "الموضوع", body: "نص الرسالة", reset: "استعادة الاقتراح", save: "حفظ", saved: "تم الحفظ.",
  from: "أنت تكتب من عنوانك الخاص: {email}", fromNone: "أدخل في «مساحتي» بريدك الإلكتروني للطلبات.", fromChange: "تغيير العنوان",
  sendLead: "أنت ترسل الطلب بنفسك من بريدك الخاص. الردود تصلك مباشرة. WoYou لا يرسل شيئًا ولا يقرأ شيئًا.",
  openMail: "فتح في برنامج البريد الخاص بي", openMailHint: "المستلم والموضوع والنص مكتوبة مسبقًا. أرفق بعدها ملف PDF.",
  noRecipient: "بدون مستلم يبقى سطر العنوان فارغًا. يمكنك إدخال العنوان هناك أيضًا.",
  truncated: "النص طويل جدًا لهذه الطريقة وتم اختصاره. الأفضل أن تنسخه بالزر أدناه.",
  pdfHead: "تنزيل المستندات بصيغة PDF", bundle: "الرسالة والسيرة الذاتية (ملف PDF واحد)", letterPdf: "الرسالة فقط", cvPdf: "السيرة الذاتية فقط",
  twoFiles: "أنت تستعمل سيرتك الذاتية الخاصة. نزّل الملفين وأرفقهما معًا.",
  eml: "تنزيل الرسالة الجاهزة مع المرفقات (.eml)", emlHint: "لبرنامج Outlook أو Apple Mail أو Thunderbird على الحاسوب. المرفقات موجودة مسبقًا.",
  copyHead: "للبريد على المتصفح والهاتف", copyTo: "نسخ العنوان", copySubject: "نسخ الموضوع", copyBody: "نسخ النص", copied: "تم النسخ.",
  howTo: "هكذا تفعل على جهازك",
  howToList: [
    { title: "حاسوب مع Outlook أو Apple Mail أو Thunderbird", text: "نزّل ملف ‎.eml وافتحه بنقرة مزدوجة. يفتحه Outlook كمسودة. في Apple Mail اختر «إعادة الإرسال» من قائمة «رسالة»، وفي Thunderbird «تحرير كرسالة جديدة». راجع كل شيء ثم اضغط إرسال." },
    { title: "Gmail (التطبيق أو المتصفح)", text: "نزّل ملف PDF أولًا. ثم اضغط «فتح في برنامج البريد الخاص بي» أو انسخ العنوان والموضوع والنص في رسالة جديدة. عبر مشبك الورق اختر «إرفاق ملف»، وستجد الملف في مجلد التنزيلات." },
    { title: "بريد iPhone", text: "نزّل ملف PDF أولًا، وسيكون في تطبيق الملفات تحت التنزيلات. اضغط «فتح في برنامج البريد الخاص بي»، ثم داخل النص وعلى الرمز فوق لوحة المفاتيح. اختر الملف عبر «إرفاق ملف»." },
    { title: "تطبيق Outlook على الهاتف", text: "نزّل ملف PDF أولًا. اضغط «فتح في برنامج البريد الخاص بي» واختر Outlook. عبر مشبك الورق أرفق الملف من التنزيلات." },
  ],
  doneHead: "هل أرسلت؟", doneLead: "عندما تُرسل الرسالة، سجّل ذلك هنا. هكذا تحتفظ بنظرة عامة.", sentOn: "أُرسلت في",
  followUp: "ذكّرني بالمتابعة في", sentBtn: "لقد أرسلت", sentOk: "تم التسجيل: تقدّمت في {date}.",
  followUpOn: "المتابعة في {date}", followUpDue: "حان وقت المتابعة (منذ {date})", followUpClear: "حذف التذكير",
  profileHead: "البريد الإلكتروني للطلبات",
  profileLead: "يظهر هذا العنوان في رسالتك وسيرتك الذاتية ومسودة البريد. الشركات ترد عليه. لا نحتاج إلى كلمة مرور ولا نرسل أي طلبات.",
  profilePh: "اتركه فارغًا = {email}", profileSave: "حفظ", profileSaved: "تم الحفظ.", profileNow: "الحالي: {email}",
};

// Übersetzung bitte von Muttersprachler:in prüfen lassen (Hindi für Indien)
const hi: VersandUI = {
  open: "आवेदन जाँचें और भेजें", stepCheck: "1. जाँचें", stepSend: "2. भेजें", stepDone: "3. दर्ज करें", next: "आगे", back: "वापस",
  letterHead: "कवर लेटर", letterHint: "कवर लेटर आराम से पढ़ें और जो ठीक न लगे उसे बदलें। फ़ील्ड छोड़ते ही आपके बदलाव सहेज लिए जाते हैं।",
  letterView: "कवर लेटर देखें", needLetter: "इस नौकरी के लिए अभी कोई कवर लेटर नहीं है। हम इसे आपके आवेदन फ़ोल्डर से तैयार करते हैं।",
  cvHead: "सीवी", cvHint: "अपना सीवी आप आवेदन फ़ोल्डर में बदलते हैं। बदलाव फिर सभी आवेदनों पर लागू होता है।", cvView: "सीवी देखें", cvEdit: "आवेदन फ़ोल्डर में बदलें",
  mailHead: "ईमेल", to: "प्रति (विज्ञापन से ईमेल पता)", toPh: "जैसे bewerbung@firma.de", toFromAd: "विज्ञापन से लिया गया। कृपया एक बार जाँच लें।",
  toMissing: "विज्ञापन में हमें कोई ईमेल पता नहीं मिला। विज्ञापन देखें और पता यहाँ लिखें। कुछ कंपनियाँ आवेदन केवल अपने आवेदन पोर्टल पर लेती हैं, तब आप PDF वहीं अपलोड करें।",
  portal: "विज्ञापन या आवेदन पोर्टल पर जाएँ",
  subject: "विषय", body: "ईमेल का पाठ", reset: "सुझाव फिर से लाएँ", save: "सहेजें", saved: "सहेज लिया।",
  from: "आप अपने खुद के पते से लिख रहे हैं: {email}", fromNone: "«मेरा क्षेत्र» में आवेदन के लिए अपना ईमेल पता लिखें।", fromChange: "पता बदलें",
  sendLead: "आवेदन आप खुद अपने ईमेल से भेजते हैं। जवाब सीधे आपके पास आते हैं। WoYou कुछ नहीं भेजता और कुछ नहीं पढ़ता।",
  openMail: "मेरे ईमेल प्रोग्राम में खोलें", openMailHint: "प्राप्तकर्ता, विषय और पाठ पहले से भरे हैं। इसके बाद PDF जोड़ें।",
  noRecipient: "प्राप्तकर्ता के बिना पते की पंक्ति खाली रहती है। आप वहाँ भी पता लिख सकते हैं।",
  truncated: "इस तरीके के लिए पाठ बहुत लंबा था और छोटा किया गया। बेहतर है कि नीचे के बटन से इसे कॉपी करें।",
  pdfHead: "दस्तावेज़ PDF में डाउनलोड करें", bundle: "कवर लेटर और सीवी (एक PDF)", letterPdf: "केवल कवर लेटर", cvPdf: "केवल सीवी",
  twoFiles: "आप अपना खुद का सीवी इस्तेमाल करते हैं। कृपया दोनों फ़ाइलें डाउनलोड करें और दोनों जोड़ें।",
  eml: "अटैचमेंट के साथ तैयार ईमेल डाउनलोड करें (.eml)", emlHint: "कंप्यूटर पर Outlook, Apple Mail या Thunderbird के लिए। अटैचमेंट पहले से जुड़े हैं।",
  copyHead: "वेबमेल और फ़ोन के लिए", copyTo: "पता कॉपी करें", copySubject: "विषय कॉपी करें", copyBody: "पाठ कॉपी करें", copied: "कॉपी हो गया।",
  howTo: "आपके डिवाइस पर ऐसे करें",
  howToList: [
    { title: "Outlook, Apple Mail या Thunderbird वाला कंप्यूटर", text: ".eml फ़ाइल डाउनलोड करें और डबल-क्लिक से खोलें। Outlook इसे ड्राफ़्ट के रूप में खोलता है। Apple Mail में «Message» मेन्यू से «Send Again» चुनें, Thunderbird में «Edit as New Message»। सब जाँचें और Send दबाएँ।" },
    { title: "Gmail (ऐप या ब्राउज़र)", text: "पहले PDF डाउनलोड करें। फिर «मेरे ईमेल प्रोग्राम में खोलें» दबाएँ या पता, विषय और पाठ नई ईमेल में कॉपी करें। पेपर क्लिप से «फ़ाइल अटैच करें» चुनें, PDF Downloads फ़ोल्डर में है।" },
    { title: "iPhone का Mail ऐप", text: "पहले PDF डाउनलोड करें, यह Files ऐप में Downloads के अंदर होगी। «मेरे ईमेल प्रोग्राम में खोलें» दबाएँ, फिर पाठ में और कीबोर्ड के ऊपर वाले चिह्न पर। «फ़ाइल अटैच करें» से PDF चुनें।" },
    { title: "फ़ोन पर Outlook ऐप", text: "पहले PDF डाउनलोड करें। «मेरे ईमेल प्रोग्राम में खोलें» दबाएँ और Outlook चुनें। पेपर क्लिप से Downloads से PDF जोड़ें।" },
  ],
  doneHead: "भेज दिया?", doneLead: "ईमेल चली जाए तो यहाँ दर्ज करें। इससे आपको पूरी जानकारी रहती है।", sentOn: "भेजने की तारीख",
  followUp: "फ़ॉलो-अप की याद दिलाएँ, तारीख", sentBtn: "मैंने भेज दिया", sentOk: "दर्ज किया: {date} को आवेदन किया।",
  followUpOn: "{date} को फ़ॉलो-अप", followUpDue: "फ़ॉलो-अप का समय ({date} से)", followUpClear: "याद दिलाना हटाएँ",
  profileHead: "आवेदनों के लिए ईमेल पता",
  profileLead: "यह पता आपके कवर लेटर, सीवी और ईमेल ड्राफ़्ट में दिखता है। कंपनियाँ इसी पर जवाब देती हैं। हमें इसके लिए कोई पासवर्ड नहीं चाहिए और हम कोई आवेदन नहीं भेजते।",
  profilePh: "खाली छोड़ें = {email}", profileSave: "सहेजें", profileSaved: "सहेज लिया।", profileNow: "अभी: {email}",
};

const ALL = { de, en, fr, ar, hi } as const;
export const versandText = (locale?: string | null): VersandUI => ALL[wLang(locale)];
export const VERSAND_TEXTS = ALL;
