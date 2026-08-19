import { ApartmentStatus } from '@apartments/shared';
import { DataSource, DeepPartial } from 'typeorm';
import { Apartment } from '../../src/modules/apartments/entities/apartment.entity';
import { Developer } from '../../src/modules/developers/entities/developer.entity';
import { Project } from '../../src/modules/projects/entities/project.entity';

let uniqueCounter = 0;
function unique(label: string): string {
  uniqueCounter += 1;
  return `${label}-${Date.now()}-${uniqueCounter}`;
}

export async function truncateAll(dataSource: DataSource): Promise<void> {
  await dataSource.query('TRUNCATE TABLE "apartments", "projects", "developers", "users" CASCADE');
}

export async function createDeveloper(
  dataSource: DataSource,
  overrides: DeepPartial<Developer> = {},
): Promise<Developer> {
  const repository = dataSource.getRepository(Developer);
  return repository.save(
    repository.create({
      name: unique('Developer'),
      ...overrides,
    }),
  );
}

export async function createProject(
  dataSource: DataSource,
  overrides: DeepPartial<Project> & { developerId?: string } = {},
): Promise<Project> {
  const repository = dataSource.getRepository(Project);
  const developerId = overrides.developerId ?? (await createDeveloper(dataSource)).id;
  return repository.save(
    repository.create({
      name: unique('Project'),
      city: 'Cairo',
      district: 'New Cairo',
      ...overrides,
      developerId,
    }),
  );
}

export async function createApartment(
  dataSource: DataSource,
  overrides: DeepPartial<Apartment> & { projectId?: string } = {},
): Promise<Apartment> {
  const repository = dataSource.getRepository(Apartment);
  const projectId = overrides.projectId ?? (await createProject(dataSource)).id;
  return repository.save(
    repository.create({
      unitName: unique('Unit'),
      unitNumber: unique('U'),
      price: 1_000_000,
      bedrooms: 2,
      bathrooms: 2,
      areaSqm: 100,
      status: ApartmentStatus.AVAILABLE,
      ...overrides,
      projectId,
    }),
  );
}
