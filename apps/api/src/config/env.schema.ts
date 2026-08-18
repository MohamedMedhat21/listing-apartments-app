import { z } from 'zod';

// Only variables actually consumed so far are validated here. Each later
// phase extends this schema when it starts depending on a new variable
// (see docs/implementation-plan.md) — this is not meant to be the full
// .env.example set from day one.
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(4000),

  POSTGRES_HOST: z.string().min(1),
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  POSTGRES_DB: z.string().min(1),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),

  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
});

export type EnvConfig = z.infer<typeof envSchema>;
