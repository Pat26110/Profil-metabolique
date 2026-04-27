import { describe, expect, it } from 'vitest';
import { calibrationCases, profiles, questions } from '../data/rgnrData';
import { assignProfiles, computeProfileMatches } from './rgnr_scoring_engine_v1';
import type { AnswerMap, RubricId } from './rgnr_scoring_engine_v1';

const rubricOrder: RubricId[] = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7'];

function calibrationToAnswerMap(index: number): AnswerMap {
  const calibration = calibrationCases[index];
  const answers: AnswerMap = {};

  for (const rubric of rubricOrder) {
    const rubricQuestions = questions
      .filter((q) => q.rubric_id === rubric)
      .sort((a, b) => a.id.localeCompare(b.id));

    calibration.answers[rubric].forEach((score, idx) => {
      const question = rubricQuestions[idx];
      const choice = Object.entries(question.choice_scores).find(([, value]) => value === score)?.[0] ?? 'A';
      answers[question.id] = choice;
    });
  }

  return answers;
}

describe('computeProfileMatches', () => {
  it('matches expected primary profile on first five calibration cases', () => {
    for (let i = 0; i < 5; i += 1) {
      const calibration = calibrationCases[i];
      const answers = calibrationToAnswerMap(i);
      const matches = computeProfileMatches(calibration.age, answers, questions, profiles);
      const assignment = assignProfiles(matches);
      expect(assignment.primary_profile_id).toBe(calibration.expected_primary);
    }
  });
});
