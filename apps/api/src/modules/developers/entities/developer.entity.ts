import { Column, Entity, OneToMany } from 'typeorm';
import { SoftDeletableEntity } from '../../../database/soft-deletable.entity';
import { Project } from '../../projects/entities/project.entity';

/**
 * Schema, constraints, and indexes for this table are defined by hand in
 * src/database/migrations (not by `synchronize` or `migration:generate`) —
 * see docs/requirements.md section 5.1. In particular, the uniqueness of
 * `name` among live rows is a partial index, which is not expressible
 * through a `@Column({ unique: true })` decorator.
 */
@Entity('developers')
export class Developer extends SoftDeletableEntity {
  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logoUrl!: string | null;

  @OneToMany(() => Project, (project) => project.developer)
  projects?: Project[];
}
