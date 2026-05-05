"use client";

import { useState } from "react";
import type { TestQuestion } from "@/lib/language-test";

export function LanguageTest({ questions }: { questions: TestQuestion[] }) {
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<null | {
    score: number;
    total: number;
    level: string;
    passed: boolean;
  }>(null);

  async function submit() {
    setSubmitting(true);
    const res = await fetch("/api/candidate/language-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (res.ok) setResult(data);
  }

  if (result) {
    return (
      <div className="card text-center">
        <div className="text-5xl">{result.passed ? "🎉" : "💪"}</div>
        <h1 className="mt-4 text-2xl font-bold">
          {result.passed ? "Bestanden!" : "Noch nicht bestanden"}
        </h1>
        <p className="mt-2 text-[color:var(--color-ink-soft)]">
          Dein Ergebnis: <strong>{result.score} / {result.total}</strong>
          {" "}— Niveau <strong>{result.level}</strong>
        </p>
        <a href="/profil" className="btn-primary mt-6 inline-flex">
          Zum Dashboard
        </a>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="card">
        <span className="section-tag">Sprachtest</span>
        <h1 className="text-2xl font-bold">Sprachtest Deutsch</h1>
        <p className="mt-2 text-[color:var(--color-ink-soft)]">
          12 Multiple-Choice-Fragen — von A1 bis B2. Dauert ca. 5 Minuten.
          Du kannst den Test später wiederholen.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-[color:var(--color-ink-soft)]">
          <li>✓ Deine Punktzahl wird in deinem Profil angezeigt</li>
          <li>✓ Unternehmen sehen dein objektives Niveau</li>
          <li>✓ Hilft uns beim passenden Matching</li>
        </ul>
        <button onClick={() => setStarted(true)} className="btn-primary mt-8 w-full">
          Test starten
        </button>
      </div>
    );
  }

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <div key={q.id} className="card">
          <div className="text-xs font-semibold text-[color:var(--color-brand)]">
            Frage {i + 1} · {q.level}
          </div>
          <h3 className="mt-1 font-semibold">{q.prompt}</h3>
          <div className="mt-3 grid gap-2">
            {q.options.map((opt, idx) => (
              <label
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer text-sm ${
                  answers[q.id] === idx
                    ? "border-[color:var(--color-brand)] bg-[color:var(--color-brand-soft)]"
                    : "border-[color:var(--color-border)] hover:border-[color:var(--color-brand)]"
                }`}
              >
                <input
                  type="radio"
                  name={q.id}
                  value={idx}
                  checked={answers[q.id] === idx}
                  onChange={() => setAnswers({ ...answers, [q.id]: idx })}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={submit}
        disabled={!allAnswered || submitting}
        className="btn-primary w-full"
      >
        {submitting ? "…" : "Test abgeben"}
      </button>
      {!allAnswered && (
        <p className="text-center text-xs text-[color:var(--color-ink-soft)]">
          Bitte beantworte alle Fragen.
        </p>
      )}
    </div>
  );
}
