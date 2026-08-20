import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// BR-19: a missing or invalid (malformed, unsigned, or expired) token
// results in a 401 — Passport's default AuthGuard behavior on strategy
// failure, unchanged here.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
