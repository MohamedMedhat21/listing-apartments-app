import { ApartmentSortOption, ApartmentStatus } from '@apartments/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Apartment } from './entities/apartment.entity';

export interface ApartmentListFilters {
  q?: string;
  projectId?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  status?: ApartmentStatus;
  sort: ApartmentSortOption;
  page: number;
  limit: number;
}

export interface ApartmentListResult {
  items: Apartment[];
  total: number;
}

const SORT_BY_OPTION: Record<ApartmentSortOption, { column: string; direction: 'ASC' | 'DESC' }> = {
  [ApartmentSortOption.CREATED_AT_DESC]: { column: 'apartment.createdAt', direction: 'DESC' },
  [ApartmentSortOption.CREATED_AT_ASC]: { column: 'apartment.createdAt', direction: 'ASC' },
  [ApartmentSortOption.PRICE_ASC]: { column: 'apartment.price', direction: 'ASC' },
  [ApartmentSortOption.PRICE_DESC]: { column: 'apartment.price', direction: 'DESC' },
  [ApartmentSortOption.AREA_SQM_ASC]: { column: 'apartment.areaSqm', direction: 'ASC' },
  [ApartmentSortOption.AREA_SQM_DESC]: { column: 'apartment.areaSqm', direction: 'DESC' },
};

@Injectable()
export class ApartmentsRepository {
  constructor(@InjectRepository(Apartment) private readonly repository: Repository<Apartment>) {}

  /** BR-5, BR-8, BR-9: excludes soft-deleted rows, ORs `q` across three
   * fields, ANDs every other filter, sorted and paginated per BR-11/BR-13. */
  async findMany(filters: ApartmentListFilters): Promise<ApartmentListResult> {
    const qb = this.repository
      .createQueryBuilder('apartment')
      .leftJoinAndSelect('apartment.project', 'project')
      .where('apartment.deletedAt IS NULL')
      // TypeORM already excludes a soft-deleted `project` from the join
      // itself (both entities have @DeleteDateColumn); when that happens the
      // joined columns are all NULL, so filtering on `project.deletedAt IS
      // NULL` would wrongly let the row through (NULL IS NULL is true).
      // `project.id IS NOT NULL` correctly requires the join to have matched.
      .andWhere('project.id IS NOT NULL');

    if (filters.q) {
      qb.andWhere(
        '(apartment.unitName ILIKE :q OR apartment.unitNumber ILIKE :q OR project.name ILIKE :q)',
        {
          q: `%${filters.q}%`,
        },
      );
    }
    if (filters.projectId) {
      qb.andWhere('apartment.projectId = :projectId', { projectId: filters.projectId });
    }
    if (filters.minPrice !== undefined) {
      qb.andWhere('apartment.price >= :minPrice', { minPrice: filters.minPrice });
    }
    if (filters.maxPrice !== undefined) {
      qb.andWhere('apartment.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }
    if (filters.bedrooms !== undefined) {
      qb.andWhere('apartment.bedrooms = :bedrooms', { bedrooms: filters.bedrooms });
    }
    if (filters.status) {
      qb.andWhere('apartment.status = :status', { status: filters.status });
    }

    const { column, direction } = SORT_BY_OPTION[filters.sort];
    qb.orderBy(column, direction);
    // Stable tiebreaker so paginated pages don't reshuffle when the primary
    // sort column has duplicate values across pages.
    qb.addOrderBy('apartment.id', 'ASC');

    qb.skip((filters.page - 1) * filters.limit).take(filters.limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  /** BR-5: excludes a soft-deleted apartment, or one whose parent project or
   * developer is soft-deleted. */
  async findByIdWithProjectAndDeveloper(id: string): Promise<Apartment | null> {
    return (
      this.repository
        .createQueryBuilder('apartment')
        .leftJoinAndSelect('apartment.project', 'project')
        .leftJoinAndSelect('project.developer', 'developer')
        .where('apartment.id = :id', { id })
        .andWhere('apartment.deletedAt IS NULL')
        // See the comment in findMany(): join-based deletedAt checks are
        // unreliable once TypeORM has already excluded the soft-deleted row
        // from the join; require the join to have actually matched instead.
        .andWhere('project.id IS NOT NULL')
        .andWhere('developer.id IS NOT NULL')
        .getOne()
    );
  }
}
