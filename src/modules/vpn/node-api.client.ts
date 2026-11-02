import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import type { Node } from '../nodes/entities/node.entity.js';

const REQUEST_TIMEOUT_MS = 10_000;

/** Payload returned by a node's `POST /peers`, passed to the client as-is. */
export interface NodeConnectResponse {
  publicKey: string;
  address: string;
  config: Record<string, unknown>;
}

/** Talks to a node's management API (`node.apiUrl`, auth via `x-api-key`). */
@Injectable()
export class NodeApiClient {
  private readonly logger = new Logger(NodeApiClient.name);

  /** Creates a peer: `POST /peers`. */
  async connect(node: Node): Promise<NodeConnectResponse> {
    const response = await this.request(node, 'POST', 'peers');
    const body = (await response.json().catch(() => null)) as unknown;

    if (!isConnectResponse(body)) {
      this.logger.error(`Node ${node.id} returned an invalid connect payload`);
      throw new BadGatewayException('VPN node returned an invalid response');
    }

    return body;
  }

  /** Removes a peer: `DELETE /peers/:publicKey`. */
  async disconnect(node: Node, publicKey: string): Promise<void> {
    // Keys are base64 and contain `+`, `/` and `=`.
    await this.request(
      node,
      'DELETE',
      `peers/${encodeURIComponent(publicKey)}`,
    );
  }

  private async request(
    node: Node,
    method: 'POST' | 'DELETE',
    path: string,
    body?: unknown,
  ): Promise<Response> {
    const baseUrl = node.apiUrl.endsWith('/') ? node.apiUrl : `${node.apiUrl}/`;
    let response: Response;

    try {
      response = await fetch(new URL(path, baseUrl), {
        method,
        headers: {
          'x-api-key': node.apiKey,
          ...(body !== undefined && { 'content-type': 'application/json' }),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      this.logger.error(
        `Node ${node.id} ${method} /${path} failed: ${(error as Error).message}`,
      );
      throw new BadGatewayException('VPN node is unavailable');
    }

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      this.logger.error(
        `Node ${node.id} ${method} /${path} responded ${response.status}: ${text.slice(0, 500)}`,
      );
      throw new BadGatewayException('VPN node rejected the request');
    }

    return response;
  }
}

function isConnectResponse(value: unknown): value is NodeConnectResponse {
  const v = value as Partial<NodeConnectResponse> | null;
  return (
    typeof v?.publicKey === 'string' &&
    typeof v.address === 'string' &&
    typeof v.config === 'object' &&
    v.config !== null
  );
}
