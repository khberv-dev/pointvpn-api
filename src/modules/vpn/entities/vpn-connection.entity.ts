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

/** A peer provisioned on a node for a user. At most one per user per node. */
@Entity('vpn_connections')
@Unique(['userId', 'nodeId'])
export class VpnConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column('uuid')
  nodeId: string;

  @ManyToOne(() => Node, { onDelete: 'CASCADE' })
  node: Node;

  /** Peer's public key on the node; identifies the peer for disconnect. */
  @Column()
  publicKey: string;

  @Column()
  address: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
