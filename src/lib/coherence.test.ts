import { describe, expect, it } from 'vitest';
import { profiles, questions } from '../data/rgnrData';
import { validateDataCoherence } from './coherence';

describe('validateDataCoherence', () => {
  it('returns coherent report for v1 files', () => {
    const report = validateDataCoherence(questions, profiles);
    expect(report.ok).toBe(true);
    expect(report.issues).toHaveLength(0);
  });
});
