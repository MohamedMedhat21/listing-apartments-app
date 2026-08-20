import { UserRole } from '@apartments/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ApiStandardErrors } from '../../common/swagger/api-standard-errors.decorator';
import {
  ApartmentDetailSchema,
  PaginatedApartmentListResponseSchema,
} from '../../common/swagger/api-schemas';
import { PaginatedResponse } from '../../common/dto/response-envelope.dto';
import { ApartmentsService } from './apartments.service';
import { ApartmentDetailDto } from './dto/apartment-detail.dto';
import { ApartmentListItemDto } from './dto/apartment-list-item.dto';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { QueryApartmentsDto } from './dto/query-apartments.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';

@ApiTags('apartments')
@Controller('apartments')
export class ApartmentsController {
  constructor(private readonly apartmentsService: ApartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List apartments with search, filters, and pagination (7.2)' })
  @ApiOkResponse({ type: PaginatedApartmentListResponseSchema })
  @ApiStandardErrors(400)
  list(@Query() query: QueryApartmentsDto): Promise<PaginatedResponse<ApartmentListItemDto>> {
    return this.apartmentsService.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get apartment details (7.3)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: ApartmentDetailSchema })
  @ApiStandardErrors(400, 404)
  getById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<ApartmentDetailDto> {
    return this.apartmentsService.getById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create an apartment (7.4, ADMIN only)' })
  @ApiCreatedResponse({ type: ApartmentDetailSchema })
  @ApiStandardErrors(400, 401, 403, 409, 422)
  create(@Body() dto: CreateApartmentDto): Promise<ApartmentDetailDto> {
    return this.apartmentsService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Partially update an apartment (7.5, ADMIN only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: ApartmentDetailSchema })
  @ApiStandardErrors(400, 401, 403, 404, 409, 422)
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateApartmentDto,
  ): Promise<ApartmentDetailDto> {
    return this.apartmentsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Soft-delete an apartment (7.6, ADMIN only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Apartment soft-deleted (BR-6)' })
  @ApiStandardErrors(401, 403, 404)
  async remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<void> {
    await this.apartmentsService.softDelete(id);
  }
}
