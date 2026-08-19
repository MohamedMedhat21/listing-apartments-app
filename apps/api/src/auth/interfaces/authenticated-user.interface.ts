import { UserRole } from '@apartments/shared';

// Shape attached to `request.user` by JwtStrategy.validate() once a token
// passes JwtAuthGuard.
export interface AuthenticatedUser {
  id: string;
  role: UserRole;
}
