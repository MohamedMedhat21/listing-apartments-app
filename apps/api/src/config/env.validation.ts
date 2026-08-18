import { envSchema, EnvConfig } from './env.schema';

// Fails fast at startup (and at CLI invocation) on misconfiguration, rather
// than surfacing a confusing error at the first request that needs the
// missing value (docs/requirements.md section 9).
export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${issues}`);
  }
  return result.data;
}
