// SM-2 Spaced Repetition System
// Based on SuperMemo 2 algorithm

export interface SRSData {
  ease_factor: number; // How easy/difficult the word is (default: 2.5)
  interval_days: number; // Days until next review
  repetitions: number; // Number of successful repetitions
  next_review_date: string; // ISO date string
  last_reviewed: string; // ISO date string
}

export interface ReviewQuality {
  quality: 1 | 2 | 3 | 4; // 1=Again, 2=Hard, 3=Good, 4=Easy
  label: string;
  description: string;
}

export const REVIEW_QUALITIES: ReviewQuality[] = [
  { quality: 1, label: "Again", description: "Complete blackout" },
  { quality: 2, label: "Hard", description: "Difficult recall" },
  { quality: 3, label: "Good", description: "Correct with effort" },
  { quality: 4, label: "Easy", description: "Perfect recall" },
];

const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;

/**
 * Initialize SRS data for a new word
 */
export function initializeSRS(): SRSData {
  const now = new Date();
  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + 1); // First review in 1 day

  return {
    ease_factor: DEFAULT_EASE_FACTOR,
    interval_days: 1,
    repetitions: 0,
    next_review_date: nextReview.toISOString(),
    last_reviewed: now.toISOString(),
  };
}

// Additional exports for compatibility
export interface SRSState {
  interval: number;
  repetition: number;
  ef: number;
}

export const INITIAL_SRS_STATE: SRSState = {
  interval: 0,
  repetition: 0,
  ef: DEFAULT_EASE_FACTOR,
};

/**
 * Calculate SRS state (alias for calculateNextReview for compatibility)
 */
export function calculateSRS(
  state: SRSState,
  quality: number
): SRSState & { nextReviewDate: Date } {
  const srsData: SRSData = {
    ease_factor: state.ef,
    interval_days: state.interval,
    repetitions: state.repetition,
    next_review_date: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
  };

  const result = calculateNextReview(srsData, quality as 1 | 2 | 3 | 4);

  return {
    interval: result.interval_days,
    repetition: result.repetitions,
    ef: result.ease_factor,
    nextReviewDate: new Date(result.next_review_date),
  };
}

/**
 * Calculate next review date based on SM-2 algorithm
 *
 * @param srsData Current SRS data
 * @param quality Review quality (1-4)
 * @returns Updated SRS data
 */
export function calculateNextReview(
  srsData: SRSData,
  quality: 1 | 2 | 3 | 4
): SRSData {
  const now = new Date();
  let { ease_factor, interval_days, repetitions } = srsData;

  // If quality is low (1 or 2), reset
  if (quality < 3) {
    repetitions = 0;
    interval_days = 1;
  } else {
    repetitions += 1;

    // Calculate new interval
    if (repetitions === 1) {
      interval_days = 1;
    } else if (repetitions === 2) {
      interval_days = 6;
    } else {
      interval_days = Math.round(interval_days * ease_factor);
    }
  }

  // Update ease factor based on quality
  ease_factor =
    ease_factor + (0.1 - (4 - quality) * (0.08 + (4 - quality) * 0.02));

  // Ensure ease factor doesn't go below minimum
  if (ease_factor < MIN_EASE_FACTOR) {
    ease_factor = MIN_EASE_FACTOR;
  }

  // Calculate next review date
  const nextReviewDate = new Date(now);
  nextReviewDate.setDate(nextReviewDate.getDate() + interval_days);

  return {
    ease_factor: Number(ease_factor.toFixed(2)),
    interval_days,
    repetitions,
    next_review_date: nextReviewDate.toISOString(),
    last_reviewed: now.toISOString(),
  };
}

/**
 * Check if a word is due for review
 */
export function isDueForReview(srsData: SRSData): boolean {
  const now = new Date();
  const nextReview = new Date(srsData.next_review_date);
  return now >= nextReview;
}

/**
 * Get words that need review today
 */
export function filterDueWords<T extends { srs_data?: SRSData }>(
  words: T[]
): T[] {
  return words.filter((word) => {
    if (!word.srs_data) return true; // New words should be reviewed
    return isDueForReview(word.srs_data);
  });
}

/**
 * Get review statistics
 */
export function getReviewStats<T extends { srs_data?: SRSData }>(
  words: T[]
): {
  dueToday: number;
  dueSoon: number; // Next 3 days
  mastered: number; // interval > 30 days
  total: number;
} {
  const now = new Date();
  const threeDaysLater = new Date(now);
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);

  let dueToday = 0;
  let dueSoon = 0;
  let mastered = 0;

  words.forEach((word) => {
    if (!word.srs_data) {
      dueToday++;
      return;
    }

    const nextReview = new Date(word.srs_data.next_review_date);

    if (nextReview <= now) {
      dueToday++;
    } else if (nextReview <= threeDaysLater) {
      dueSoon++;
    }

    if (word.srs_data.interval_days > 30) {
      mastered++;
    }
  });

  return {
    dueToday,
    dueSoon,
    mastered,
    total: words.length,
  };
}

/**
 * Sort words by review priority
 * Words due first, then by ease factor (harder words first)
 */
export function sortByReviewPriority<T extends { srs_data?: SRSData }>(
  words: T[]
): T[] {
  return [...words].sort((a, b) => {
    const aSRS = a.srs_data;
    const bSRS = b.srs_data;

    // New words (no SRS data) come first
    if (!aSRS && bSRS) return -1;
    if (aSRS && !bSRS) return 1;
    if (!aSRS && !bSRS) return 0;

    // Then by due date
    const aDate = new Date(aSRS!.next_review_date);
    const bDate = new Date(bSRS!.next_review_date);

    if (aDate < bDate) return -1;
    if (aDate > bDate) return 1;

    // If same due date, prioritize harder words (lower ease factor)
    return aSRS!.ease_factor - bSRS!.ease_factor;
  });
}

/**
 * Get interval label for display
 */
export function getIntervalLabel(days: number): string {
  if (days < 1) return "Today";
  if (days === 1) return "1 day";
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.floor(days / 7)} weeks`;
  if (days < 365) return `${Math.floor(days / 30)} months`;
  return `${Math.floor(days / 365)} years`;
}
