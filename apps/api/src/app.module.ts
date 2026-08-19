import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { ApartmentsModule } from './modules/apartments/apartments.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { DevelopersModule } from './modules/developers/developers.module';

@Module({
  imports: [AppConfigModule, DatabaseModule, ApartmentsModule, ProjectsModule, DevelopersModule],
})
export class AppModule {}
