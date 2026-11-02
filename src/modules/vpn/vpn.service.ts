import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Node } from '../nodes/entities/node.entity.js';
import { NodesService } from '../nodes/nodes.service.js';
import { VpnConnection } from './entities/vpn-connection.entity.js';
import { NodeApiClient, NodeConnectResponse } from './node-api.client.js';

@Injectable()
export class VpnService {
  constructor(
    @InjectRepository(VpnConnection)
    private readonly connectionsRepository: Repository<VpnConnection>,
    private readonly nodesService: NodesService,
    private readonly nodeApi: NodeApiClient,
  ) {}

  /**
   * Provisions a peer for the user on the node and returns the node's payload.
   * An existing peer for the same user and node is removed first.
   */
  async connect(userId: string, nodeId: string): Promise<NodeConnectResponse> {
    const node = await this.getNode(nodeId);

    const existing = await this.connectionsRepository.findOneBy({
      userId,
      nodeId,
    });
    if (existing) {
      await this.nodeApi.disconnect(node, existing.publicKey);
    }

    const peer = await this.nodeApi.connect(node);

    await this.connectionsRepository.upsert(
      { userId, nodeId, publicKey: peer.publicKey, address: peer.address },
      ['userId', 'nodeId'],
    );

    return peer;
  }

  async disconnect(userId: string, nodeId: string): Promise<void> {
    const node = await this.getNode(nodeId);
    const connection = await this.connectionsRepository.findOneBy({
      userId,
      nodeId,
    });
    if (!connection) {
      throw new NotFoundException('Not connected to this node');
    }

    await this.nodeApi.disconnect(node, connection.publicKey);
    await this.connectionsRepository.delete({ id: connection.id });
  }

  private async getNode(nodeId: string): Promise<Node> {
    const node = await this.nodesService.findByIdWithApiKey(nodeId);
    if (!node) {
      throw new NotFoundException('Node not found');
    }
    return node;
  }
}
