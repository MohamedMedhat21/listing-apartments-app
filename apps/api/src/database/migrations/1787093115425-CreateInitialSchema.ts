import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial schema for the four entities in docs/requirements.md section 5.
 * Written by hand rather than via `migration:generate` so that the partial
 * unique indexes (BR-3, BR-7) and check constraints (BR-15) are exactly
 * right — the index is the authority per BR-3, so its SQL must not be left
 * to a diffing tool's best guess.
 */
export class CreateInitialSchema1787093115425 implements MigrationInterface {
  name = 'CreateInitialSchema1787093115425';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Required for the GIN trigram indexes used for case-insensitive
    // partial search (docs/requirements.md section 5.3, BR-8).
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

    await queryRunner.query(
      `CREATE TYPE "apartment_status" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD')`,
    );
    await queryRunner.query(`CREATE TYPE "user_role" AS ENUM ('ADMIN')`);

    await queryRunner.query(`
      CREATE TABLE "developers" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(120) NOT NULL,
        "description" text,
        "logo_url" varchar(500),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "projects" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(150) NOT NULL,
        "developer_id" uuid NOT NULL REFERENCES "developers"("id") ON DELETE RESTRICT,
        "city" varchar(100) NOT NULL,
        "district" varchar(100) NOT NULL,
        "description" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "apartments" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "unit_name" varchar(150) NOT NULL,
        "unit_number" varchar(50) NOT NULL,
        "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE RESTRICT,
        "description" text,
        "price" numeric(14,2) NOT NULL,
        "bedrooms" smallint NOT NULL,
        "bathrooms" smallint NOT NULL,
        "area_sqm" numeric(8,2) NOT NULL,
        "floor" smallint,
        "address" varchar(255),
        "status" "apartment_status" NOT NULL DEFAULT 'AVAILABLE',
        "amenities" text[] NOT NULL DEFAULT '{}',
        "image_urls" text[] NOT NULL DEFAULT '{}',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        CONSTRAINT "chk_apartments_price_positive" CHECK ("price" > 0),
        CONSTRAINT "chk_apartments_area_sqm_positive" CHECK ("area_sqm" > 0),
        CONSTRAINT "chk_apartments_bedrooms_non_negative" CHECK ("bedrooms" >= 0),
        CONSTRAINT "chk_apartments_bathrooms_non_negative" CHECK ("bathrooms" >= 0)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" varchar(255) NOT NULL UNIQUE,
        "password_hash" varchar(255) NOT NULL,
        "role" "user_role" NOT NULL DEFAULT 'ADMIN',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "chk_users_email_lowercase" CHECK ("email" = lower("email"))
      )
    `);

    // Partial unique indexes (BR-3, BR-7): a soft-deleted row's natural key
    // becomes free for reuse, so uniqueness only holds among live rows.
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_developers_name_live" ON "developers" ("name") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_projects_developer_id_name_live" ON "projects" ("developer_id", "name") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_apartments_project_id_unit_number_live" ON "apartments" ("project_id", "unit_number") WHERE "deleted_at" IS NULL`,
    );

    // GIN trigram indexes for case-insensitive partial search (BR-8).
    await queryRunner.query(
      `CREATE INDEX "idx_apartments_unit_name_trgm" ON "apartments" USING gin ("unit_name" gin_trgm_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_apartments_unit_number_trgm" ON "apartments" USING gin ("unit_number" gin_trgm_ops)`,
    );

    // btree indexes for filtering and sorting (docs/requirements.md section 5.3).
    await queryRunner.query(`CREATE INDEX "idx_apartments_price" ON "apartments" ("price")`);
    await queryRunner.query(`CREATE INDEX "idx_apartments_bedrooms" ON "apartments" ("bedrooms")`);
    await queryRunner.query(`CREATE INDEX "idx_apartments_status" ON "apartments" ("status")`);
    await queryRunner.query(
      `CREATE INDEX "idx_apartments_project_id" ON "apartments" ("project_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_apartments_created_at" ON "apartments" ("created_at" DESC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "apartments"`);
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(`DROP TABLE "developers"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "apartment_status"`);
    await queryRunner.query(`DROP TYPE "user_role"`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS pg_trgm`);
  }
}
