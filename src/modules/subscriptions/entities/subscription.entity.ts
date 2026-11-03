import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Plan } from '../../plans/entities/plan.entity.js';
import { Session } from '../../sessions/entities/session.entity.js';

/**
 * A session's access to a plan. Created inactive with no dates when the
 * session requests it; activated by a successful payment of its invoice.
 */
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

  /** True once paid. */
  @Column({ default: false })
  isActive: boolean;

  /** Set when paid. */
  @Column({ type: 'timestamptz', nullable: true })
  startDate: Date | null;

  /** Set when paid. */
  @Column({ type: 'timestamptz', nullable: true })
  endDate: Date | null;
}
