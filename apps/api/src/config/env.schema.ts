import { z } from 'zod';
import { parseDurationSeconds } from './parse-duration-seconds';

// Only variables actually consumed so far are validated here. Each later
// phase extends this schema when it starts depending on a new variable
// (see docs/implementation-plan.md) — this is not meant to be the full
// .env.example set from day one.
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(4000),

  // Comma-separated browser origins allowed to call the API (section 9).
  CORS_ORIGIN: z
    .string()
    .min(1)
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0),
    )
    .refine((origins) => origins.length > 0, {
      message: 'CORS_ORIGIN must list at least one origin',
    }),

  POSTGRES_HOST: z.string().min(1),
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  POSTGRES_DB: z.string().min(1),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),

  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),

  // No default: the process refuses to start without a secret (section 9).
  JWT_SECRET: z.string().min(1),
  // Parsed to whole seconds at the boundary (BR-20), so every downstream
  // consumer (JwtModule's signOptions, the login response's `expiresIn`)
  // works with a plain number instead of re-parsing a duration string.
  JWT_EXPIRES_IN: z
    .string()
    .min(1)
    .default('1h')
    .transform((value, ctx) => {
      const seconds = parseDurationSeconds(value);
      if (seconds === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `JWT_EXPIRES_IN: "${value}" is not a valid duration (expected e.g. "1h", "30m", "3600s")`,
        });
        return z.NEVER;
      }
      return seconds;
    }),

  // Rate limiting (section 9): 100/min globally, 5/min on POST /auth/login.
  THROTTLE_TTL_MS: z.coerce.number().int().positive().default(60_000),
  THROTTLE_LIMIT: z.coerce.number().int().positive().default(100),
  THROTTLE_LOGIN_TTL_MS: z.coerce.number().int().positive().default(60_000),
  THROTTLE_LOGIN_LIMIT: z.coerce.number().int().positive().default(5),
});

export type EnvConfig = z.infer<typeof envSchema>;
