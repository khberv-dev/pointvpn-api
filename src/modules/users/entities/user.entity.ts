import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  // Bcrypt hash. Excluded from queries by default; select explicitly when needed.
  @Column({ select: false })
  password: string;
}
