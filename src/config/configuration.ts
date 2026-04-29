import { z } from 'zod';

export interface ApplicationConfiguration {
  readonly port: number;
  readonly csvSourceUrl: string;
  readonly coffeeShopsCacheTtlMs: number;
}

const configurationEnvironmentSchema = z.object({
  PORT: z.coerce.number().int().positive(),
  CSV_SOURCE_URL: z.string().url(),
  COFFEE_SHOPS_CACHE_TTL_MS: z.coerce.number().int().nonnegative(),
});

export const configuration = (): ApplicationConfiguration => {
  const environment = configurationEnvironmentSchema.parse(process.env);

  return {
    port: environment.PORT,
    csvSourceUrl: environment.CSV_SOURCE_URL,
    coffeeShopsCacheTtlMs: environment.COFFEE_SHOPS_CACHE_TTL_MS,
  };
};
