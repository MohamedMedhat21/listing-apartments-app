import { Injectable } from '@nestjs/common';
import { ProjectSummaryDto } from './dto/project-summary.dto';
import { toProjectSummaryDto } from './mappers/project-summary.mapper';
import { ProjectsRepository } from './projects.repository';

@Injectable()
export class ProjectsService {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  async listAll(): Promise<ProjectSummaryDto[]> {
    const [projects, apartmentCountByProjectId] = await Promise.all([
      this.projectsRepository.findAllLive(),
      this.projectsRepository.countLiveApartmentsByProjectId(),
    ]);

    return projects.map((project) =>
      toProjectSummaryDto(project, apartmentCountByProjectId.get(project.id) ?? 0),
    );
  }
}
