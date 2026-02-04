import { useState, useEffect, useCallback } from 'react';

interface CheckDraft {
  checkNumber: number;
  date?: string;
  weight?: string;
  notes?: string;
  photoFrontPreview?: string;
  photoSidePreview?: string;
  photoBackPreview?: string;
  lastUpdated: number;
}

const DRAFT_KEY = 'check_draft';
const DRAFT_EXPIRY_HOURS = 24;

export const useCheckDraft = (checkNumber: number) => {
  const [hasDraft, setHasDraft] = useState(false);
  const [draftData, setDraftData] = useState<CheckDraft | null>(null);

  // Check for existing draft on mount
  useEffect(() => {
    const stored = localStorage.getItem(DRAFT_KEY);
    if (stored) {
      try {
        const draft: CheckDraft = JSON.parse(stored);
        // Check if draft is for same check and not expired
        const hoursSinceUpdate = (Date.now() - draft.lastUpdated) / (1000 * 60 * 60);
        if (draft.checkNumber === checkNumber && hoursSinceUpdate < DRAFT_EXPIRY_HOURS) {
          setHasDraft(true);
          setDraftData(draft);
        } else if (hoursSinceUpdate >= DRAFT_EXPIRY_HOURS) {
          // Clear expired draft
          localStorage.removeItem(DRAFT_KEY);
        }
      } catch {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, [checkNumber]);

  // Save draft
  const saveDraft = useCallback((data: Omit<CheckDraft, 'lastUpdated'>) => {
    const draft: CheckDraft = {
      ...data,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    setDraftData(draft);
    setHasDraft(true);
  }, []);

  // Clear draft
  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
    setDraftData(null);
  }, []);

  // Get draft
  const getDraft = useCallback((): CheckDraft | null => {
    return draftData;
  }, [draftData]);

  return {
    hasDraft,
    saveDraft,
    clearDraft,
    getDraft,
  };
};
