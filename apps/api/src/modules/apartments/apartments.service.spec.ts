import { ApartmentSortOption, ApartmentStatus } from '@apartments/shared';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ApartmentsRepository } from './apartments.repository';
import { ApartmentsService } from './apartments.service';
import { Apartment } from './entities/apartment.entity';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { QueryApartmentsDto } from './dto/query-apartments.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';
import { Developer } from '../developers/entities/developer.entity';
import { Project } from '../projects/entities/project.entity';
import { ProjectsService } from '../projects/projects.service';

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

function makeCreateDto(overrides: Partial<CreateApartmentDto> = {}): CreateApartmentDto {
  const dto = new CreateApartmentDto();
  dto.unitName = 'Skyline A1';
  dto.unitNumber = 'A-101';
  dto.projectId = 'project-1';
  dto.price = 1_000_000;
  dto.bedrooms = 2;
  dto.bathrooms = 2;
  dto.areaSqm = 120;
  return Object.assign(dto, overrides);
}

describe('ApartmentsService', () => {
  let service: ApartmentsService;
  let repository: jest.Mocked<ApartmentsRepository>;
  let projectsService: jest.Mocked<ProjectsService>;

  beforeEach(() => {
    repository = {
      findMany: jest.fn(),
      findByIdWithProjectAndDeveloper: jest.fn(),
      existsLiveByProjectAndUnitNumber: jest.fn(),
      createOne: jest.fn(),
      updateOne: jest.fn(),
      softDeleteOne: jest.fn(),
    } as unknown as jest.Mocked<ApartmentsRepository>;
    projectsService = {
      existsLiveById: jest.fn(),
    } as unknown as jest.Mocked<ProjectsService>;
    service = new ApartmentsService(repository, projectsService);
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

  describe('create', () => {
    it('BR-2: rejects a projectId that does not reference a live project with 422', async () => {
      projectsService.existsLiveById.mockResolvedValue(false);

      await expect(service.create(makeCreateDto())).rejects.toThrow(UnprocessableEntityException);
      expect(repository.createOne).not.toHaveBeenCalled();
    });

    it('BR-3: rejects a unit number already live in the project with 409', async () => {
      projectsService.existsLiveById.mockResolvedValue(true);
      repository.existsLiveByProjectAndUnitNumber.mockResolvedValue(true);

      await expect(service.create(makeCreateDto())).rejects.toThrow(ConflictException);
      expect(repository.createOne).not.toHaveBeenCalled();
    });

    it('BR-3: translates a database unique-violation race into 409', async () => {
      projectsService.existsLiveById.mockResolvedValue(true);
      repository.existsLiveByProjectAndUnitNumber.mockResolvedValue(false);
      repository.createOne.mockRejectedValue({ code: '23505' });

      await expect(service.create(makeCreateDto())).rejects.toThrow(ConflictException);
    });

    it('BR-16: defaults status to AVAILABLE when omitted', async () => {
      projectsService.existsLiveById.mockResolvedValue(true);
      repository.existsLiveByProjectAndUnitNumber.mockResolvedValue(false);
      repository.createOne.mockResolvedValue(makeApartment({ id: 'new-id' }));
      repository.findByIdWithProjectAndDeveloper.mockResolvedValue(makeApartment({ id: 'new-id' }));

      await service.create(makeCreateDto());

      expect(repository.createOne).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ApartmentStatus.AVAILABLE,
          amenities: [],
          imageUrls: [],
        }),
      );
    });

    it('creates then returns the full detail via getById', async () => {
      projectsService.existsLiveById.mockResolvedValue(true);
      repository.existsLiveByProjectAndUnitNumber.mockResolvedValue(false);
      repository.createOne.mockResolvedValue(makeApartment({ id: 'new-id' }));
      repository.findByIdWithProjectAndDeveloper.mockResolvedValue(makeApartment({ id: 'new-id' }));

      const result = await service.create(makeCreateDto());

      expect(result.id).toBe('new-id');
      expect(repository.findByIdWithProjectAndDeveloper).toHaveBeenCalledWith('new-id');
    });
  });

  describe('update', () => {
    function makeUpdateDto(overrides: Partial<UpdateApartmentDto> = {}): UpdateApartmentDto {
      return Object.assign(new UpdateApartmentDto(), overrides);
    }

    it('rejects an empty body with 400 (at least one field required)', async () => {
      await expect(service.update('apartment-1', makeUpdateDto())).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.findByIdWithProjectAndDeveloper).not.toHaveBeenCalled();
    });

    it('BR-5/404: rejects an id the repository cannot find as live', async () => {
      repository.findByIdWithProjectAndDeveloper.mockResolvedValue(null);

      await expect(
        service.update('missing-id', makeUpdateDto({ price: 2_000_000 })),
      ).rejects.toThrow(NotFoundException);
    });

    it('does not re-check projectId/unitNumber uniqueness when neither field is being changed', async () => {
      repository.findByIdWithProjectAndDeveloper.mockResolvedValueOnce(makeApartment());
      repository.findByIdWithProjectAndDeveloper.mockResolvedValueOnce(makeApartment());

      await service.update('apartment-1', makeUpdateDto({ price: 2_000_000 }));

      expect(projectsService.existsLiveById).not.toHaveBeenCalled();
      expect(repository.existsLiveByProjectAndUnitNumber).not.toHaveBeenCalled();
      expect(repository.updateOne).toHaveBeenCalledWith('apartment-1', { price: 2_000_000 });
    });

    it('BR-2: validates a newly provided projectId with 422 when it is not live', async () => {
      repository.findByIdWithProjectAndDeveloper.mockResolvedValue(makeApartment());
      projectsService.existsLiveById.mockResolvedValue(false);

      await expect(
        service.update('apartment-1', makeUpdateDto({ projectId: 'other-project' })),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(repository.updateOne).not.toHaveBeenCalled();
    });

    it('BR-3, BR-7: excludes the apartment itself from the duplicate unit-number check', async () => {
      repository.findByIdWithProjectAndDeveloper.mockResolvedValueOnce(makeApartment());
      repository.findByIdWithProjectAndDeveloper.mockResolvedValueOnce(makeApartment());
      repository.existsLiveByProjectAndUnitNumber.mockResolvedValue(false);

      await service.update('apartment-1', makeUpdateDto({ unitNumber: 'A-102' }));

      expect(repository.existsLiveByProjectAndUnitNumber).toHaveBeenCalledWith(
        'project-1',
        'A-102',
        'apartment-1',
      );
    });

    it('BR-3: rejects a duplicate unitNumber within the (possibly new) project with 409', async () => {
      repository.findByIdWithProjectAndDeveloper.mockResolvedValue(makeApartment());
      repository.existsLiveByProjectAndUnitNumber.mockResolvedValue(true);

      await expect(
        service.update('apartment-1', makeUpdateDto({ unitNumber: 'A-102' })),
      ).rejects.toThrow(ConflictException);
    });

    it('leaves fields the client did not send untouched (a genuinely partial update)', async () => {
      repository.findByIdWithProjectAndDeveloper.mockResolvedValueOnce(makeApartment());
      repository.findByIdWithProjectAndDeveloper.mockResolvedValueOnce(makeApartment());

      await service.update('apartment-1', makeUpdateDto({ floor: 5 }));

      expect(repository.updateOne).toHaveBeenCalledWith('apartment-1', { floor: 5 });
    });
  });

  describe('softDelete', () => {
    it('BR-6: soft-deletes a live apartment', async () => {
      repository.findByIdWithProjectAndDeveloper.mockResolvedValue(makeApartment());

      await service.softDelete('apartment-1');

      expect(repository.softDeleteOne).toHaveBeenCalledWith('apartment-1');
    });

    it('BR-6: an already-deleted or non-existent apartment returns 404 rather than deleting again', async () => {
      repository.findByIdWithProjectAndDeveloper.mockResolvedValue(null);

      await expect(service.softDelete('missing-id')).rejects.toThrow(NotFoundException);
      expect(repository.softDeleteOne).not.toHaveBeenCalled();
    });
  });
});
