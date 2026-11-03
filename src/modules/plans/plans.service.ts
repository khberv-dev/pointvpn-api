import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './entities/plan.entity.js';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan) private readonly plansRepository: Repository<Plan>,
  ) {}

  findAll(): Promise<Plan[]> {
    return this.plansRepository.find({ order: { price: 'ASC', name: 'ASC' } });
  }

  async findById(id: string): Promise<Plan> {
    const plan = await this.plansRepository.findOneBy({ id });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }
    return plan;
  }
}
