export type RubricId = "R1"|"R2"|"R3"|"R4"|"R5"|"R6"|"R7";
export type QuestionId = `Q${string}`;
export type ProfileId =
  | "P01" | "P02" | "P03" | "P04" | "P05"
  | "P06" | "P07" | "P08" | "P09" | "P10"
  | "P11" | "P12" | "P13" | "P14" | "P15";

export interface QuestionConfig {
  id: QuestionId;
  rubric_id: RubricId;
  label: string;
  short_label: string;
  scoring_mode: "direct" | "inverted_labels";
  weight: number;
  choice_scores: Record<string, number>;
  associated_profiles: ProfileId[];
  notes?: string;
}

export interface ProfileConfig {
  id: ProfileId;
  label: string;
  summary: string;
  observability: "low" | "medium" | "high";
  target_rubric_scores: Record<RubricId, number>;
  rubric_weights: Record<RubricId, number>;
  critical_questions: QuestionId[];
  secondary_candidates: ProfileId[];
  modeling_status: string;
}

export interface AnswerMap {
  [questionId: string]: string;
}

export interface RubricScoreMap {
  R1: number; R2: number; R3: number; R4: number; R5: number; R6: number; R7: number;
}

export interface ProfileMatch {
  profile_id: ProfileId;
  compatibility_score: number;
  rubric_match_score: number;
  critical_question_match_score: number;
  synergy_score: number;
  age_adjustment_score: number;
}

export function normalizeAnswer(question: QuestionConfig, rawChoice: string): number {
  return question.choice_scores[rawChoice] ?? 0;
}

