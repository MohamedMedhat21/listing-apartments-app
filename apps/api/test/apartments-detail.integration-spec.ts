import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { Apartment } from '../src/modules/apartments/entities/apartment.entity';
import { Project } from '../src/modules/projects/entities/project.entity';
import { createApartment, createDeveloper, createProject, truncateAll } from './helpers/fixtures';
import { createTestApp, getDataSource } from './helpers/test-app';

describe('GET /api/v1/apartments/:id (integration)', () => {
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

  it('7.3: returns 200 with every apartment field plus nested project and developer', async () => {
    const developer = await createDeveloper(dataSource, {
      name: 'Nawy Developments',
      logoUrl: 'https://example.com/logo.png',
    });
    const project = await createProject(dataSource, {
      developerId: developer.id,
      name: 'Nile Towers',
      city: 'Cairo',
      district: 'Zamalek',
    });
    const apartment = await createApartment(dataSource, {
      projectId: project.id,
      unitName: 'Skyline A1',
      unitNumber: 'A-101',
      description: 'A lovely unit',
      price: 2_500_000,
      bedrooms: 3,
      bathrooms: 2,
      areaSqm: 180,
      floor: 5,
      address: '1 Nile Street',
      amenities: ['pool', 'gym'],
      imageUrls: ['https://example.com/1.jpg'],
    });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/apartments/${apartment.id}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: apartment.id,
      unitName: 'Skyline A1',
      unitNumber: 'A-101',
      description: 'A lovely unit',
      price: 2500000,
      bedrooms: 3,
      bathrooms: 2,
      areaSqm: 180,
      floor: 5,
      address: '1 Nile Street',
      amenities: ['pool', 'gym'],
      imageUrls: ['https://example.com/1.jpg'],
      project: {
        id: project.id,
        name: 'Nile Towers',
        city: 'Cairo',
        district: 'Zamalek',
        developer: {
          id: developer.id,
          name: 'Nawy Developments',
          logoUrl: 'https://example.com/logo.png',
        },
      },
    });
    expect(response.body).not.toHaveProperty('projectId');
    expect(response.body).not.toHaveProperty('deletedAt');
  });

  it('400: malformed UUID', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/apartments/not-a-uuid')
      .expect(400);
    expect(response.body).toMatchObject({ statusCode: 400, error: 'Bad Request' });
  });

  it('404: apartment does not exist', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/apartments/00000000-0000-4000-8000-000000000000')
      .expect(404);
    expect(response.body).toMatchObject({ statusCode: 404, error: 'Not Found' });
  });

  it('BR-5: 404 for a soft-deleted apartment', async () => {
    const apartment = await createApartment(dataSource);
    await dataSource.getRepository(Apartment).softDelete(apartment.id);

    await request(app.getHttpServer()).get(`/api/v1/apartments/${apartment.id}`).expect(404);
  });

  it('BR-5: 404 when the parent project is soft-deleted', async () => {
    const project = await createProject(dataSource);
    const apartment = await createApartment(dataSource, { projectId: project.id });
    await dataSource.getRepository(Project).softDelete(project.id);

    await request(app.getHttpServer()).get(`/api/v1/apartments/${apartment.id}`).expect(404);
  });
});
