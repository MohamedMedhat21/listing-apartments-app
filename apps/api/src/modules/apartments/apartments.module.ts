import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from '../projects/projects.module';
import { ApartmentsController } from './apartments.controller';
import { ApartmentsRepository } from './apartments.repository';
import { ApartmentsService } from './apartments.service';
import { Apartment } from './entities/apartment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Apartment]), ProjectsModule],
  controllers: [ApartmentsController],
  providers: [ApartmentsService, ApartmentsRepository],
  exports: [ApartmentsService],
})
export class ApartmentsModule {}
