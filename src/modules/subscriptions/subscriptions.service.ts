import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionsService } from '../sessions/sessions.service.js';
import { Subscription } from './entities/subscription.entity.js';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionsRepository: Repository<Subscription>,
    private readonly sessionsService: SessionsService,
  ) {}

  /** Newest first, each with its plan. Throws 404 if the session doesn't exist. */
  async findBySession(sessionId: string): Promise<Subscription[]> {
    await this.sessionsService.findById(sessionId);
    return this.subscriptionsRepository.find({
      where: { sessionId },
      relations: { plan: true },
      order: { startDate: 'DESC' },
    });
  }
}
