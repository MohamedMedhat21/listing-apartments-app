const DURATION_PATTERN = /^(\d+)(ms|s|m|h|d)?$/;

const UNIT_TO_MS: Record<string, number> = {
  ms: 1,
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

/**
 * Parses a human-friendly duration string (e.g. "1h", "30m") — the same
 * format jsonwebtoken's own `expiresIn` option historically accepted — into
 * whole seconds. A bare number (no unit) is already-seconds. Returns null
 * for an unparseable value, for the caller (env.schema.ts) to turn into a
 * proper Zod validation issue.
 *
 * Deliberately idempotent: parsing this function's own numeric output must
 * succeed too, because @nestjs/config writes the *validated* (i.e. already
 * seconds) value back into `process.env` after startup, and anything else
 * in the same process that later re-parses `process.env` (e.g. the
 * standalone TypeORM DataSource used by the seed/migration CLI and by
 * integration tests) would otherwise see that stringified number instead
 * of the original "1h".
 */
export function parseDurationSeconds(value: string): number | null {
  const match = DURATION_PATTERN.exec(value.trim());
  if (!match) {
    return null;
  }
  const [, amount, unit = 's'] = match;
  if (amount === undefined) {
    return null;
  }
  const unitToMs = UNIT_TO_MS[unit];
  if (unitToMs === undefined) {
    return null;
  }
  return (Number(amount) * unitToMs) / 1000;
}
