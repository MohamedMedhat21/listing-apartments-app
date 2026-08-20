import { ApartmentStatus } from '@apartments/shared';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { createApartment, createDeveloper, createProject, truncateAll } from './helpers/fixtures';
import { createTestApp, getDataSource } from './helpers/test-app';
import { Apartment } from '../src/modules/apartments/entities/apartment.entity';
import { Project } from '../src/modules/projects/entities/project.entity';

describe('GET /api/v1/apartments (integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = getDataSource(app);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await truncateAll(dataSource);
  });

  it('BR-5: excludes a soft-deleted apartment from the list', async () => {
    const project = await createProject(dataSource);
    const live = await createApartment(dataSource, {
      projectId: project.id,
      unitName: 'Live Unit',
    });
    const deleted = await createApartment(dataSource, {
      projectId: project.id,
      unitName: 'Deleted Unit',
    });
    await dataSource.getRepository(Apartment).softDelete(deleted.id);

    const response = await request(app.getHttpServer()).get('/api/v1/apartments').expect(200);

    const ids = (response.body.data as Array<{ id: string }>).map((item) => item.id);
    expect(ids).toContain(live.id);
    expect(ids).not.toContain(deleted.id);
  });

  it('BR-5: excludes an apartment whose parent project is soft-deleted', async () => {
    const project = await createProject(dataSource);
    const apartment = await createApartment(dataSource, { projectId: project.id });
    await dataSource.getRepository(Project).softDelete(project.id);

    const response = await request(app.getHttpServer()).get('/api/v1/apartments').expect(200);

    const ids = (response.body.data as Array<{ id: string }>).map((item) => item.id);
    expect(ids).not.toContain(apartment.id);
  });

  it('BR-8, BR-9: combines q with explicit filters (AND across filters, OR within q)', async () => {
    const developer = await createDeveloper(dataSource);
    const matchingProject = await createProject(dataSource, {
      developerId: developer.id,
      name: 'Skyline Towers',
    });
    const otherProject = await createProject(dataSource, {
      developerId: developer.id,
      name: 'Marina View',
    });

    const target = await createApartment(dataSource, {
      projectId: matchingProject.id,
      unitName: 'Penthouse',
      bedrooms: 3,
      price: 3_000_000,
    });
    // Same q match (project name) but filtered out by bedrooms.
    await createApartment(dataSource, {
      projectId: matchingProject.id,
      unitName: 'Studio',
      bedrooms: 1,
      price: 1_000_000,
    });
    // Matches bedrooms but not q (different project name, different unit name/number).
    await createApartment(dataSource, {
      projectId: otherProject.id,
      unitName: 'Duplex',
      unitNumber: 'ZZZ-999',
      bedrooms: 3,
      price: 3_500_000,
    });

    const response = await request(app.getHttpServer())
      .get('/api/v1/apartments')
      .query({ q: 'skyline', bedrooms: 3 })
      .expect(200);

    const ids = (response.body.data as Array<{ id: string }>).map((item) => item.id);
    expect(ids).toEqual([target.id]);
  });

  it('BR-8: q matches case-insensitively and partially against unitNumber', async () => {
    const apartment = await createApartment(dataSource, { unitNumber: 'A-Special-101' });

    const response = await request(app.getHttpServer())
      .get('/api/v1/apartments')
      .query({ q: 'special' })
      .expect(200);

    const ids = (response.body.data as Array<{ id: string }>).map((item) => item.id);
    expect(ids).toContain(apartment.id);
  });

  it('BR-10: a whitespace-only q is ignored, returning the unfiltered list', async () => {
    await createApartment(dataSource);
    await createApartment(dataSource);

    const response = await request(app.getHttpServer())
      .get('/api/v1/apartments')
      .query({ q: '   ' })
      .expect(200);

    expect(response.body.data).toHaveLength(2);
  });

  it('BR-11, BR-12: a page past the end returns 200 with empty data and accurate meta', async () => {
    await createApartment(dataSource);

    const response = await request(app.getHttpServer())
      .get('/api/v1/apartments')
      .query({ page: 99, limit: 12 })
      .expect(200);

    expect(response.body.data).toEqual([]);
    expect(response.body.meta).toEqual({ page: 99, limit: 12, total: 1, totalPages: 1 });
  });

  it('BR-11: limit defaults to 12 and page defaults to 1', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/apartments').expect(200);

    expect(response.body.meta.page).toBe(1);
    expect(response.body.meta.limit).toBe(12);
  });

  it('BR-11: limit above 50 is rejected with 400', async () => {
    await request(app.getHttpServer()).get('/api/v1/apartments').query({ limit: 51 }).expect(400);
  });

  it('BR-13: sort=price:asc orders ascending by price', async () => {
    const project = await createProject(dataSource);
    const cheap = await createApartment(dataSource, { projectId: project.id, price: 500_000 });
    const expensive = await createApartment(dataSource, {
      projectId: project.id,
      price: 5_000_000,
    });

    const response = await request(app.getHttpServer())
      .get('/api/v1/apartments')
      .query({ sort: 'price:asc' })
      .expect(200);

    const ids = (response.body.data as Array<{ id: string }>).map((item) => item.id);
    expect(ids).toEqual([cheap.id, expensive.id]);
  });

  it('BR-14: minPrice greater than maxPrice returns 400', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/apartments')
      .query({ minPrice: 2_000_000, maxPrice: 1_000_000 })
      .expect(400);

    expect(response.body).toMatchObject({ statusCode: 400, error: 'Bad Request' });
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body.path).toMatch(/^\/api\/v1\/apartments\?/);
  });

  it('BR-23: an unknown query parameter returns 400', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/apartments')
      .query({ notARealParam: '1' })
      .expect(400);
  });

  it('filters by status', async () => {
    const project = await createProject(dataSource);
    const available = await createApartment(dataSource, {
      projectId: project.id,
      status: ApartmentStatus.AVAILABLE,
    });
    await createApartment(dataSource, { projectId: project.id, status: ApartmentStatus.SOLD });

    const response = await request(app.getHttpServer())
      .get('/api/v1/apartments')
      .query({ status: ApartmentStatus.AVAILABLE })
      .expect(200);

    const ids = (response.body.data as Array<{ id: string }>).map((item) => item.id);
    expect(ids).toEqual([available.id]);
  });

  it('list item shape matches section 7.2 exactly', async () => {
    const project = await createProject(dataSource, {
      name: 'Nile Towers',
      city: 'Cairo',
      district: 'Zamalek',
    });
    await createApartment(dataSource, {
      projectId: project.id,
      imageUrls: ['https://example.com/cover.jpg'],
    });

    const response = await request(app.getHttpServer()).get('/api/v1/apartments').expect(200);

    expect(Object.keys(response.body.data[0]).sort()).toEqual(
      [
        'id',
        'unitName',
        'unitNumber',
        'price',
        'bedrooms',
        'bathrooms',
        'areaSqm',
        'status',
        'coverImageUrl',
        'project',
      ].sort(),
    );
    expect(response.body.data[0].coverImageUrl).toBe('https://example.com/cover.jpg');
    expect(response.body.data[0].project).toEqual({
      id: project.id,
      name: 'Nile Towers',
      city: 'Cairo',
      district: 'Zamalek',
    });
  });
});
