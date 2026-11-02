import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Plan } from '../../plans/entities/plan.entity.js';
import { Session } from '../../sessions/entities/session.entity.js';

/** A session's access to a plan for a period of time. */
@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  planId: string;

  // RESTRICT: a plan with subscriptions can't be deleted (keeps billing history).
  @ManyToOne(() => Plan, { onDelete: 'RESTRICT' })
  plan: Plan;

  @Column('uuid')
  sessionId: string;

  @ManyToOne(() => Session, { onDelete: 'CASCADE' })
  session: Session;

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'timestamptz' })
  endDate: Date;
}
