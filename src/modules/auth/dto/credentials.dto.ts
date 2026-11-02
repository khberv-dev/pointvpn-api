import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

const normalizeEmail = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class SignUpDto {
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(254)
  email: string;

  // bcrypt only uses the first 72 bytes of input.
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}

export class SignInDto {
  @Transform(normalizeEmail)
  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(72)
  password: string;
}
