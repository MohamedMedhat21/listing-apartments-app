import { UserRole } from '@apartments/shared';

export interface UserSummaryDto {
  id: string;
  email: string;
  role: UserRole;
}

// docs/requirements.md section 7.9. `expiresIn` is in seconds.
export interface LoginResponseDto {
  accessToken: string;
  expiresIn: number;
  user: UserSummaryDto;
}
