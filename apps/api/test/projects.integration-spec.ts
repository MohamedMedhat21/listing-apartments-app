import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { Apartment } from '../src/modules/apartments/entities/apartment.entity';
import { Developer } from '../src/modules/developers/entities/developer.entity';
import { Project } from '../src/modules/projects/entities/project.entity';
import { createApartment, createDeveloper, createProject, truncateAll } from './helpers/fixtures';
import { createTestApp, getDataSource } from './helpers/test-app';

describe('GET /api/v1/projects (integration)', () => {
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

  it('7.7: returns { data } with no pagination meta', async () => {
    await createProject(dataSource);

    const response = await request(app.getHttpServer()).get('/api/v1/projects').expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).not.toHaveProperty('meta');
  });

  it('7.7: response shape is { id, name, city, district, developer: { id, name }, apartmentCount }', async () => {
    const developer = await createDeveloper(dataSource, { name: 'Nawy Developments' });
    const project = await createProject(dataSource, {
      developerId: developer.id,
      name: 'Nile Towers',
      city: 'Cairo',
      district: 'Zamalek',
    });
    await createApartment(dataSource, { projectId: project.id });
    await createApartment(dataSource, { projectId: project.id });

    const response = await request(app.getHttpServer()).get('/api/v1/projects').expect(200);

    expect(response.body.data).toEqual([
      {
        id: project.id,
        name: 'Nile Towers',
        city: 'Cairo',
        district: 'Zamalek',
        developer: { id: developer.id, name: 'Nawy Developments' },
        apartmentCount: 2,
      },
    ]);
  });

  it('apartmentCount excludes soft-deleted apartments (BR-5)', async () => {
    const project = await createProject(dataSource);
    await createApartment(dataSource, { projectId: project.id });
    const deleted = await createApartment(dataSource, { projectId: project.id });
    await dataSource.getRepository(Apartment).softDelete(deleted.id);

    const response = await request(app.getHttpServer()).get('/api/v1/projects').expect(200);

    expect(response.body.data[0].apartmentCount).toBe(1);
  });

  it('BR-5: excludes a soft-deleted project', async () => {
    const project = await createProject(dataSource);
    await dataSource.getRepository(Project).softDelete(project.id);

    const response = await request(app.getHttpServer()).get('/api/v1/projects').expect(200);

    expect(response.body.data).toEqual([]);
  });

  it('BR-5: excludes a project whose developer is soft-deleted', async () => {
    const developer = await createDeveloper(dataSource);
    await createProject(dataSource, { developerId: developer.id });
    await dataSource.getRepository(Developer).softDelete(developer.id);

    const response = await request(app.getHttpServer()).get('/api/v1/projects').expect(200);

    expect(response.body.data).toEqual([]);
  });
});
