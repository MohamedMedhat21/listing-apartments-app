import { User } from '../entities/user.entity';
import { UserSummaryDto } from '../dto/auth-response.dto';

// BR-21: passwordHash never crosses this boundary.
export function toUserSummaryDto(user: User): UserSummaryDto {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}
