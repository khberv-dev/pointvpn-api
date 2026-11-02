import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { SessionPlatform } from '../entities/session.entity.js';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateSessionDto {
  @IsEnum(SessionPlatform)
  platform: SessionPlatform;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  fcmToken: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  deviceName: string;
}
