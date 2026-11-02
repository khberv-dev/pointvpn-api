import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Node } from '../../nodes/entities/node.entity.js';
import { User } from '../../users/entities/user.entity.js';

/**
 * A peer provisioned on a node. User-owned peers are limited to one per user
 * per node; anonymous peers (`userId` null) are unlimited, since Postgres
 * treats NULLs as distinct in the unique constraint.
 */
@Entity('vpn_connections')
@Unique(['userId', 'nodeId'])
export class VpnConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  userId: string | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  user: User | null;

  @Column('uuid')
  nodeId: string;

  @ManyToOne(() => Node, { onDelete: 'CASCADE' })
  node: Node;

  /**
   * Peer's public key; identifies the peer for disconnect. Unique across all
   * nodes (random 32-byte WireGuard keys don't collide in practice).
   */
  @Column({ unique: true })
  publicKey: string;

  @Column()
  address: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
