import { Controller, Get } from '@nestjs/common';
import { CollectionResponse } from '../../common/dto/response-envelope.dto';
import { DeveloperSummaryDto } from './dto/developer-summary.dto';
import { DevelopersService } from './developers.service';

@Controller('developers')
export class DevelopersController {
  constructor(private readonly developersService: DevelopersService) {}

  @Get()
  async list(): Promise<CollectionResponse<DeveloperSummaryDto>> {
    return { data: await this.developersService.listAll() };
  }
}
