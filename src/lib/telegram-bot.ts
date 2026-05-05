// Lightweight bot setup using `grammy`. Designed for webhook delivery so it
// works on Vercel-like serverless platforms; locally you can use long polling
// by running `npm run telegram:dev` (see README).
//
// Why a singleton: avoid re-initializing the Bot on every webhook hit.

import { Bot, type Context, type SessionFlavor, session } from "grammy";
import { prisma } from "@/lib/prisma";
import { ROLE, CANDIDATE_STATUS } from "@/lib/enums";
import { computeCompleteness, deriveStatus } from "@/lib/candidate";
import type { CandidateStatus } from "@/lib/enums";
import { JOB_CATEGORIES, JOB_GROUPS } from "@/lib/jobs";
import { hashPassword } from "@/lib/auth";
import crypto from "node:crypto";

type WizardStep =
  | "idle"
  | "first_name"
  | "last_name"
  | "country"
  | "city"
  | "job_group"
  | "job_specific"
  | "german_level"
  | "experience"
  | "motivation"
  | "done";

type SessionData = {
  step: WizardStep;
  pending: Partial<{
    firstName: string;
    lastName: string;
    countryOfResidence: string;
    city: string;
    jobGroup: string;
    desiredJobCategory: string;
    germanLevel: string;
    yearsExperience: number;
    motivation: string;
  }>;
};

type Ctx = Context & SessionFlavor<SessionData>;

let bot: Bot<Ctx> | null = null;

