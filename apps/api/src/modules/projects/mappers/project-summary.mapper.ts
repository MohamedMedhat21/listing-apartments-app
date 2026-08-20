import { Project } from '../entities/project.entity';
import { ProjectSummaryDto } from '../dto/project-summary.dto';

export function toProjectSummaryDto(project: Project, apartmentCount: number): ProjectSummaryDto {
  const developer = project.developer;
  if (!developer) {
    throw new Error('toProjectSummaryDto: project.developer must be loaded by the repository');
  }

  return {
    id: project.id,
    name: project.name,
    city: project.city,
    district: project.district,
    developer: { id: developer.id, name: developer.name },
    apartmentCount,
  };
}
