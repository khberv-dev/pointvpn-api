import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum SessionPlatform {
  Android = 'android',
  Ios = 'ios',
}

/** A client app install (device). */
@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: SessionPlatform })
  platform: SessionPlatform;

  /** Firebase Cloud Messaging registration token for push notifications. */
  @Column()
  fcmToken: string;

  @Column()
  deviceName: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
