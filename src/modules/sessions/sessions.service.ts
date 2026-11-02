import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSessionDto } from './dto/create-session.dto.js';
import { Session } from './entities/session.entity.js';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
  ) {}

  create(dto: CreateSessionDto): Promise<Session> {
    return this.sessionsRepository.save(this.sessionsRepository.create(dto));
  }

  async findById(id: string): Promise<Session> {
    const session = await this.sessionsRepository.findOneBy({ id });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return session;
  }
}
