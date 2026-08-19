import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CollectionResponse } from '../../common/dto/response-envelope.dto';
import { ProjectCollectionResponseSchema } from '../../common/swagger/api-schemas';
import { ProjectSummaryDto } from './dto/project-summary.dto';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List all live projects for the filter dropdown (7.7)' })
  @ApiOkResponse({ type: ProjectCollectionResponseSchema })
  async list(): Promise<CollectionResponse<ProjectSummaryDto>> {
    return { data: await this.projectsService.listAll() };
  }
}
