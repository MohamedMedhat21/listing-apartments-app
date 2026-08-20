import { Developer } from '../entities/developer.entity';
import { DeveloperSummaryDto } from '../dto/developer-summary.dto';

export function toDeveloperSummaryDto(
  developer: Developer,
  projectCount: number,
): DeveloperSummaryDto {
  return {
    id: developer.id,
    name: developer.name,
    logoUrl: developer.logoUrl,
    projectCount,
  };
}
