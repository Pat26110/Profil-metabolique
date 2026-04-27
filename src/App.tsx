import { useMemo, useState } from 'react';
import { profiles, questions } from './data/rgnrData';
import {
  assignProfiles,
  computeConfidence,
  computeConsistencyFlags,
  computeProfileMatches,
  computeRubricScores,
  type AnswerMap,
  type ProfileConfig
} from './lib/rgnr_scoring_engine_v1';
import { validateDataCoherence } from './lib/coherence';
import { loadDraft, resetDraft, saveDraft, type QuestionnaireDraft } from './state/localStorage';
import { ResultsPanel } from './components/ResultsPanel';

export function App() {
  const [draft, setDraft] = useState<QuestionnaireDraft>(() => loadDraft(questions));

  const answeredCount = useMemo(
    () => Object.values(draft.answers).filter((v) => v !== '').length,
    [draft.answers]
  );

  const coherence = useMemo(() => validateDataCoherence(questions, profiles), []);

  const answers = draft.answers as AnswerMap;
  const rubricScores = useMemo(() => computeRubricScores(answers, questions), [answers]);
  const matches = useMemo(
    () => computeProfileMatches(draft.age ?? 35, answers, questions, profiles as ProfileConfig[]),
    [draft.age, answers]
  );
  const assignment = useMemo(() => assignProfiles(matches), [matches]);
  const consistencyFlags = useMemo(() => computeConsistencyFlags(answers, questions), [answers]);

  const primaryProfile = profiles.find((p) => p.id === assignment.primary_profile_id);
  const secondaryProfile = profiles.find((p) => p.id === assignment.secondary_profile_id);

  const confidence = useMemo(
    () => computeConfidence(matches, answeredCount, consistencyFlags, primaryProfile?.observability ?? 'low'),
    [matches, answeredCount, consistencyFlags, primaryProfile]
  );

  const handleAgeChange = (value: string) => {
    const age = value === '' ? null : Number(value);
    const next = { ...draft, age: age && age > 0 ? age : null };
    setDraft(next);
    saveDraft(next);
  };

  const handleAnswer = (questionId: string, choice: string) => {
    const next = {
      ...draft,
      answers: {
        ...draft.answers,
        [questionId]: choice
      }
    };
    setDraft(next);
    saveDraft(next);
  };

  const handleReset = () => {
    const cleared = resetDraft(questions);
    setDraft(cleared);
  };

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      <header className="mb-6 rounded-xl bg-slate-900 p-6 text-white">
        <h1 className="text-2xl font-bold">RGNR — MVP Profil métabolique</h1>
        <p className="mt-2 text-sm text-slate-200">
          Questionnaire orienté modélisation, calculé entièrement côté navigateur, avec sauvegarde locale.
        </p>
      </header>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Résumé & vérification de structure</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>49 questions réparties sur 7 rubriques et 15 profils ciblés.</li>
          <li>Moteur de scoring local: scores de rubrique, matching profil, cohérence, confiance.</li>
          <li>Statut cohérence: {coherence.ok ? '✅ cohérent' : '❌ incohérences détectées'}.</li>
        </ul>
        {!coherence.ok && (
          <ul className="mt-2 list-disc pl-5 text-sm text-red-700">
            {coherence.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-end gap-4">
            <label className="text-sm">
              <span className="mb-1 block font-medium">Âge</span>
              <input
                className="w-32 rounded border border-slate-300 px-2 py-1"
                type="number"
                min={16}
                max={100}
                value={draft.age ?? ''}
                onChange={(e) => handleAgeChange(e.target.value)}
              />
            </label>
            <button
              className="rounded bg-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-300"
              onClick={handleReset}
              type="button"
            >
              Réinitialiser
            </button>
            <p className="text-sm text-slate-600">Répondues: {answeredCount}/{questions.length}</p>
          </div>

          <div className="space-y-4">
            {questions.map((q) => (
              <article key={q.id} className="rounded border border-slate-200 p-3">
                <p className="text-xs text-slate-500">{q.id} · {q.rubric_id}</p>
                <p className="font-medium text-slate-900">{q.label}</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {Object.entries(q.choice_labels).map(([choiceId, choiceLabel]) => (
                    <label key={choiceId} className="flex items-center gap-2 rounded border border-slate-200 p-2 text-sm">
                      <input
                        type="radio"
                        name={q.id}
                        value={choiceId}
                        checked={draft.answers[q.id] === choiceId}
                        onChange={(e) => handleAnswer(q.id, e.target.value)}
                      />
                      <span>{choiceId} — {choiceLabel}</span>
                    </label>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <ResultsPanel
          results={matches}
          rubricScores={rubricScores}
          confidence={confidence}
          primary={primaryProfile}
          secondary={secondaryProfile}
          hybrid={assignment.hybrid_flag}
        />
      </section>
    </main>
  );
}
