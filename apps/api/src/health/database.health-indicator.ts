import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { DataSource } from 'typeorm';

/**
 * Database connectivity check for `/health` (7.11). Uses the app's existing
 * TypeORM `DataSource` directly rather than Terminus's
 * `TypeOrmHealthIndicator`, which performs a separate `@nestjs/typeorm`
 * package-resolution check that fails in this npm-workspaces layout even
 * though TypeORM is configured and running.
 */
@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(private readonly dataSource: DataSource) {
    super();
  }

  async pingCheck(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.dataSource.query('SELECT 1');
      return this.getStatus(key, true);
    } catch {
      throw new HealthCheckError(
        'database check failed',
        this.getStatus(key, false, { message: 'Database is unreachable' }),
      );
    }
  }
}
