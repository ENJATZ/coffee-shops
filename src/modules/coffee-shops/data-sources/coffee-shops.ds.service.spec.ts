import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createServer, type Server } from 'node:http';

import type { ApplicationConfiguration } from '../../../config/configuration';
import type { EnvironmentVariables } from '../../../config/env.schema';
import { CoffeeShopsDataSource } from './coffee-shops.ds.service';

const TEST_CACHE_TTL_MS = 120_000;

describe('CoffeeShopsDataSourceService', () => {
  let csvServer: Server;
  let csvResponseBody = 'Starbucks Seattle,47.5809,-122.3160\n';
  let csvSourceUrl: string;
  let isCsvServerClosed = false;

  const closeCsvServer = async (): Promise<void> => {
    if (isCsvServerClosed) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      csvServer.close((error) => {
        if (error !== undefined) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    isCsvServerClosed = true;
  };

  beforeEach(async () => {
    csvResponseBody = 'Starbucks Seattle,47.5809,-122.3160\n';
    csvServer = createServer((request, response) => {
      if (request.url !== '/coffee_shops.csv') {
        response.writeHead(404);
        response.end();
        return;
      }

      response.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8' });
      response.end(csvResponseBody);
    });

    await new Promise<void>((resolve) => {
      csvServer.listen(0, '127.0.0.1', () => resolve());
    });

    const address = csvServer.address();

    if (address === null || typeof address === 'string') {
      throw new Error('Failed to start CSV test server');
    }

    csvSourceUrl = `http://127.0.0.1:${address.port}/coffee_shops.csv`;
    isCsvServerClosed = false;
  });

  afterEach(async () => {
    vi.useRealTimers();
    await closeCsvServer();
  });

  it('caches parsed CSV data for two minutes', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-24T00:00:00.000Z'));

    const service = new CoffeeShopsDataSource(createConfigService(csvSourceUrl));

    const firstRead = await service.getCoffeeShops();

    csvResponseBody = 'Starbucks Sydney,-33.871843,151.206767\n';

    const cachedRead = await service.getCoffeeShops();

    expect(firstRead).toEqual(cachedRead);
    expect(cachedRead[0]?.name).toBe('Starbucks Seattle');

    vi.setSystemTime(Date.now() + TEST_CACHE_TTL_MS + 1);

    const reloadedRead = await service.getCoffeeShops();

    expect(reloadedRead[0]?.name).toBe('Starbucks Sydney');
  });

  it('parses valid CSV rows', async () => {
    csvResponseBody = [
      'Starbucks Seattle,47.5809,-122.3160',
      'Starbucks Seattle2,47.5869,-122.3368',
    ].join('\n');

    const service = new CoffeeShopsDataSource(createConfigService(csvSourceUrl));

    await expect(service.getCoffeeShops()).resolves.toEqual([
      {
        name: 'Starbucks Seattle',
        x: 47.5809,
        y: -122.316,
      },
      {
        name: 'Starbucks Seattle2',
        x: 47.5869,
        y: -122.3368,
      },
    ]);
  });

  it('throws when the remote source cannot be fetched', async () => {
    await closeCsvServer();

    const service = new CoffeeShopsDataSource(createConfigService(csvSourceUrl));

    try {
      await service.getCoffeeShops();
      throw new Error('Expected service.getCoffeeShops() to throw');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(ServiceUnavailableException);

      const exception = error as ServiceUnavailableException;

      expect(exception.getStatus()).toBe(503);
      expect(exception.getResponse()).toEqual({
        error: {
          code: 'COFFEE_SHOPS_SOURCE_UNAVAILABLE',
          message: 'Coffee shops source is unavailable',
        },
      });
    }
  });
});

const createConfigService = (
  csvSourceUrl: string,
): ConfigService<ApplicationConfiguration & EnvironmentVariables, true> =>
  new ConfigService<ApplicationConfiguration & EnvironmentVariables, true>({
    port: 3000,
    csvSourceUrl,
    coffeeShopsCacheTtlMs: TEST_CACHE_TTL_MS,
  });
