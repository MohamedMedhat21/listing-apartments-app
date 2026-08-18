import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { SoftDeletableEntity } from '../../../database/soft-deletable.entity';
import { Developer } from '../../developers/entities/developer.entity';
import { Apartment } from '../../apartments/entities/apartment.entity';

/**
 * Schema, constraints, and indexes for this table are defined by hand in
 * src/database/migrations — see docs/requirements.md section 5.2. The
 * uniqueness of `(developer_id, name)` among live rows is a partial index,
 * not a decorator-driven constraint.
 */
@Entity('projects')
export class Project extends SoftDeletableEntity {
  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'uuid' })
  developerId!: string;

  @ManyToOne(() => Developer, (developer) => developer.projects, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'developer_id' })
  developer!: Developer;

  @Column({ type: 'varchar', length: 100 })
  city!: string;

  @Column({ type: 'varchar', length: 100 })
  district!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @OneToMany(() => Apartment, (apartment) => apartment.project)
  apartments?: Apartment[];
}
