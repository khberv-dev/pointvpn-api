import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  existsByEmail(email: string): Promise<boolean> {
    return this.usersRepository.existsBy({ email });
  }

  /** Returns the user including the password hash. */
  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async create(email: string, passwordHash: string): Promise<User> {
    const user = await this.usersRepository.save(
      this.usersRepository.create({ email, password: passwordHash }),
    );
    return { id: user.id, email: user.email } as User;
  }
}
