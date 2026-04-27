import type { QuestionConfig } from '../types/rgnr';

export interface QuestionnaireDraft {
  age: number | null;
  answers: Record<string, string>;
}

const STORAGE_KEY = 'rgnr_mvp_draft_v1';

export const createEmptyDraft = (questions: QuestionConfig[]): QuestionnaireDraft => ({
  age: null,
  answers: Object.fromEntries(questions.map((q) => [q.id, '']))
});

export const saveDraft = (draft: QuestionnaireDraft): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
};

export const loadDraft = (questions: QuestionConfig[]): QuestionnaireDraft => {
  const empty = createEmptyDraft(questions);
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return empty;

  try {
    const parsed = JSON.parse(raw) as QuestionnaireDraft;
    const answers = { ...empty.answers, ...parsed.answers };
    const age = typeof parsed.age === 'number' && parsed.age > 0 ? parsed.age : null;
    return { age, answers };
  } catch {
    return empty;
  }
};

export const resetDraft = (questions: QuestionConfig[]): QuestionnaireDraft => {
  localStorage.removeItem(STORAGE_KEY);
  return createEmptyDraft(questions);
};
