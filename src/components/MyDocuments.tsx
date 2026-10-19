// Unterlagen zum Herunterladen und freien Weiterverwenden (Lebenslauf als PDF, Anschreiben-Muster mit Lücken)
const T = {
  de: { title: "Meine Unterlagen zum Download", lead: "Deine Unterlagen gehören dir. Lade sie herunter und nutze sie auch für eigene Bewerbungen.", cv: "Lebenslauf (PDF)", word: "Anschreiben-Vorlage zum Ausfüllen (Word)", pdf: "Anschreiben-Vorlage (PDF)", hint: "In der Vorlage sind deine Angaben schon eingesetzt. Gelb markiert in [eckigen Klammern] steht, was du für jede Stelle selbst ergänzt: Firma, Ansprechperson, Stelle und ein Satz, warum dich die Firma interessiert.", en: "Englische Fassung" },
  en: { title: "My documents to download", lead: "Your documents belong to you. Download them and use them for your own applications too.", cv: "CV (PDF)", word: "Cover letter template to fill in (Word)", pdf: "Cover letter template (PDF)", hint: "Your details are already filled in. Highlighted in yellow in [square brackets] is what you add for each job: company, contact person, job title and one sentence on why the company interests you.", en: "English version" },
  fr: { title: "Mes documents à télécharger", lead: "Vos documents vous appartiennent. Téléchargez-les et utilisez-les aussi pour vos propres candidatures.", cv: "CV (PDF)", word: "Modèle de lettre à compléter (Word)", pdf: "Modèle de lettre (PDF)", hint: "Vos informations sont déjà insérées. En jaune, entre [crochets], ce que vous complétez pour chaque offre : entreprise, interlocuteur, poste et une phrase sur votre intérêt pour l'entreprise. La lettre est en allemand.", en: "Version anglaise" },
  ar: { title: "مستنداتي للتحميل", lead: "مستنداتك ملك لك. حمّلها واستخدمها أيضًا في طلباتك الخاصة.", cv: "السيرة الذاتية (PDF)", word: "نموذج رسالة التحفيز للتعبئة (Word)", pdf: "نموذج رسالة التحفيز (PDF)", hint: "بياناتك موجودة مسبقًا في النموذج. ما بين [أقواس مربعة] باللون الأصفر تكمله بنفسك لكل وظيفة: الشركة، الشخص المسؤول، المسمى الوظيفي، وجملة عن سبب اهتمامك بالشركة. الرسالة باللغة الألمانية.", en: "النسخة الإنجليزية" },
};

export function MyDocuments({ locale, hasEnglish, bookingId }: { locale: string; hasEnglish?: boolean; bookingId?: string }) {
  const t = T[(locale in T ? locale : "en") as keyof typeof T];
  const q = (doc: string, en = false) => `/api/mappe/download?doc=${doc}${en ? "&lang=en" : ""}${bookingId ? `&bookingId=${bookingId}` : ""}`;
  return (
    <section className="card">
      <h2 className="font-semibold">{t.title}</h2>
      <p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">{t.lead}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a className="btn-primary" href={q("cv")}>{t.cv}</a>
        <a className="btn-outline" href={q("letter-docx")}>{t.word}</a>
        <a className="btn-outline" href={q("letter-pdf")}>{t.pdf}</a>
      </div>
      {hasEnglish && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-[color:var(--color-ink-soft)]">{t.en}:</span>
          <a className="underline" href={q("cv", true)}>CV (PDF)</a>
          <a className="underline" href={q("letter-docx", true)}>Cover letter (Word)</a>
        </div>
      )}
      <p className="mt-3 text-xs text-[color:var(--color-ink-soft)]">{t.hint}</p>
    </section>
  );
}
