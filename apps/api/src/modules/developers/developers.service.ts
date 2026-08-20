import { Injectable } from '@nestjs/common';
import { DeveloperSummaryDto } from './dto/developer-summary.dto';
import { DevelopersRepository } from './developers.repository';
import { toDeveloperSummaryDto } from './mappers/developer-summary.mapper';

@Injectable()
export class DevelopersService {
  constructor(private readonly developersRepository: DevelopersRepository) {}

  async listAll(): Promise<DeveloperSummaryDto[]> {
    const [developers, projectCountByDeveloperId] = await Promise.all([
      this.developersRepository.findAllLive(),
      this.developersRepository.countLiveProjectsByDeveloperId(),
    ]);

    return developers.map((developer) =>
      toDeveloperSummaryDto(developer, projectCountByDeveloperId.get(developer.id) ?? 0),
    );
  }
}
