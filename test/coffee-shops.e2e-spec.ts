import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createServer, type Server } from 'node:http';
import request from 'supertest';

import { configureApplication } from '../src/app.factory';

describe('CoffeeShops endpoint (e2e)', () => {
  let app: INestApplication;
  let csvServer: Server;

  beforeAll(async () => {
    process.env['NODE_ENV'] = 'test';
    csvServer = createServer((request, response) => {
      if (request.url !== '/coffee_shops.csv') {
        response.writeHead(404);
        response.end();
        return;
      }

      response.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8' });
      response.end(
        [
          'Starbucks Seattle,47.5809,-122.3160',
          'Starbucks Seattle2,47.5869,-122.3368',
          'Starbucks SF,37.5209,-122.3340',
          'Starbucks Sydney,-33.871843,151.206767',
        ].join('\n'),
      );
    });

    await new Promise<void>((resolve) => {
      csvServer.listen(0, '127.0.0.1', () => resolve());
    });

    const address = csvServer.address();

    if (address === null || typeof address === 'string') {
      throw new Error('Failed to start CSV test server');
    }

    process.env['CSV_SOURCE_URL'] = `http://127.0.0.1:${address.port}/coffee_shops.csv`;
    const { AppModule } = await import('../src/app.module');

    const testingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = testingModule.createNestApplication();
    configureApplication(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await new Promise<void>((resolve, reject) => {
      csvServer.close((error) => {
        if (error !== undefined) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  });

  it('returns nearby coffee shops ordered by distance', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/coffee-shops/nearby')
      .query({
        x: 47.6,
        y: -122.4,
      })
      .expect(200);

    expect(response.body).toEqual({
      data: [
        {
          name: 'Starbucks Seattle2',
          location: {
            x: 47.5869,
            y: -122.3368,
          },
          distance: 0.0645,
        },
        {
          name: 'Starbucks Seattle',
          location: {
            x: 47.5809,
            y: -122.316,
          },
          distance: 0.0861,
        },
        {
          name: 'Starbucks SF',
          location: {
            x: 37.5209,
            y: -122.334,
          },
          distance: 10.0793,
        },
      ],
    });
  });

  it('rejects invalid query parameters', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/coffee-shops/nearby')
      .query({
        x: 'not-a-number',
        y: -122.316,
      })
      .expect(400);

    expect(response.body).toEqual({
      error: {
        code: 'INVALID_QUERY_PARAMETERS',
        message: 'One or more query parameters are invalid',
      },
    });
  });
});
