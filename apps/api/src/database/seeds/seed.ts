import * as bcrypt from 'bcrypt';
import { UserRole } from '@apartments/shared';
import { User } from '../../auth/entities/user.entity';
import { Apartment } from '../../modules/apartments/entities/apartment.entity';
import { Developer } from '../../modules/developers/entities/developer.entity';
import { Project } from '../../modules/projects/entities/project.entity';
import AppDataSource, { env } from '../data-source';
import { developersSeedData } from './data/developers.seed-data';
import { projectsSeedData } from './data/projects.seed-data';
import { generateApartmentsForProject } from './generate-apartments';

const BCRYPT_COST = 12;
const APARTMENTS_PER_PROJECT = 4;

async function seedDevelopers(dataSource: typeof AppDataSource): Promise<Map<string, string>> {
  const repository = dataSource.getRepository(Developer);
  const idByName = new Map<string, string>();

  for (const data of developersSeedData) {
    const existing = await repository.findOne({ where: { name: data.name } });
    if (existing) {
      idByName.set(data.name, existing.id);
      continue;
    }
    const created = await repository.save(repository.create(data));
    idByName.set(data.name, created.id);
  }

  return idByName;
}

async function seedProjects(
  dataSource: typeof AppDataSource,
  developerIdByName: Map<string, string>,
): Promise<Map<string, string>> {
  const repository = dataSource.getRepository(Project);
  const idByKey = new Map<string, string>();

  for (const data of projectsSeedData) {
    const developerId = developerIdByName.get(data.developerName);
    if (!developerId) {
      throw new Error(
        `seed: unknown developer "${data.developerName}" referenced by project "${data.name}"`,
      );
    }

    const key = `${data.developerName}::${data.name}`;
    const existing = await repository.findOne({ where: { developerId, name: data.name } });
    if (existing) {
      idByKey.set(key, existing.id);
      continue;
    }

    const created = await repository.save(
      repository.create({
        name: data.name,
        developerId,
        city: data.city,
        district: data.district,
        description: data.description,
      }),
    );
    idByKey.set(key, created.id);
  }

  return idByKey;
}

async function seedApartments(
  dataSource: typeof AppDataSource,
  projectIdByKey: Map<string, string>,
): Promise<number> {
  const repository = dataSource.getRepository(Apartment);
  let createdCount = 0;

  for (const projectData of projectsSeedData) {
    const key = `${projectData.developerName}::${projectData.name}`;
    const projectId = projectIdByKey.get(key);
    if (!projectId) {
      throw new Error(`seed: unknown project "${key}" while seeding apartments`);
    }

    const apartments = generateApartmentsForProject(projectData.name, APARTMENTS_PER_PROJECT);
    for (const apartment of apartments) {
      const existing = await repository.findOne({
        where: { projectId, unitNumber: apartment.unitNumber },
      });
      if (existing) {
        continue;
      }
      await repository.save(repository.create({ ...apartment, projectId }));
      createdCount += 1;
    }
  }

  return createdCount;
}

async function seedAdminUser(dataSource: typeof AppDataSource): Promise<void> {
  const repository = dataSource.getRepository(User);
  const email = env.ADMIN_EMAIL.toLowerCase();

  const existing = await repository.findOne({ where: { email } });
  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, BCRYPT_COST);
  await repository.save(repository.create({ email, passwordHash, role: UserRole.ADMIN }));
}

async function run(): Promise<void> {
  await AppDataSource.initialize();

  try {
    const developerIdByName = await seedDevelopers(AppDataSource);
    const projectIdByKey = await seedProjects(AppDataSource, developerIdByName);
    const createdApartments = await seedApartments(AppDataSource, projectIdByKey);
    await seedAdminUser(AppDataSource);

    // eslint-disable-next-line no-console
    console.log(
      `Seed complete: ${developerIdByName.size} developers, ${projectIdByKey.size} projects, ` +
        `${createdApartments} new apartments this run, admin user ensured.`,
    );
  } finally {
    await AppDataSource.destroy();
  }
}

run().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
