import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Postgres returns `numeric` as a string; expose it as a number in code. */
const numericToNumber = {
  to: (value: number) => value,
  from: (value: string | null) => (value === null ? null : Number(value)),
};

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('numeric', { precision: 12, scale: 2, transformer: numericToNumber })
  price: number;
}
