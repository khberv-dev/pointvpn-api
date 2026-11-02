import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Node } from './entities/node.entity.js';
import { NodesController } from './nodes.controller.js';
import { NodesService } from './nodes.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Node])],
  controllers: [NodesController],
  providers: [NodesService],
  exports: [NodesService],
})
export class NodesModule {}
