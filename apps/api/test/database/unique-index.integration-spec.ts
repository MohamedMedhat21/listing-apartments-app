import type { Repository } from 'typeorm';
import AppDataSource from '../../src/database/data-source';
import { Apartment } from '../../src/modules/apartments/entities/apartment.entity';
import { Developer } from '../../src/modules/developers/entities/developer.entity';
import { Project } from '../../src/modules/projects/entities/project.entity';

/**
 * BR-3: `unitNumber` must be unique within a project among non-soft-deleted
 * apartments; violation returns 409 at the API layer (P4), but the index is
 * the authority — this test exercises the index directly against real
 * PostgreSQL, per docs/implementation-plan.md P1.
 *
 * BR-7: a soft-deleted apartment's `unitNumber` becomes available for reuse
 * within its project, which is exactly what makes the index partial rather
 * than plain.
 */
describe('apartments partial unique index (BR-3, BR-7)', () => {
  let developerRepository: Repository<Developer>;
  let projectRepository: Repository<Project>;
  let apartmentRepository: Repository<Apartment>;

  beforeAll(async () => {
    await AppDataSource.initialize();
    await AppDataSource.runMigrations();

    developerRepository = AppDataSource.getRepository(Developer);
    projectRepository = AppDataSource.getRepository(Project);
    apartmentRepository = AppDataSource.getRepository(Apartment);
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  beforeEach(async () => {
    // Hard cleanup, not soft delete, so every test starts from a genuinely
    // empty table regardless of run order (AGENTS.md section 8).
    await AppDataSource.query('TRUNCATE TABLE "apartments", "projects", "developers" CASCADE');
  });

  async function createProjectFixture(): Promise<Project> {
    const developer = await developerRepository.save(
      developerRepository.create({ name: `Test Developer ${Date.now()}-${Math.random()}` }),
    );
    return projectRepository.save(
      projectRepository.create({
        name: 'Test Project',
        developerId: developer.id,
        city: 'New Cairo',
        district: 'Fifth Settlement',
      }),
    );
  }

  function apartmentFixture(projectId: string, unitNumber: string): Partial<Apartment> {
    return {
      unitName: 'Apartment Under Test',
      unitNumber,
      projectId,
      price: 2_000_000,
      bedrooms: 2,
      bathrooms: 2,
      areaSqm: 120,
    };
  }

  it('BR-3: rejects a duplicate unitNumber within the same project while the original is live', async () => {
    const project = await createProjectFixture();
    await apartmentRepository.save(
      apartmentRepository.create(apartmentFixture(project.id, 'A-101')),
    );

    await expect(
      apartmentRepository.save(apartmentRepository.create(apartmentFixture(project.id, 'A-101'))),
    ).rejects.toThrow(/uq_apartments_project_id_unit_number_live/);
  });

  it('BR-9 (scoping): the same unitNumber is allowed in a different project', async () => {
    const projectOne = await createProjectFixture();
    const projectTwo = await projectRepository.save(
      projectRepository.create({
        name: 'Second Test Project',
        developerId: projectOne.developerId,
        city: 'New Cairo',
        district: 'Fifth Settlement',
      }),
    );

    await apartmentRepository.save(
      apartmentRepository.create(apartmentFixture(projectOne.id, 'A-101')),
    );

    await expect(
      apartmentRepository.save(
        apartmentRepository.create(apartmentFixture(projectTwo.id, 'A-101')),
      ),
    ).resolves.toMatchObject({ unitNumber: 'A-101' });
  });

  it('BR-7: a unitNumber becomes reusable within its project once the original is soft-deleted', async () => {
    const project = await createProjectFixture();
    const original = await apartmentRepository.save(
      apartmentRepository.create(apartmentFixture(project.id, 'A-101')),
    );

    await apartmentRepository.softDelete(original.id);

    await expect(
      apartmentRepository.save(apartmentRepository.create(apartmentFixture(project.id, 'A-101'))),
    ).resolves.toMatchObject({ unitNumber: 'A-101' });
  });

  it('BR-3 + BR-7: a live duplicate is still rejected after an unrelated soft delete', async () => {
    const project = await createProjectFixture();
    const unrelated = await apartmentRepository.save(
      apartmentRepository.create(apartmentFixture(project.id, 'B-201')),
    );
    await apartmentRepository.softDelete(unrelated.id);

    await apartmentRepository.save(
      apartmentRepository.create(apartmentFixture(project.id, 'A-101')),
    );

    await expect(
      apartmentRepository.save(apartmentRepository.create(apartmentFixture(project.id, 'A-101'))),
    ).rejects.toThrow(/uq_apartments_project_id_unit_number_live/);
  });
});
