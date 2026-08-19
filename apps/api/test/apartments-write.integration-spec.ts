import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { Apartment } from '../src/modules/apartments/entities/apartment.entity';
import { Project } from '../src/modules/projects/entities/project.entity';
import { loginAsAdmin, signTokenWithRole } from './helpers/auth';
import { createApartment, createProject, truncateAll } from './helpers/fixtures';
import { createTestApp, getDataSource } from './helpers/test-app';

describe('Apartments write endpoints (integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let adminToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = getDataSource(app);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await truncateAll(dataSource);
    adminToken = await loginAsAdmin(app, dataSource);
  });

  function authed(token: string): Record<string, string> {
    return { Authorization: `Bearer ${token}` };
  }

  describe('POST /api/v1/apartments', () => {
    it('7.4: creates and returns 201 with the full ApartmentDetail, defaulting status to AVAILABLE (BR-16)', async () => {
      const project = await createProject(dataSource, {
        name: 'Nile Towers',
        city: 'Cairo',
        district: 'Zamalek',
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/apartments')
        .set(authed(adminToken))
        .send({
          unitName: 'Skyline A1',
          unitNumber: 'A-101',
          projectId: project.id,
          price: 2_500_000,
          bedrooms: 3,
          bathrooms: 2,
          areaSqm: 180,
        })
        .expect(201);

      expect(response.body).toMatchObject({
        unitName: 'Skyline A1',
        unitNumber: 'A-101',
        price: 2500000,
        bedrooms: 3,
        bathrooms: 2,
        areaSqm: 180,
        status: 'AVAILABLE',
        amenities: [],
        imageUrls: [],
        project: { id: project.id, name: 'Nile Towers' },
      });
      expect(response.body.id).toEqual(expect.any(String));

      const stored = await dataSource.getRepository(Apartment).findOneBy({ id: response.body.id });
      expect(stored).not.toBeNull();
    });

    it('401: rejects a request with no Authorization header', async () => {
      const project = await createProject(dataSource);

      await request(app.getHttpServer())
        .post('/api/v1/apartments')
        .send({
          unitName: 'A',
          unitNumber: 'A-1',
          projectId: project.id,
          price: 100,
          bedrooms: 1,
          bathrooms: 1,
          areaSqm: 50,
        })
        .expect(401);
    });

    it('BR-19: rejects a valid token that is not ADMIN with 403', async () => {
      const project = await createProject(dataSource);
      const nonAdminToken = await signTokenWithRole(app, 'GUEST');

      await request(app.getHttpServer())
        .post('/api/v1/apartments')
        .set(authed(nonAdminToken))
        .send({
          unitName: 'A',
          unitNumber: 'A-1',
          projectId: project.id,
          price: 100,
          bedrooms: 1,
          bathrooms: 1,
          areaSqm: 50,
        })
        .expect(403);
    });

    it('BR-2: rejects a projectId that does not exist with 422', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/apartments')
        .set(authed(adminToken))
        .send({
          unitName: 'A',
          unitNumber: 'A-1',
          projectId: '00000000-0000-4000-8000-000000000000',
          price: 100,
          bedrooms: 1,
          bathrooms: 1,
          areaSqm: 50,
        })
        .expect(422);

      expect(response.body).toMatchObject({ statusCode: 422 });
    });

    it('BR-2: rejects a projectId belonging to a soft-deleted project with 422', async () => {
      const project = await createProject(dataSource);
      await dataSource.getRepository(Project).softDelete(project.id);

      await request(app.getHttpServer())
        .post('/api/v1/apartments')
        .set(authed(adminToken))
        .send({
          unitName: 'A',
          unitNumber: 'A-1',
          projectId: project.id,
          price: 100,
          bedrooms: 1,
          bathrooms: 1,
          areaSqm: 50,
        })
        .expect(422);
    });

    it('BR-3: rejects a unit number already live in the same project with 409', async () => {
      const project = await createProject(dataSource);
      await createApartment(dataSource, { projectId: project.id, unitNumber: 'A-101' });

      const response = await request(app.getHttpServer())
        .post('/api/v1/apartments')
        .set(authed(adminToken))
        .send({
          unitName: 'Another unit',
          unitNumber: 'A-101',
          projectId: project.id,
          price: 100,
          bedrooms: 1,
          bathrooms: 1,
          areaSqm: 50,
        })
        .expect(409);

      expect(response.body).toMatchObject({ statusCode: 409 });
    });

    it('BR-7: a unit number becomes reusable after the original is soft-deleted', async () => {
      const project = await createProject(dataSource);
      const original = await createApartment(dataSource, {
        projectId: project.id,
        unitNumber: 'A-101',
      });
      await dataSource.getRepository(Apartment).softDelete(original.id);

      await request(app.getHttpServer())
        .post('/api/v1/apartments')
        .set(authed(adminToken))
        .send({
          unitName: 'Reused unit',
          unitNumber: 'A-101',
          projectId: project.id,
          price: 100,
          bedrooms: 1,
          bathrooms: 1,
          areaSqm: 50,
        })
        .expect(201);
    });

    it('BR-23: rejects an unknown body property with 400', async () => {
      const project = await createProject(dataSource);

      await request(app.getHttpServer())
        .post('/api/v1/apartments')
        .set(authed(adminToken))
        .send({
          unitName: 'A',
          unitNumber: 'A-1',
          projectId: project.id,
          price: 100,
          bedrooms: 1,
          bathrooms: 1,
          areaSqm: 50,
          notAField: true,
        })
        .expect(400);
    });

    it('400: rejects a missing required field', async () => {
      const project = await createProject(dataSource);

      await request(app.getHttpServer())
        .post('/api/v1/apartments')
        .set(authed(adminToken))
        .send({ unitName: 'A', projectId: project.id, price: 100, bedrooms: 1, bathrooms: 1 })
        .expect(400);
    });

    it('BR-17: rejects a non-http(s) imageUrls entry with 400', async () => {
      const project = await createProject(dataSource);

      await request(app.getHttpServer())
        .post('/api/v1/apartments')
        .set(authed(adminToken))
        .send({
          unitName: 'A',
          unitNumber: 'A-1',
          projectId: project.id,
          price: 100,
          bedrooms: 1,
          bathrooms: 1,
          areaSqm: 50,
          imageUrls: ['not-a-url'],
        })
        .expect(400);
    });
  });

  describe('PATCH /api/v1/apartments/:id', () => {
    it('7.5: updates only the sent fields, leaving the rest unchanged', async () => {
      const apartment = await createApartment(dataSource, {
        unitName: 'Original name',
        price: 1_000_000,
        bedrooms: 2,
      });

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/apartments/${apartment.id}`)
        .set(authed(adminToken))
        .send({ price: 1_200_000 })
        .expect(200);

      expect(response.body).toMatchObject({
        unitName: 'Original name',
        price: 1200000,
        bedrooms: 2,
      });
    });

    it('400: rejects an empty body (at least one field required)', async () => {
      const apartment = await createApartment(dataSource);

      await request(app.getHttpServer())
        .patch(`/api/v1/apartments/${apartment.id}`)
        .set(authed(adminToken))
        .send({})
        .expect(400);
    });

    it('401: rejects a request with no Authorization header', async () => {
      const apartment = await createApartment(dataSource);

      await request(app.getHttpServer())
        .patch(`/api/v1/apartments/${apartment.id}`)
        .send({ price: 100 })
        .expect(401);
    });

    it('404: updating a non-existent apartment', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/apartments/00000000-0000-4000-8000-000000000000')
        .set(authed(adminToken))
        .send({ price: 100 })
        .expect(404);
    });

    it('BR-2: rejects moving the apartment to a projectId that does not exist with 422', async () => {
      const apartment = await createApartment(dataSource);

      await request(app.getHttpServer())
        .patch(`/api/v1/apartments/${apartment.id}`)
        .set(authed(adminToken))
        .send({ projectId: '00000000-0000-4000-8000-000000000000' })
        .expect(422);
    });

    it('BR-3: rejects renaming unitNumber to one already live in the same project with 409', async () => {
      const project = await createProject(dataSource);
      await createApartment(dataSource, { projectId: project.id, unitNumber: 'A-101' });
      const target = await createApartment(dataSource, {
        projectId: project.id,
        unitNumber: 'A-102',
      });

      await request(app.getHttpServer())
        .patch(`/api/v1/apartments/${target.id}`)
        .set(authed(adminToken))
        .send({ unitNumber: 'A-101' })
        .expect(409);
    });

    it('allows renaming unitNumber to its own current value', async () => {
      const apartment = await createApartment(dataSource, { unitNumber: 'A-101' });

      await request(app.getHttpServer())
        .patch(`/api/v1/apartments/${apartment.id}`)
        .set(authed(adminToken))
        .send({ unitNumber: 'A-101', floor: 2 })
        .expect(200);
    });
  });

  describe('DELETE /api/v1/apartments/:id', () => {
    it('7.6, BR-6: soft-deletes and returns 204; the apartment then 404s on detail and is absent from the list', async () => {
      const apartment = await createApartment(dataSource, { unitName: 'To be deleted' });

      await request(app.getHttpServer())
        .delete(`/api/v1/apartments/${apartment.id}`)
        .set(authed(adminToken))
        .expect(204);

      await request(app.getHttpServer()).get(`/api/v1/apartments/${apartment.id}`).expect(404);

      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/apartments?limit=50')
        .expect(200);
      expect(listResponse.body.data.some((item: { id: string }) => item.id === apartment.id)).toBe(
        false,
      );
    });

    it('BR-6: deleting an already-deleted apartment returns 404, not a second 204', async () => {
      const apartment = await createApartment(dataSource);
      await request(app.getHttpServer())
        .delete(`/api/v1/apartments/${apartment.id}`)
        .set(authed(adminToken))
        .expect(204);

      await request(app.getHttpServer())
        .delete(`/api/v1/apartments/${apartment.id}`)
        .set(authed(adminToken))
        .expect(404);
    });

    it('404: deleting a non-existent apartment', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/apartments/00000000-0000-4000-8000-000000000000')
        .set(authed(adminToken))
        .expect(404);
    });

    it('401: rejects a request with no Authorization header', async () => {
      const apartment = await createApartment(dataSource);

      await request(app.getHttpServer()).delete(`/api/v1/apartments/${apartment.id}`).expect(401);
    });
  });
});
