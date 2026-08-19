import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CollectionResponse } from '../../common/dto/response-envelope.dto';
import { DeveloperCollectionResponseSchema } from '../../common/swagger/api-schemas';
import { DeveloperSummaryDto } from './dto/developer-summary.dto';
import { DevelopersService } from './developers.service';

@ApiTags('developers')
@Controller('developers')
export class DevelopersController {
  constructor(private readonly developersService: DevelopersService) {}

  @Get()
  @ApiOperation({ summary: 'List all live developers (7.8)' })
  @ApiOkResponse({ type: DeveloperCollectionResponseSchema })
  async list(): Promise<CollectionResponse<DeveloperSummaryDto>> {
    return { data: await this.developersService.listAll() };
  }
}
