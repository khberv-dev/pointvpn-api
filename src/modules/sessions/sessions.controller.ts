import { Body, Controller, Post } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto.js';
import { SessionsService } from './sessions.service.js';

/** Public: no authentication required. */
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  create(@Body() dto: CreateSessionDto) {
    return this.sessionsService.create(dto);
  }
}
