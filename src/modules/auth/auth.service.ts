import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { QueryFailedError } from 'typeorm';
import { UsersService } from '../users/users.service.js';
import { SignInDto, SignUpDto } from './dto/credentials.dto.js';
import { JwtPayload } from './jwt-payload.js';

const BCRYPT_ROUNDS = 12;
const PG_UNIQUE_VIOLATION = '23505';

export interface AuthResponse {
  accessToken: string;
}

@Injectable()
export class AuthService {
  // Compared against when the email is unknown, so sign-in takes the same
  // time whether or not the account exists.
  private readonly dummyHash = bcrypt.hashSync('dummy-password', BCRYPT_ROUNDS);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp({ email, password }: SignUpDto): Promise<AuthResponse> {
    if (await this.usersService.existsByEmail(email)) {
      throw new ConflictException('Email is already registered');
    }

    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    try {
      const user = await this.usersService.create(email, hash);
      return this.issueToken(user.id);
    } catch (error) {
      // Lost a race with a concurrent sign-up for the same email.
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === PG_UNIQUE_VIOLATION
      ) {
        throw new ConflictException('Email is already registered');
      }
      throw error;
    }
  }

  async signIn({ email, password }: SignInDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmailWithPassword(email);
    const valid = await bcrypt.compare(
      password,
      user?.password ?? this.dummyHash,
    );

    if (!user || !valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueToken(user.id);
  }

  private async issueToken(userId: string): Promise<AuthResponse> {
    const payload: JwtPayload = { sub: userId };
    return { accessToken: await this.jwtService.signAsync(payload) };
  }
}
