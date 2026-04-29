import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().int().positive(),
  CSV_SOURCE_URL: z.string().url(),
  COFFEE_SHOPS_CACHE_TTL_MS: z.coerce.number().int().nonnegative(),
});

export type EnvironmentVariables = z.infer<typeof envSchema>;

export const validateEnvironment = (
  environment: Record<string, unknown>,
): EnvironmentVariables => envSchema.parse(environment);
