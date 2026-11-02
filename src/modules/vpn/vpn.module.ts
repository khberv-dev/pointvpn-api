import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NodesModule } from '../nodes/nodes.module.js';
import { VpnConnection } from './entities/vpn-connection.entity.js';
import { NodeApiClient } from './node-api.client.js';
import { VpnController } from './vpn.controller.js';
import { VpnService } from './vpn.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([VpnConnection]), NodesModule],
  controllers: [VpnController],
  providers: [VpnService, NodeApiClient],
})
export class VpnModule {}
