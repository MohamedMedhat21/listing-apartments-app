import { ApartmentStatus } from '@apartments/shared';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { SoftDeletableEntity } from '../../../database/soft-deletable.entity';
import { numericTransformer } from '../../../database/transformers/numeric.transformer';
import { Project } from '../../projects/entities/project.entity';

/**
 * Schema, constraints, and indexes for this table are defined by hand in
 * src/database/migrations — see docs/requirements.md section 5.3. In
 * particular, the uniqueness of `(project_id, unit_number)` among live rows
 * (BR-3, BR-7) is a partial index, not a decorator-driven constraint.
 */
@Entity('apartments')
export class Apartment extends SoftDeletableEntity {
  @Column({ type: 'varchar', length: 150 })
  unitName!: string;

  @Column({ type: 'varchar', length: 50 })
  unitNumber!: string;

  @Column({ type: 'uuid' })
  projectId!: string;

  @ManyToOne(() => Project, (project) => project.apartments, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'project_id' })
  project!: Project;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'numeric', precision: 14, scale: 2, transformer: numericTransformer })
  price!: number;

  @Column({ type: 'smallint' })
  bedrooms!: number;

  @Column({ type: 'smallint' })
  bathrooms!: number;

  @Column({ type: 'numeric', precision: 8, scale: 2, transformer: numericTransformer })
  areaSqm!: number;

  @Column({ type: 'smallint', nullable: true })
  floor!: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address!: string | null;

  @Column({
    type: 'enum',
    enum: ApartmentStatus,
    enumName: 'apartment_status',
    default: ApartmentStatus.AVAILABLE,
  })
  status!: ApartmentStatus;

  @Column({ type: 'text', array: true, default: '{}' })
  amenities!: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  imageUrls!: string[];
}
