import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { parse } from 'csv-parse/sync';

import type { ApplicationConfiguration } from '../../../config/configuration';
import type { EnvironmentVariables } from '../../../config/env.schema';
import type { CoffeeShopRecord } from '../business/coffee-shops.types';

const CSV_FETCH_TIMEOUT_MS = 10_000;

@Injectable()
export class CoffeeShopsDataSource {
  private cachedCoffeeShops: ReadonlyArray<CoffeeShopRecord> | null = null;
  private cacheExpiresAtEpochMs = 0;
  private pendingLoad: Promise<ReadonlyArray<CoffeeShopRecord>> | null = null;

  constructor(
    private readonly configService: ConfigService<
      ApplicationConfiguration & EnvironmentVariables,
      true
    >,
  ) {}

  async getCoffeeShops(): Promise<ReadonlyArray<CoffeeShopRecord>> {
    const now = Date.now();

    if (this.cachedCoffeeShops && now < this.cacheExpiresAtEpochMs) {
      return this.cachedCoffeeShops;
    }

    if (this.pendingLoad) {
      return this.pendingLoad;
    }

    this.pendingLoad = this.loadCoffeeShops();

    try {
      const coffeeShops = await this.pendingLoad;
      const cacheTtlMs = this.configService.getOrThrow('coffeeShopsCacheTtlMs', {
        infer: true,
      });

      this.cachedCoffeeShops = coffeeShops;
      this.cacheExpiresAtEpochMs = Date.now() + cacheTtlMs;

      return coffeeShops;
    } finally {
      this.pendingLoad = null;
    }
  }

  private async loadCoffeeShops(): Promise<ReadonlyArray<CoffeeShopRecord>> {
    const csvSourceUrl = this.configService.getOrThrow('csvSourceUrl', {
      infer: true,
    });
    let response: Response;

    try {
      response = await fetch(csvSourceUrl, {
        signal: AbortSignal.timeout(CSV_FETCH_TIMEOUT_MS),
      });
    } catch {
      throw new ServiceUnavailableException({
        error: {
          code: 'COFFEE_SHOPS_SOURCE_UNAVAILABLE',
          message: 'Coffee shops source is unavailable',
        },
      });
    }

    if (!response.ok) {
      throw new ServiceUnavailableException({
        error: {
          code: 'COFFEE_SHOPS_SOURCE_UNAVAILABLE',
          message: 'Coffee shops source is unavailable',
        },
      });
    }

    const csvContent = await response.text();
    let rows: string[][];

    try {
      rows = parse(csvContent, {
        columns: false,
        skip_empty_lines: true,
        trim: true,
      }) as string[][];
    } catch {
      throw new ServiceUnavailableException({
        error: {
          code: 'COFFEE_SHOPS_SOURCE_INVALID',
          message: 'Coffee shops source could not be parsed',
        },
      });
    }

    return rows.map((row) => this.mapRowToCoffeeShop(row));
  }

  private mapRowToCoffeeShop(row: ReadonlyArray<string>): CoffeeShopRecord {
    const [name, xValue, yValue] = row as [string, string, string];
    const x = Number(xValue);
    const y = Number(yValue);

    return {
      name,
      x,
      y,
    };
  }
}
