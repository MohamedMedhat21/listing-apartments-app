import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

// Populated by class-transformer via the global ValidationPipe, never by
// this class's (nonexistent) constructor — same pattern as
// QueryApartmentsDto, so the `!` here carries no real null risk.
export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
