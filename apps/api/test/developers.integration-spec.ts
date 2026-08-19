import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { Developer } from '../src/modules/developers/entities/developer.entity';
import { Project } from '../src/modules/projects/entities/project.entity';
import { createDeveloper, createProject, truncateAll } from './helpers/fixtures';
import { createTestApp, getDataSource } from './helpers/test-app';

describe('GET /api/v1/developers (integration)', () => {
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

  it('7.8: returns { data } with no pagination meta', async () => {
    await createDeveloper(dataSource);

    const response = await request(app.getHttpServer()).get('/api/v1/developers').expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).not.toHaveProperty('meta');
  });

  it('7.8: response shape is { id, name, logoUrl, projectCount }', async () => {
    const developer = await createDeveloper(dataSource, {
      name: 'Nawy Developments',
      logoUrl: 'https://example.com/logo.png',
    });
    await createProject(dataSource, { developerId: developer.id });
    await createProject(dataSource, { developerId: developer.id });

    const response = await request(app.getHttpServer()).get('/api/v1/developers').expect(200);

    expect(response.body.data).toEqual([
      {
        id: developer.id,
        name: 'Nawy Developments',
        logoUrl: 'https://example.com/logo.png',
        projectCount: 2,
      },
    ]);
  });

  it('projectCount excludes soft-deleted projects (BR-5)', async () => {
    const developer = await createDeveloper(dataSource);
    await createProject(dataSource, { developerId: developer.id });
    const deleted = await createProject(dataSource, { developerId: developer.id });
    await dataSource.getRepository(Project).softDelete(deleted.id);

    const response = await request(app.getHttpServer()).get('/api/v1/developers').expect(200);

    expect(response.body.data[0].projectCount).toBe(1);
  });

  it('BR-5: excludes a soft-deleted developer', async () => {
    const developer = await createDeveloper(dataSource);
    await dataSource.getRepository(Developer).softDelete(developer.id);

    const response = await request(app.getHttpServer()).get('/api/v1/developers').expect(200);

    expect(response.body.data).toEqual([]);
  });
});
