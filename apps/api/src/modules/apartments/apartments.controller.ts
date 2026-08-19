import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { PaginatedResponse } from '../../common/dto/response-envelope.dto';
import { ApartmentsService } from './apartments.service';
import { ApartmentDetailDto } from './dto/apartment-detail.dto';
import { ApartmentListItemDto } from './dto/apartment-list-item.dto';
import { QueryApartmentsDto } from './dto/query-apartments.dto';

@Controller('apartments')
export class ApartmentsController {
  constructor(private readonly apartmentsService: ApartmentsService) {}

  @Get()
  list(@Query() query: QueryApartmentsDto): Promise<PaginatedResponse<ApartmentListItemDto>> {
    return this.apartmentsService.list(query);
  }

  @Get(':id')
  getById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<ApartmentDetailDto> {
    return this.apartmentsService.getById(id);
  }
}
