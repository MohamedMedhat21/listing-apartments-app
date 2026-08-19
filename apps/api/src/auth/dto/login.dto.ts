import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

// Populated by class-transformer via the global ValidationPipe, never by
// this class's (nonexistent) constructor — same pattern as
// QueryApartmentsDto, so the `!` here carries no real null risk.
export class LoginDto {
  @ApiProperty({ example: 'admin@nawy.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ format: 'password', example: 'correct-horse-battery-staple' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
