import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiStandardErrors } from '../common/swagger/api-standard-errors.decorator';
import { LoginResponseSchema, UserSummarySchema } from '../common/swagger/api-schemas';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginResponseDto, UserSummaryDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtain an ADMIN access token (7.9)' })
  @ApiOkResponse({ type: LoginResponseSchema })
  @ApiStandardErrors(400, 401, 429)
  login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Return the authenticated user (7.10)' })
  @ApiOkResponse({ type: UserSummarySchema })
  @ApiStandardErrors(401)
  me(@CurrentUser() user: AuthenticatedUser): Promise<UserSummaryDto> {
    return this.authService.getById(user.id);
  }
}
