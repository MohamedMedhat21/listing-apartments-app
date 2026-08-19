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
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PaginatedResponse } from '../../common/dto/response-envelope.dto';
import { ApartmentsService } from './apartments.service';
import { ApartmentDetailDto } from './dto/apartment-detail.dto';
import { ApartmentListItemDto } from './dto/apartment-list-item.dto';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { QueryApartmentsDto } from './dto/query-apartments.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';

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

  // BR-18: writes require an ADMIN token. JwtAuthGuard runs first (401 for a
  // missing/invalid token) and only then does RolesGuard check the role
  // (403), matching BR-19's precedence.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateApartmentDto): Promise<ApartmentDetailDto> {
    return this.apartmentsService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
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
  async remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<void> {
    await this.apartmentsService.softDelete(id);
  }
}
