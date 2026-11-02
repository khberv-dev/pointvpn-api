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
   * Provisions a peer on the node and returns the node's payload.
   * For a user, an existing peer on the same node is replaced; anonymous
   * callers (`userId` null) get a new peer every time.
   */
  async connect(
    userId: string | null,
    nodeId: string,
  ): Promise<NodeConnectResponse> {
    const node = await this.getNode(nodeId);

    if (userId) {
      const existing = await this.connectionsRepository.findOneBy({
        userId,
        nodeId,
      });
      if (existing) {
        await this.nodeApi.disconnect(node, existing.publicKey);
      }
    }

    const peer = await this.nodeApi.connect(node);
    const row = {
      userId,
      nodeId,
      publicKey: peer.publicKey,
      address: peer.address,
    };

    if (userId) {
      await this.connectionsRepository.upsert(row, ['userId', 'nodeId']);
    } else {
      await this.connectionsRepository.insert(row);
    }

    return peer;
  }

  /**
   * Removes the peer with this public key from its node. Anonymous peers can be
   * removed by anyone; user-owned ones only by their owner.
   */
  async disconnect(userId: string | null, publicKey: string): Promise<void> {
    const connection = await this.connectionsRepository.findOneBy({
      publicKey,
    });

    // A user-owned peer is reported as missing to anyone else, so public keys
    // can't be used to probe or drop other users' connections.
    if (!connection || (connection.userId && connection.userId !== userId)) {
      throw new NotFoundException('Connection not found');
    }

    const node = await this.getNode(connection.nodeId);
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
