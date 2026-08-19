import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { Developer } from './entities/developer.entity';

interface ProjectCountRow {
  developerId: string;
  count: string;
}

@Injectable()
export class DevelopersRepository {
  constructor(@InjectRepository(Developer) private readonly repository: Repository<Developer>) {}

  /** BR-5: excludes soft-deleted developers. */
  async findAllLive(): Promise<Developer[]> {
    return this.repository
      .createQueryBuilder('developer')
      .where('developer.deletedAt IS NULL')
      .orderBy('developer.name', 'ASC')
      .getMany();
  }

  /** Live (non-soft-deleted) project count per developer, for
   * `projectCount` in the 7.8 response. */
  async countLiveProjectsByDeveloperId(): Promise<Map<string, number>> {
    const rows = await this.repository.manager
      .createQueryBuilder(Project, 'project')
      .select('project.developerId', 'developerId')
      .addSelect('COUNT(*)', 'count')
      .where('project.deletedAt IS NULL')
      .groupBy('project.developerId')
      .getRawMany<ProjectCountRow>();

    return new Map(rows.map((row) => [row.developerId, Number(row.count)]));
  }
}
