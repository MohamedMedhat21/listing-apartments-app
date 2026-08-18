import * as path from 'path';
import { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Apartment } from '../modules/apartments/entities/apartment.entity';
import { Developer } from '../modules/developers/entities/developer.entity';
import { Project } from '../modules/projects/entities/project.entity';
import { User } from '../auth/entities/user.entity';

export interface DatabaseConnectionConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  logging: boolean;
}

/**
 * Single place both the running app (via `DatabaseModule`) and the TypeORM
 * CLI (via `data-source.ts`) build their `DataSourceOptions` from, so the
 * two never drift apart. `synchronize` is permanently `false` — every
 * schema change goes through a migration in `./migrations`.
 */
export function buildDataSourceOptions(config: DatabaseConnectionConfig): DataSourceOptions {
  return {
    type: 'postgres',
    host: config.host,
    port: config.port,
    database: config.database,
    username: config.username,
    password: config.password,
    namingStrategy: new SnakeNamingStrategy(),
    entities: [Developer, Project, Apartment, User],
    migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],
    synchronize: false,
    logging: config.logging,
  };
}
