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

const DRAFT_PREFIX = 'check_draft_';
const DRAFT_EXPIRY_HOURS = 24;

const getDraftKey = (checkNumber: number) => `${DRAFT_PREFIX}${checkNumber}`;

// Cleanup all expired drafts on module load
const cleanupExpiredDrafts = () => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(DRAFT_PREFIX)) {
        const stored = localStorage.getItem(key);
        if (stored) {
          const draft: CheckDraft = JSON.parse(stored);
          const hoursSince = (Date.now() - draft.lastUpdated) / (1000 * 60 * 60);
          if (hoursSince >= DRAFT_EXPIRY_HOURS) {
            localStorage.removeItem(key);
          }
        }
      }
    }
  } catch {
    // Ignore cleanup errors
  }
};

cleanupExpiredDrafts();

export const useCheckDraft = (checkNumber: number) => {
  const [hasDraft, setHasDraft] = useState(false);
  const [draftData, setDraftData] = useState<CheckDraft | null>(null);

  const draftKey = getDraftKey(checkNumber);

  // Check for existing draft on mount
  useEffect(() => {
    const stored = localStorage.getItem(draftKey);
    if (stored) {
      try {
        const draft: CheckDraft = JSON.parse(stored);
        const hoursSinceUpdate = (Date.now() - draft.lastUpdated) / (1000 * 60 * 60);
        if (hoursSinceUpdate < DRAFT_EXPIRY_HOURS) {
          setHasDraft(true);
          setDraftData(draft);
        } else {
          localStorage.removeItem(draftKey);
        }
      } catch {
        localStorage.removeItem(draftKey);
      }
    }
  }, [checkNumber, draftKey]);

  // Save draft
  const saveDraft = useCallback((data: Omit<CheckDraft, 'lastUpdated'>) => {
    const draft: CheckDraft = {
      ...data,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(draftKey, JSON.stringify(draft));
    setDraftData(draft);
    setHasDraft(true);
  }, [draftKey]);

  // Clear draft
  const clearDraft = useCallback(() => {
    localStorage.removeItem(draftKey);
    setHasDraft(false);
    setDraftData(null);
  }, [draftKey]);

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
