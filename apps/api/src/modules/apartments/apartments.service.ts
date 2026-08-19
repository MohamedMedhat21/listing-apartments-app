import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PaginatedResponse } from '../../common/dto/response-envelope.dto';
import { buildPaginationMeta } from '../../common/pagination/build-pagination-meta';
import { ProjectsService } from '../projects/projects.service';
import { ApartmentsRepository } from './apartments.repository';
import { ApartmentDetailDto } from './dto/apartment-detail.dto';
import { ApartmentListItemDto } from './dto/apartment-list-item.dto';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { QueryApartmentsDto } from './dto/query-apartments.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';
import {
  toApartmentCreateData,
  toApartmentDetailDto,
  toApartmentListItemDto,
  toApartmentUpdateData,
} from './mappers/apartment.mapper';

/** Postgres unique_violation. Used as the safety net behind the service's
 * readable pre-checks (BR-3) — the partial unique index is the authority. */
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === '23505'
  );
}

@Injectable()
export class ApartmentsService {
  constructor(
    private readonly apartmentsRepository: ApartmentsRepository,
    private readonly projectsService: ProjectsService,
  ) {}

  async list(query: QueryApartmentsDto): Promise<PaginatedResponse<ApartmentListItemDto>> {
    // BR-14: minPrice must not exceed maxPrice.
    if (
      query.minPrice !== undefined &&
      query.maxPrice !== undefined &&
      query.minPrice > query.maxPrice
    ) {
      throw new BadRequestException('minPrice must not be greater than maxPrice');
    }

    // BR-10: a whitespace-only q is ignored, not treated as a filter. The
    // DTO's Transform already normalizes this for real HTTP requests; this
    // guards the service the same way when called directly (e.g. in tests).
    const q = query.q?.trim();

    const { items, total } = await this.apartmentsRepository.findMany({
      q: q ? q : undefined,
      projectId: query.projectId,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      bedrooms: query.bedrooms,
      status: query.status,
      sort: query.sort,
      page: query.page,
      limit: query.limit,
    });

    return {
      data: items.map(toApartmentListItemDto),
      // BR-11, BR-12: accurate meta even when data is empty (page past the
      // end, or no rows at all) — never a 404 for an out-of-range page.
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getById(id: string): Promise<ApartmentDetailDto> {
    const apartment = await this.apartmentsRepository.findByIdWithProjectAndDeveloper(id);
    if (!apartment) {
      // BR-5: a soft-deleted apartment is indistinguishable from one that
      // never existed, at the API boundary.
      throw new NotFoundException(`Apartment ${id} not found`);
    }
    return toApartmentDetailDto(apartment);
  }

  async create(dto: CreateApartmentDto): Promise<ApartmentDetailDto> {
    await this.assertProjectExists(dto.projectId);
    await this.assertUnitNumberAvailable(dto.projectId, dto.unitNumber);

    let created;
    try {
      created = await this.apartmentsRepository.createOne(toApartmentCreateData(dto));
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          `Unit number "${dto.unitNumber}" already exists in this project`,
        );
      }
      throw error;
    }

    return this.getById(created.id);
  }

  async update(id: string, dto: UpdateApartmentDto): Promise<ApartmentDetailDto> {
    const changes = toApartmentUpdateData(dto);
    if (Object.keys(changes).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    const existing = await this.apartmentsRepository.findByIdWithProjectAndDeveloper(id);
    if (!existing) {
      throw new NotFoundException(`Apartment ${id} not found`);
    }

    if (dto.projectId !== undefined) {
      await this.assertProjectExists(dto.projectId);
    }
    if (dto.projectId !== undefined || dto.unitNumber !== undefined) {
      await this.assertUnitNumberAvailable(
        dto.projectId ?? existing.projectId,
        dto.unitNumber ?? existing.unitNumber,
        id,
      );
    }

    try {
      await this.apartmentsRepository.updateOne(id, changes);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          `Unit number "${dto.unitNumber ?? existing.unitNumber}" already exists in this project`,
        );
      }
      throw error;
    }

    return this.getById(id);
  }

  async softDelete(id: string): Promise<void> {
    const existing = await this.apartmentsRepository.findByIdWithProjectAndDeveloper(id);
    if (!existing) {
      // BR-6: an already-deleted or non-existent apartment returns 404.
      throw new NotFoundException(`Apartment ${id} not found`);
    }
    await this.apartmentsRepository.softDeleteOne(id);
  }

  private async assertProjectExists(projectId: string): Promise<void> {
    const exists = await this.projectsService.existsLiveById(projectId);
    if (!exists) {
      // BR-2: a well-formed request referencing a missing/soft-deleted
      // project is a 422, not a 404 — the apartment resource itself was
      // never in question.
      throw new UnprocessableEntityException(`Project ${projectId} does not exist`);
    }
  }

  private async assertUnitNumberAvailable(
    projectId: string,
    unitNumber: string,
    excludeApartmentId?: string,
  ): Promise<void> {
    const duplicate = await this.apartmentsRepository.existsLiveByProjectAndUnitNumber(
      projectId,
      unitNumber,
      excludeApartmentId,
    );
    if (duplicate) {
      throw new ConflictException(`Unit number "${unitNumber}" already exists in this project`);
    }
  }
}
