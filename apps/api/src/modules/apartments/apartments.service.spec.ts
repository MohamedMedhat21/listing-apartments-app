import { ApartmentSortOption, ApartmentStatus } from '@apartments/shared';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ApartmentsRepository } from './apartments.repository';
import { ApartmentsService } from './apartments.service';
import { Apartment } from './entities/apartment.entity';
import { QueryApartmentsDto } from './dto/query-apartments.dto';
import { Developer } from '../developers/entities/developer.entity';
import { Project } from '../projects/entities/project.entity';

function makeDeveloper(overrides: Partial<Developer> = {}): Developer {
  return {
    id: 'dev-1',
    name: 'Test Developer',
    description: null,
    logoUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  } as Developer;
}

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'project-1',
    name: 'Test Project',
    developerId: 'dev-1',
    developer: makeDeveloper(),
    city: 'Cairo',
    district: 'Maadi',
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  } as Project;
}

function makeApartment(overrides: Partial<Apartment> = {}): Apartment {
  return {
    id: 'apartment-1',
    unitName: 'Skyline A1',
    unitNumber: 'A-101',
    projectId: 'project-1',
    project: makeProject(),
    description: null,
    price: 1_000_000,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 120,
    floor: 3,
    address: null,
    status: ApartmentStatus.AVAILABLE,
    amenities: [],
    imageUrls: ['https://example.com/a.jpg'],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  } as Apartment;
}

function makeQuery(overrides: Partial<QueryApartmentsDto> = {}): QueryApartmentsDto {
  const dto = new QueryApartmentsDto();
  dto.sort = ApartmentSortOption.CREATED_AT_DESC;
  dto.page = 1;
  dto.limit = 12;
  return Object.assign(dto, overrides);
}

