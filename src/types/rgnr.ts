export type RubricId = 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6' | 'R7';
export type ProfileId =
  | 'P01' | 'P02' | 'P03' | 'P04' | 'P05'
  | 'P06' | 'P07' | 'P08' | 'P09' | 'P10'
  | 'P11' | 'P12' | 'P13' | 'P14' | 'P15';
export type QuestionId = `Q${string}`;

export interface QuestionConfig {
  id: QuestionId;
  rubric_id: RubricId;
  rubric_label: string;
  label: string;
  short_label: string;
  scoring_mode: 'direct' | 'inverted_labels';
  weight: number;
  choice_scores: Record<string, number>;
  choice_labels: Record<string, string>;
  associated_profiles: ProfileId[];
  notes?: string;
}

export interface ProfileConfig {
  id: ProfileId;
  label: string;
  summary: string;
  observability: 'low' | 'medium' | 'high';
  target_rubric_scores: Record<RubricId, number>;
  rubric_weights: Record<RubricId, number>;
  critical_questions: QuestionId[];
  secondary_candidates: ProfileId[];
  modeling_status: string;
}

export interface CalibrationCase {
  case_id: string;
  age: number;
  expected_primary: ProfileId;
  expected_secondary: ProfileId;
  answers: Record<RubricId, number[]>;
}
