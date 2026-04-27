import type { ProfileConfig, QuestionConfig } from '../types/rgnr';

export interface CoherenceReport {
  ok: boolean;
  issues: string[];
}

export function validateDataCoherence(
  questions: QuestionConfig[],
  profiles: ProfileConfig[]
): CoherenceReport {
  const issues: string[] = [];
  const profileIds = new Set(profiles.map((p) => p.id));
  const questionIds = new Set(questions.map((q) => q.id));

  if (questions.length !== 49) issues.push(`Nombre de questions inattendu: ${questions.length}`);
  if (profiles.length !== 15) issues.push(`Nombre de profils inattendu: ${profiles.length}`);

  const rubricIds = new Set(questions.map((q) => q.rubric_id));
  for (const rubric of ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7']) {
    if (!rubricIds.has(rubric)) issues.push(`Rubrique manquante: ${rubric}`);
  }

  for (const q of questions) {
    for (const pid of q.associated_profiles) {
      if (!profileIds.has(pid)) issues.push(`Question ${q.id}: profil associé inconnu ${pid}`);
    }
  }

  for (const p of profiles) {
    for (const qid of p.critical_questions) {
      if (!questionIds.has(qid)) issues.push(`Profil ${p.id}: question critique inconnue ${qid}`);
    }
    for (const pid of p.secondary_candidates) {
      if (!profileIds.has(pid)) issues.push(`Profil ${p.id}: secondary candidate inconnu ${pid}`);
    }
  }

  return { ok: issues.length === 0, issues };
}
