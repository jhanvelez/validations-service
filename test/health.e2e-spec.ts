import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { inject } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { mongoConfig } from '../src/config/configuration.js';

describe('Health (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(mongoConfig.KEY)
      .useValue({ uri: inject('mongoUri') })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health/live reports the process as up', async () => {
    const response = await request(app.getHttpServer())
      .get('/health/live')
      .expect(200);

    expect(response.body.status).toBe('ok');
  });

  it('propagates the incoming x-request-id header', async () => {
    const response = await request(app.getHttpServer())
      .get('/health/live')
      .set('x-request-id', 'e2e-request-id')
      .expect(200);

    expect(response.headers['x-request-id']).toBe('e2e-request-id');
  });

  it('generates a request id when none is sent', async () => {
    const response = await request(app.getHttpServer())
      .get('/health/live')
      .expect(200);

    expect(response.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
  });
});