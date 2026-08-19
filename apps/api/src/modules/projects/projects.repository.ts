import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Apartment } from '../apartments/entities/apartment.entity';
import { Project } from './entities/project.entity';

interface ApartmentCountRow {
  projectId: string;
  count: string;
}

@Injectable()
export class ProjectsRepository {
  constructor(@InjectRepository(Project) private readonly repository: Repository<Project>) {}

  /** BR-5: excludes a soft-deleted project or one whose developer is
   * soft-deleted. */
  async findAllLive(): Promise<Project[]> {
    return (
      this.repository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.developer', 'developer')
        .where('project.deletedAt IS NULL')
        // TypeORM already excludes a soft-deleted `developer` from the join
        // itself; a join-level `deletedAt IS NULL` check would be a no-op
        // (NULL IS NULL is true), so require the join to have matched instead.
        .andWhere('developer.id IS NOT NULL')
        .orderBy('project.name', 'ASC')
        .getMany()
    );
  }

  /** Live (non-soft-deleted) apartment count per project, for
   * `apartmentCount` in the 7.7 response. Queries the apartments table
   * directly rather than via ApartmentsRepository, since this count is
   * specific to assembling the projects listing. */
  async countLiveApartmentsByProjectId(): Promise<Map<string, number>> {
    const rows = await this.repository.manager
      .createQueryBuilder(Apartment, 'apartment')
      .select('apartment.projectId', 'projectId')
      .addSelect('COUNT(*)', 'count')
      .where('apartment.deletedAt IS NULL')
      .groupBy('apartment.projectId')
      .getRawMany<ApartmentCountRow>();

    return new Map(rows.map((row) => [row.projectId, Number(row.count)]));
  }
}
