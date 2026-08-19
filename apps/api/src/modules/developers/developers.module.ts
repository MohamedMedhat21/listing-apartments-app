import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevelopersController } from './developers.controller';
import { DevelopersRepository } from './developers.repository';
import { DevelopersService } from './developers.service';
import { Developer } from './entities/developer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Developer])],
  controllers: [DevelopersController],
  providers: [DevelopersService, DevelopersRepository],
  exports: [DevelopersService],
})
export class DevelopersModule {}
