import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest } from '../guards/jwt-auth.guard.js';

/** Id of the authenticated user. Use together with `JwtAuthGuard`. */
export const CurrentUserId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().user.sub,
);
