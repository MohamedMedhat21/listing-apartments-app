// Runs before each integration test file's imports (see jest-integration.json
// `setupFiles`), so `src/database/data-source.ts` picks up this override
// when it validates `process.env` — dotenv does not overwrite a variable
// that is already set. Integration tests never touch the dev/seed database.
process.env.POSTGRES_DB = 'apartments_test';
