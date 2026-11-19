import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import request from 'supertest';
import { inject } from 'vitest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { mongoConfig } from '../src/config/configuration.js';

describe('Validations (e2e)', () => {
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

  describe('POST /validations', () => {
    it('creates a validation and returns its id', async () => {
      const response = await request(app.getHttpServer())
        .post('/validations')
        .send({ name: 'Juan Pérez', documentNumber: '1020304050' })
        .expect(201);

      expect(Types.ObjectId.isValid(response.body.id)).toBe(true);
    });

    it('returns 400 with every invalid field', async () => {
      const response = await request(app.getHttpServer())
        .post('/validations')
        .send({ name: 'J4', documentNumber: 'ABC' })
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        error: 'Bad Request',
        path: '/validations',
      });
      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('name'),
          expect.stringContaining('documentNumber'),
        ]),
      );
    });

    it('returns 400 when unknown properties are sent', async () => {
      await request(app.getHttpServer())
        .post('/validations')
        .send({ name: 'Juan Pérez', documentNumber: '1020304050', admin: true })
        .expect(400);
    });
  });

  describe('GET /validations/:id', () => {
    it('returns the stored validation', async () => {
      const created = await request(app.getHttpServer())
        .post('/validations')
        .send({ name: '  Ana   Gómez ', documentNumber: '52123456' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/validations/${created.body.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: created.body.id,
        name: 'Ana Gómez',
        documentNumber: '52123456',
      });
      expect(response.body.createdAt).toBeDefined();
      expect(response.body).not.toHaveProperty('_id');
    });

    it('returns 404 when the validation does not exist', async () => {
      await request(app.getHttpServer())
        .get(`/validations/${new Types.ObjectId().toString()}`)
        .expect(404);
    });

    it('returns 400 when the id is malformed', async () => {
      await request(app.getHttpServer())
        .get('/validations/not-an-id')
        .expect(400);
    });
  });
});