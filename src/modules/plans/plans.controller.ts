import { Controller, Get } from '@nestjs/common';
import { PlansService } from './plans.service.js';

/** Public: no authentication required. */
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  findAll() {
    return this.plansService.findAll();
  }
}
