import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { NodesService } from './nodes.service.js';

export interface NodeResponse {
  id: string;
  name: string;
  host: string;
  region: string;
}

@Controller('nodes')
@UseGuards(JwtAuthGuard)
export class NodesController {
  constructor(private readonly nodesService: NodesService) {}

  // apiUrl and apiKey are internal and never leave the server.
  @Get()
  async findAll(): Promise<NodeResponse[]> {
    const nodes = await this.nodesService.findAll();
    return nodes.map(({ id, name, host, region }) => ({
      id,
      name,
      host,
      region,
    }));
  }
}
