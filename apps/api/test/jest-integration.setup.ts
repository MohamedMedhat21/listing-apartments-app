// Runs before each integration test file's imports (see jest-integration.json
// `setupFiles`), so `src/database/data-source.ts` picks up this override
// when it validates `process.env` — dotenv does not overwrite a variable
// that is already set. Integration tests never touch the dev/seed database.
process.env.POSTGRES_DB = 'apartments_test';

// @nestjs/config validates process.env exactly once per process and caches
// the result, so every app instance in every test file — no matter when it
// boots — shares this one login-rate-limit ceiling. Most login-calling
// tests need this generous, so they don't 429 each other by sharing one
// app's in-memory throttler; the one test that exercises the *real* 5/min
// limit (auth.integration-spec.ts) does so via overrideProvider on its own
// isolated app instance instead of a process.env override.
process.env.THROTTLE_LOGIN_LIMIT = '1000';