describe('ApartmentsService', () => {
  let service: ApartmentsService;
  let repository: jest.Mocked<ApartmentsRepository>;

  beforeEach(() => {
    repository = {
      findMany: jest.fn(),
      findByIdWithProjectAndDeveloper: jest.fn(),
    } as unknown as jest.Mocked<ApartmentsRepository>;
    service = new ApartmentsService(repository);
  });

  it('BR-8: forwards a trimmed q so the repository can OR it across unitName/unitNumber/project.name', async () => {
    repository.findMany.mockResolvedValue({ items: [], total: 0 });

    await service.list(makeQuery({ q: '  skyline  ' }));

    expect(repository.findMany).toHaveBeenCalledWith(expect.objectContaining({ q: 'skyline' }));
  });

  it('BR-9: forwards every provided filter alongside q so the repository ANDs them together', async () => {
    repository.findMany.mockResolvedValue({ items: [], total: 0 });

    await service.list(
      makeQuery({
        q: 'skyline',
        projectId: 'project-1',
        minPrice: 500_000,
        maxPrice: 2_000_000,
        bedrooms: 2,
        status: ApartmentStatus.AVAILABLE,
      }),
    );

    expect(repository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        q: 'skyline',
        projectId: 'project-1',
        minPrice: 500_000,
        maxPrice: 2_000_000,
        bedrooms: 2,
        status: ApartmentStatus.AVAILABLE,
      }),
    );
  });

  it('BR-10: treats a whitespace-only q as absent rather than a filter', async () => {
    repository.findMany.mockResolvedValue({ items: [], total: 0 });

    await service.list(makeQuery({ q: '   ' }));

    expect(repository.findMany).toHaveBeenCalledWith(expect.objectContaining({ q: undefined }));
  });

  it('BR-11: computes totalPages as ceil(total / limit)', async () => {
    repository.findMany.mockResolvedValue({ items: [], total: 25 });

    const result = await service.list(makeQuery({ page: 1, limit: 12 }));

    expect(result.meta).toEqual({ page: 1, limit: 12, total: 25, totalPages: 3 });
  });

  it('BR-11: totalPages is 0 when total is 0', async () => {
    repository.findMany.mockResolvedValue({ items: [], total: 0 });

    const result = await service.list(makeQuery({ page: 1, limit: 12 }));

    expect(result.meta.totalPages).toBe(0);
  });

  it('BR-12: a page past the end returns 200 with empty data and accurate meta, not an error', async () => {
    repository.findMany.mockResolvedValue({ items: [], total: 5 });

    const result = await service.list(makeQuery({ page: 99, limit: 12 }));

    expect(result.data).toEqual([]);
    expect(result.meta).toEqual({ page: 99, limit: 12, total: 5, totalPages: 1 });
  });

  it('BR-13: forwards the requested sort option to the repository', async () => {
    repository.findMany.mockResolvedValue({ items: [], total: 0 });

    await service.list(makeQuery({ sort: ApartmentSortOption.PRICE_ASC }));

    expect(repository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ sort: ApartmentSortOption.PRICE_ASC }),
    );
  });

  it('BR-13: defaults to createdAt:desc when the DTO does not override it', async () => {
    repository.findMany.mockResolvedValue({ items: [], total: 0 });

    await service.list(makeQuery());

    expect(repository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ sort: ApartmentSortOption.CREATED_AT_DESC }),
    );
  });

  it('BR-14: rejects minPrice greater than maxPrice with a 400', async () => {
    await expect(
      service.list(makeQuery({ minPrice: 2_000_000, maxPrice: 1_000_000 })),
    ).rejects.toThrow(BadRequestException);
    expect(repository.findMany).not.toHaveBeenCalled();
  });

  it('BR-14: allows minPrice equal to maxPrice', async () => {
    repository.findMany.mockResolvedValue({ items: [], total: 0 });

    await expect(
      service.list(makeQuery({ minPrice: 1_000_000, maxPrice: 1_000_000 })),
    ).resolves.toBeDefined();
  });

  it('BR-14: allows either bound in isolation', async () => {
    repository.findMany.mockResolvedValue({ items: [], total: 0 });

    await expect(service.list(makeQuery({ minPrice: 1_000_000 }))).resolves.toBeDefined();
    await expect(service.list(makeQuery({ maxPrice: 1_000_000 }))).resolves.toBeDefined();
  });

  it('maps repository results to ApartmentListItemDto, deriving coverImageUrl from the first image', async () => {
    repository.findMany.mockResolvedValue({ items: [makeApartment()], total: 1 });

    const result = await service.list(makeQuery());

    expect(result.data).toEqual([
      {
        id: 'apartment-1',
        unitName: 'Skyline A1',
        unitNumber: 'A-101',
        price: 1_000_000,
        bedrooms: 2,
        bathrooms: 2,
        areaSqm: 120,
        status: ApartmentStatus.AVAILABLE,
        coverImageUrl: 'https://example.com/a.jpg',
        project: { id: 'project-1', name: 'Test Project', city: 'Cairo', district: 'Maadi' },
      },
    ]);
  });

  it('coverImageUrl is null when imageUrls is empty', async () => {
    repository.findMany.mockResolvedValue({ items: [makeApartment({ imageUrls: [] })], total: 1 });

    const result = await service.list(makeQuery());

    expect(result.data[0]?.coverImageUrl).toBeNull();
  });

  it('BR-5: getById throws 404 when the repository finds no live apartment (missing or soft-deleted)', async () => {
    repository.findByIdWithProjectAndDeveloper.mockResolvedValue(null);

    await expect(service.getById('missing-id')).rejects.toThrow(NotFoundException);
  });

  it('getById maps the full detail including nested project and developer', async () => {
    repository.findByIdWithProjectAndDeveloper.mockResolvedValue(makeApartment());

    const result = await service.getById('apartment-1');

    expect(result.project.developer).toEqual({
      id: 'dev-1',
      name: 'Test Developer',
      logoUrl: null,
    });
  });
});
