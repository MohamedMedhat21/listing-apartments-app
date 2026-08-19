import { ApartmentStatus, UserRole } from '@apartments/shared';
import * as bcrypt from 'bcrypt';
import { DataSource, DeepPartial } from 'typeorm';
import { User } from '../../src/auth/entities/user.entity';
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

export async function createUser(
  dataSource: DataSource,
  overrides: DeepPartial<User> & { password?: string } = {},
): Promise<{ user: User; password: string }> {
  const { password = 'correct-horse-battery-staple', ...rest } = overrides;
  const repository = dataSource.getRepository(User);
  const user = await repository.save(
    repository.create({
      email: unique('user').toLowerCase() + '@nawy.local',
      passwordHash: await bcrypt.hash(password, 4), // low cost: this is test-only data
      role: UserRole.ADMIN,
      ...rest,
    }),
  );
  return { user, password };
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
