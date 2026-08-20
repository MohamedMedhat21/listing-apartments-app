import { ValueTransformer } from 'typeorm';

/**
 * Postgres `numeric` columns come back from the `pg` driver as strings, to
 * avoid silently rounding arbitrary-precision values. `price` and `areaSqm`
 * are capped well under 10^12 (see docs/requirements.md section 5.3), which
 * is far inside the exact-integer range of a double even scaled by 100, so
 * converting to `number` here loses no precision.
 */
export const numericTransformer: ValueTransformer = {
  to: (value?: number | null): number | null | undefined => value,
  from: (value?: string | null): number | null | undefined =>
    value === null || value === undefined ? value : Number(value),
};
