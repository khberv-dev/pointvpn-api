import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { RequestSubscriptionDto } from './dto/request-subscription.dto.js';
import { SubscriptionsService } from './subscriptions.service.js';

/** Public: no authentication required. */
@Controller('sessions/:sessionId/subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  findBySession(@Param('sessionId', ParseUUIDPipe) sessionId: string) {
    return this.subscriptionsService.findActiveBySession(sessionId);
  }

  /** Starts a purchase: returns the Multicard checkout URL to pay. */
  @Post()
  request(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() dto: RequestSubscriptionDto,
  ) {
    return this.subscriptionsService.request(sessionId, dto.planId);
  }
}
