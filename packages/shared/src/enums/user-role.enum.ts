// Mirrors the PostgreSQL enum `user_role` (see docs/requirements.md section 5.4).
// Currently only ADMIN exists; the enum still exists in the schema for future-proofing.
export enum UserRole {
  ADMIN = 'ADMIN',
}
