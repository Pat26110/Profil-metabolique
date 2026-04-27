import { beforeEach, describe, expect, it } from 'vitest';
import { questions } from '../data/rgnrData';
import { createEmptyDraft, loadDraft, resetDraft, saveDraft } from './localStorage';

describe('draft local storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates empty draft with all question keys', () => {
    const draft = createEmptyDraft(questions);
    expect(Object.keys(draft.answers)).toHaveLength(questions.length);
    expect(draft.age).toBeNull();
  });

  it('saves and reloads draft', () => {
    const draft = createEmptyDraft(questions);
    draft.age = 37;
    draft.answers.Q01 = 'C';

    saveDraft(draft);
    const loaded = loadDraft(questions);

    expect(loaded.age).toBe(37);
    expect(loaded.answers.Q01).toBe('C');
  });

  it('resets storage', () => {
    const draft = createEmptyDraft(questions);
    draft.answers.Q02 = 'D';
    saveDraft(draft);

    const cleared = resetDraft(questions);
    expect(cleared.answers.Q02).toBe('');
    expect(loadDraft(questions).answers.Q02).toBe('');
  });
});
