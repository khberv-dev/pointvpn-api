import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { SessionsService } from '../sessions/sessions.service.js';
import { Subscription } from './entities/subscription.entity.js';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionsRepository: Repository<Subscription>,
    private readonly sessionsService: SessionsService,
  ) {}

  /**
   * Active subscriptions (`endDate` in the future), newest first, each with
   * its plan. Throws 404 if the session doesn't exist.
   */
  async findActiveBySession(sessionId: string): Promise<Subscription[]> {
    await this.sessionsService.findById(sessionId);
    return this.subscriptionsRepository.find({
      where: { sessionId, endDate: MoreThan(new Date()) },
      relations: { plan: true },
      order: { startDate: 'DESC' },
    });
  }
}
