import { Controller, Get } from '@nestjs/common';
import { CollectionResponse } from '../../common/dto/response-envelope.dto';
import { ProjectSummaryDto } from './dto/project-summary.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async list(): Promise<CollectionResponse<ProjectSummaryDto>> {
    return { data: await this.projectsService.listAll() };
  }
}