export function computeRubricScores(
  answers: AnswerMap,
  questions: QuestionConfig[]
): RubricScoreMap {
  const rubricMap: Record<RubricId, { sum: number; weight: number }> = {
    R1: { sum: 0, weight: 0 },
    R2: { sum: 0, weight: 0 },
    R3: { sum: 0, weight: 0 },
    R4: { sum: 0, weight: 0 },
    R5: { sum: 0, weight: 0 },
    R6: { sum: 0, weight: 0 },
    R7: { sum: 0, weight: 0 },
  };

  for (const q of questions) {
    const score03 = normalizeAnswer(q, answers[q.id]);
    rubricMap[q.rubric_id].sum += score03 * q.weight;
    rubricMap[q.rubric_id].weight += 3 * q.weight;
  }

  return {
    R1: +(100 * rubricMap.R1.sum / rubricMap.R1.weight).toFixed(2),
    R2: +(100 * rubricMap.R2.sum / rubricMap.R2.weight).toFixed(2),
    R3: +(100 * rubricMap.R3.sum / rubricMap.R3.weight).toFixed(2),
    R4: +(100 * rubricMap.R4.sum / rubricMap.R4.weight).toFixed(2),
    R5: +(100 * rubricMap.R5.sum / rubricMap.R5.weight).toFixed(2),
    R6: +(100 * rubricMap.R6.sum / rubricMap.R6.weight).toFixed(2),
    R7: +(100 * rubricMap.R7.sum / rubricMap.R7.weight).toFixed(2),
  };
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

function computeRubricMatch(
  rubricScores: RubricScoreMap,
  profile: ProfileConfig
): number {
  let weightedDistance = 0;
  let totalWeight = 0;
  (Object.keys(profile.target_rubric_scores) as RubricId[]).forEach((r) => {
    const w = profile.rubric_weights[r];
    weightedDistance += Math.abs(rubricScores[r] - profile.target_rubric_scores[r]) * w;
    totalWeight += w;
  });
  return clamp(100 - weightedDistance / totalWeight);
}

function computeCriticalQuestionMatch(
  answers: AnswerMap,
  questions: QuestionConfig[],
  profile: ProfileConfig
): number {
  const selected = questions.filter(q => profile.critical_questions.includes(q.id));
  if (!selected.length) return 50;
  const normalized = selected.map(q => normalizeAnswer(q, answers[q.id]) / 3 * 100);
  const avg = normalized.reduce((a, b) => a + b, 0) / normalized.length;
  return avg;
}

function computeSynergy(profileId: ProfileId, rubricScores: RubricScoreMap): number {
  let bonus = 50;

  if (profileId === "P02" && rubricScores.R2 >= 75 && rubricScores.R5 >= 50) bonus += 20;
  if (profileId === "P14" && rubricScores.R2 >= 80 && rubricScores.R1 >= 50) bonus += 20;
  if (profileId === "P04" && rubricScores.R3 >= 85) bonus += 15;
  if (profileId === "P08" && rubricScores.R3 >= 85 && rubricScores.R7 >= 50) bonus += 20;
  if (profileId === "P10" && rubricScores.R7 >= 85) bonus += 25;
  if (profileId === "P12" && rubricScores.R5 >= 80 && rubricScores.R4 >= 40) bonus += 20;
  if (profileId === "P15" && [rubricScores.R1, rubricScores.R2, rubricScores.R3, rubricScores.R5]
      .filter(v => v >= 70).length >= 3) bonus += 25;

  return clamp(bonus);
}

function computeAgeAdjustment(profileId: ProfileId, age: number): number {
  // Faible impact par design.
  let score = 50;
  if (age >= 55 && ["P05","P07","P11","P15"].includes(profileId)) score += 5;
  if (age < 35 && ["P10","P04","P08"].includes(profileId)) score += 3;
  return clamp(score);
}

export function computeProfileMatches(
  age: number,
  answers: AnswerMap,
  questions: QuestionConfig[],
  profiles: ProfileConfig[]
): ProfileMatch[] {
  const rubricScores = computeRubricScores(answers, questions);

  return profiles.map((profile) => {
    const rubricMatch = computeRubricMatch(rubricScores, profile);
    const criticalMatch = computeCriticalQuestionMatch(answers, questions, profile);
    const synergy = computeSynergy(profile.id, rubricScores);
    const ageAdjustment = computeAgeAdjustment(profile.id, age);

    const compatibility =
      0.55 * rubricMatch +
      0.30 * criticalMatch +
      0.10 * synergy +
      0.05 * ageAdjustment;

    return {
      profile_id: profile.id,
      compatibility_score: +compatibility.toFixed(2),
      rubric_match_score: +rubricMatch.toFixed(2),
      critical_question_match_score: +criticalMatch.toFixed(2),
      synergy_score: +synergy.toFixed(2),
      age_adjustment_score: +ageAdjustment.toFixed(2),
    };
  }).sort((a, b) => b.compatibility_score - a.compatibility_score);
}

export function computeConsistencyFlags(
  answers: AnswerMap,
  questions: QuestionConfig[]
): string[] {
  const flags: string[] = [];
  const get = (id: string) => normalizeAnswer(questions.find(q => q.id === id)!, answers[id]);

  if (get("Q17") === 0 && get("Q43") >= 2 && get("Q44") >= 2 && get("Q45") >= 2) {
    flags.push("sleep_inconsistency");
  }
  if (get("Q03") === 0 && get("Q14") >= 2 && get("Q09") >= 2) {
    flags.push("postprandial_energy_inconsistency");
  }

  return flags;
}

export function computeConfidence(
  matches: ProfileMatch[],
  answeredCount: number,
  consistencyFlags: string[],
  primaryObservability: "low" | "medium" | "high"
): number {
  const top1 = matches[0]?.compatibility_score ?? 0;
  const top2 = matches[1]?.compatibility_score ?? 0;
  const margin = clamp((top1 - top2) * 5); // 20 pts d'écart => 100
  const completeness = clamp((answeredCount / 49) * 100);
  const consistency = consistencyFlags.length === 0 ? 100 : consistencyFlags.length === 1 ? 70 : 40;
  const observability = primaryObservability === "high" ? 90 : primaryObservability === "medium" ? 70 : 50;

  return Math.round(
    0.40 * margin +
    0.25 * completeness +
    0.20 * consistency +
    0.15 * observability
  );
}

export function assignProfiles(matches: ProfileMatch[]) {
  const primary = matches[0];
  const secondary = matches[1];
  const isHybrid = secondary && (primary.compatibility_score - secondary.compatibility_score) <= 5;
  const hasSecondary = secondary && secondary.compatibility_score >= primary.compatibility_score * 0.88;
  return {
    primary_profile_id: primary?.profile_id ?? null,
    secondary_profile_id: hasSecondary ? secondary.profile_id : null,
    hybrid_flag: !!isHybrid,
  };
}
