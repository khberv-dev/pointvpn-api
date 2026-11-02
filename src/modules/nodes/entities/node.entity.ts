import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** A VPN server that clients connect to. */
@Entity('nodes')
export class Node {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  /** Base URL of the node's management API (server-to-node only). */
  @Column()
  apiUrl: string;

  /** Hostname or IP that clients connect to. */
  @Column()
  host: string;

  /** Secret for the node's management API. Excluded from queries by default. */
  @Column({ select: false })
  apiKey: string;

  @Column()
  region: string;
}
