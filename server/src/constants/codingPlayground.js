export const CODING_LANGUAGES = Object.freeze(['html-css-js']); // one bundled exercise type for now
export const EXERCISE_DIFFICULTY = Object.freeze(['beginner', 'intermediate', 'advanced']);
export const ATTEMPT_STATUS = Object.freeze({ IN_PROGRESS: 'in_progress', SUBMITTED: 'submitted', PASSED: 'passed', FAILED: 'failed' });

export const CODING_LIMITS = Object.freeze({
  MAX_STARTER_CODE: 20000,
  MAX_SUBMITTED_CODE: 20000,
  MAX_TEST_CASES: 20,
  MAX_TEST_CODE: 4000,
  MAX_HINTS: 10,
  MAX_HINT_LENGTH: 500,
  MAX_OUTPUT_SUMMARY: 4000, // captured console output, bounded
  MAX_RESULTS_PER_SUBMIT: 20,
  RUN_TIMEOUT_MS: 5000, // enforced client-side by the sandbox watchdog
});