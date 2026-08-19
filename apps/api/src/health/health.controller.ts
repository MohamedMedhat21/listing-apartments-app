import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { ApiStandardErrors } from '../common/swagger/api-standard-errors.decorator';
import { HealthCheckResponseSchema } from '../common/swagger/api-schemas';
import { DatabaseHealthIndicator } from './database.health-indicator';

/** docs/requirements.md section 7.11 — outside the `/api/v1` prefix. */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly database: DatabaseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Process and database health (Docker healthchecks)' })
  @ApiOkResponse({ type: HealthCheckResponseSchema })
  @ApiStandardErrors(503)
  check() {
    return this.health.check([() => this.database.pingCheck('database')]);
  }
}
