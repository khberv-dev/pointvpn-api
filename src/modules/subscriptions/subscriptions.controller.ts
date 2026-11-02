import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service.js';

/** Public: no authentication required. */
@Controller('sessions/:sessionId/subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  findBySession(@Param('sessionId', ParseUUIDPipe) sessionId: string) {
    return this.subscriptionsService.findActiveBySession(sessionId);
  }
}
