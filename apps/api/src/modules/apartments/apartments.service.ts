import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaginatedResponse } from '../../common/dto/response-envelope.dto';
import { buildPaginationMeta } from '../../common/pagination/build-pagination-meta';
import { ApartmentsRepository } from './apartments.repository';
import { ApartmentDetailDto } from './dto/apartment-detail.dto';
import { ApartmentListItemDto } from './dto/apartment-list-item.dto';
import { QueryApartmentsDto } from './dto/query-apartments.dto';
import { toApartmentDetailDto, toApartmentListItemDto } from './mappers/apartment.mapper';

@Injectable()
export class ApartmentsService {
  constructor(private readonly apartmentsRepository: ApartmentsRepository) {}

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
}
