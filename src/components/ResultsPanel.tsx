import type { ProfileConfig } from '../types/rgnr';
import type { ProfileMatch, RubricScoreMap } from '../lib/rgnr_scoring_engine_v1';

interface ResultsPanelProps {
  results: ProfileMatch[];
  rubricScores: RubricScoreMap;
  confidence: number;
  primary?: ProfileConfig;
  secondary?: ProfileConfig;
  hybrid: boolean;
}

export function ResultsPanel({
  results,
  rubricScores,
  confidence,
  primary,
  secondary,
  hybrid
}: ResultsPanelProps) {
  if (!results.length) return null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Résultats RGNR</h2>
      <p className="mt-2 text-sm text-slate-600">
        Outil exploratoire non médical. Ces résultats ne constituent ni diagnostic ni avis thérapeutique.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Profil principal</p>
          <p className="text-lg font-semibold">{primary ? `${primary.id} — ${primary.label}` : 'N/A'}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Profil secondaire</p>
          <p className="text-lg font-semibold">{secondary ? `${secondary.id} — ${secondary.label}` : 'Aucun'}</p>
          {hybrid && <p className="text-xs text-amber-700">Profil hybride détecté (écart ≤ 5 points).</p>}
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-700">Confiance de classification: <strong>{confidence}%</strong></p>

      <h3 className="mt-4 font-medium">Scores par rubrique</h3>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {Object.entries(rubricScores).map(([rubric, score]) => (
          <li key={rubric} className="rounded border border-slate-200 px-3 py-2 text-sm">
            <span className="font-medium">{rubric}</span>: {score}
          </li>
        ))}
      </ul>

      <h3 className="mt-4 font-medium">Top 5 compatibilités</h3>
      <ol className="mt-2 space-y-2 text-sm">
        {results.slice(0, 5).map((match) => (
          <li key={match.profile_id} className="rounded border border-slate-200 px-3 py-2">
            <span className="font-medium">{match.profile_id}</span> — {match.compatibility_score}
          </li>
        ))}
      </ol>
    </section>
  );
}
