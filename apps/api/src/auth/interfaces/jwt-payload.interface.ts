import { UserRole } from '@apartments/shared';

// Deliberately minimal: only what's needed to authorize a request. `/me`
// (7.10) re-fetches the user by id for the rest of the profile, rather than
// trusting a potentially stale email claim baked into the token.
export interface JwtPayload {
  sub: string;
  role: UserRole;
}