export function getBot(): Bot<Ctx> | null {
  if (bot) return bot;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;

  bot = new Bot<Ctx>(token);
  bot.use(
    session({
      initial: (): SessionData => ({ step: "idle", pending: {} }),
    })
  );

  bot.command("start", async (ctx) => {
    const tgId = String(ctx.from?.id);
    const existing = await prisma.user.findUnique({ where: { telegramId: tgId } });
    if (existing) {
      await ctx.reply(
        `👋 Willkommen zurück bei WoYou!\n\nDein Profil ist bereits angelegt. Schreib /status um zu sehen wo du stehst, oder /profil um deine Daten zu ändern.`
      );
      return;
    }
    // Create stub account
    const tempPwd = crypto.randomBytes(8).toString("hex");
    const user = await prisma.user.create({
      data: {
        telegramId: tgId,
        passwordHash: await hashPassword(tempPwd),
        role: ROLE.CANDIDATE,
        oauthProvider: "telegram",
      },
    });
    await prisma.candidate.create({
      data: { userId: user.id, status: CANDIDATE_STATUS.REGISTERED },
    });
    ctx.session.step = "first_name";
    await ctx.reply(
      `🇩🇪 *Willkommen bei WoYou!*\n\nIch helfe dir, dein Profil für deutsche Unternehmen anzulegen.\n\nWie ist dein *Vorname*?`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("status", async (ctx) => {
    const tgId = String(ctx.from?.id);
    const user = await prisma.user.findUnique({
      where: { telegramId: tgId },
      include: { candidate: true },
    });
    if (!user?.candidate) {
      await ctx.reply("Noch nicht registriert. Schreib /start ✨");
      return;
    }
    await ctx.reply(
      `📊 *Dein Status*\n\nProfil: ${user.candidate.profileCompleteness}%\nStatus: ${user.candidate.status}\nVorschläge: ${user.candidate.timesProposed}\n\nWeiter im Browser: https://woyou.de/profil`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("hilfe", async (ctx) => {
    await ctx.reply(
      [
        "*WoYou-Bot*",
        "/start — Profil anlegen",
        "/status — Dein aktueller Status",
        "/profil — Profil bearbeiten (im Browser)",
      ].join("\n"),
      { parse_mode: "Markdown" }
    );
  });

  bot.command("profil", async (ctx) => {
    const tgId = String(ctx.from?.id);
    const user = await prisma.user.findUnique({ where: { telegramId: tgId } });
    if (!user) return ctx.reply("Bitte zuerst /start ausführen.");
    await ctx.reply(`Bearbeite dein Profil im Browser: ${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/registrierung/profil`);
  });

  bot.on("message:text", async (ctx) => {
    const tgId = String(ctx.from?.id);
    const user = await prisma.user.findUnique({
      where: { telegramId: tgId },
      include: { candidate: true },
    });
    if (!user?.candidate) {
      await ctx.reply("Bitte zuerst /start ausführen.");
      return;
    }
    const text = ctx.message.text.trim();
    const s = ctx.session;

    switch (s.step) {
      case "first_name":
        s.pending.firstName = text;
        s.step = "last_name";
        await ctx.reply("Und dein *Nachname*?", { parse_mode: "Markdown" });
        break;
      case "last_name":
        s.pending.lastName = text;
        s.step = "country";
        await ctx.reply("In welchem *Land* lebst du gerade? (z.B. Marokko)", {
          parse_mode: "Markdown",
        });
        break;
      case "country":
        s.pending.countryOfResidence = text;
        s.step = "city";
        await ctx.reply("Und in welcher *Stadt*?", { parse_mode: "Markdown" });
        break;
      case "city":
        s.pending.city = text;
        s.step = "job_group";
        await ctx.reply(
          [
            "In welcher *Berufsgruppe* möchtest du arbeiten?",
            "",
            ...Object.entries(JOB_GROUPS).map(
              ([slug, g]) => `${g.icon}  ${g.de}  →  schreib *${slug}*`
            ),
          ].join("\n"),
          { parse_mode: "Markdown" }
        );
        break;
      case "job_group": {
        const groupSlug = text.toLowerCase();
        if (!JOB_GROUPS[groupSlug]) {
          await ctx.reply("Bitte eine der genannten Gruppen schreiben (z.B. care).");
          break;
        }
        s.pending.jobGroup = groupSlug;
        s.step = "job_specific";
        const opts = JOB_CATEGORIES.filter((j) => j.group === groupSlug);
        await ctx.reply(
          [
            "Welche dieser Berufe trifft am ehesten zu?",
            "",
            ...opts.map((o) => `• ${o.de}  →  schreib *${o.slug}*`),
          ].join("\n"),
          { parse_mode: "Markdown" }
        );
        break;
      }
      case "job_specific": {
        const slug = text.toLowerCase();
        if (!JOB_CATEGORIES.find((j) => j.slug === slug)) {
          await ctx.reply("Bitte einen der oben genannten Slugs senden.");
          break;
        }
        s.pending.desiredJobCategory = slug;
        s.step = "german_level";
        await ctx.reply(
          "Wie ist dein *Deutsch-Niveau*?\n(NONE / A1 / A2 / B1 / B2 / C1 / C2)",
          { parse_mode: "Markdown" }
        );
        break;
      }
      case "german_level": {
        const lvl = text.toUpperCase();
        if (!["NONE", "A1", "A2", "B1", "B2", "C1", "C2"].includes(lvl)) {
          await ctx.reply("Bitte ein gültiges Niveau senden, z.B. B1.");
          break;
        }
        s.pending.germanLevel = lvl;
        s.step = "experience";
        await ctx.reply("Wie viele Jahre *Berufserfahrung* hast du? (z.B. 3)", {
          parse_mode: "Markdown",
        });
        break;
      }
      case "experience": {
        const num = parseInt(text);
        if (Number.isNaN(num) || num < 0) {
          await ctx.reply("Bitte eine Zahl senden.");
          break;
        }
        s.pending.yearsExperience = num;
        s.step = "motivation";
        await ctx.reply(
          "Letzte Frage 🙏: *Warum* möchtest du in Deutschland arbeiten? (kurzer Satz)",
          { parse_mode: "Markdown" }
        );
        break;
      }
      case "motivation": {
        s.pending.motivation = text;
        s.step = "done";

        const merged = { ...user.candidate, ...s.pending };
        const completeness = computeCompleteness(merged);
        const status = deriveStatus(merged, user.candidate.status as CandidateStatus);

        await prisma.candidate.update({
          where: { id: user.candidate.id },
          data: {
            ...s.pending,
            profileCompleteness: completeness,
            status,
          },
        });
        const link = `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/registrierung/profil`;
        await ctx.reply(
          `✅ *Erste Daten gespeichert!*\n\nProfil-Vollständigkeit: ${completeness}%.\n\nVervollständige es im Browser (Sprachtest, Gehalt, Dokumente, Freischaltung):\n${link}`,
          { parse_mode: "Markdown" }
        );
        s.pending = {};
        break;
      }
      default:
        await ctx.reply(
          "Schreib /status um deinen Fortschritt zu sehen, /profil zum Bearbeiten oder /hilfe für eine Übersicht."
        );
    }
  });

  return bot;
}
