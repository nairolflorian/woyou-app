import Link from "next/link";
import { getT } from "@/lib/i18n";
import type { ProfileTip } from "@/lib/candidate";

export async function ProfileStrengthTips({ tips }: { tips: ProfileTip[] }) {
  if (tips.length === 0) return null;
  const { t } = await getT();
  return (
    <div className="card border-[color:var(--color-brand)]/30 bg-[color:var(--color-brand-soft)]/40">
      <h3 className="font-semibold flex items-center gap-2">
        <span className="text-2xl" aria-hidden="true">💡</span>
        {t("tips.h")}
      </h3>
      <ul className="mt-3 space-y-1.5 text-sm">
        {tips.slice(0, 5).map((tip) => (
          <li key={tip.field} className="flex items-center justify-between gap-3">
            <span>{t(tip.i18nKey)}</span>
            <Link
              href="/registrierung/profil"
              className="badge bg-[color:var(--color-brand)] text-white text-xs flex-shrink-0"
            >
              {t("tips.delta", { delta: tip.delta })}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
