import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Base columns for the three domain entities that support soft delete
 * (Developer, Project, Apartment). `User` does not extend this — see
 * docs/requirements.md section 5.4: there is no soft delete for users.
 *
 * The `!` definite-assignment assertions below are the standard TypeORM
 * pattern under `strict: true`: these fields are populated by the ORM via
 * reflection when a row is loaded, never by this class's (nonexistent)
 * constructor, so there is no real null risk for TypeScript to catch.
 */
export abstract class SoftDeletableEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt!: Date | null;
}
