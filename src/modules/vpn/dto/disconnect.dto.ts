import { IsOptional, IsString, MaxLength } from 'class-validator';

export class DisconnectDto {
  /** Required for anonymous requests; optional when authenticated. */
  @IsOptional()
  @IsString()
  @MaxLength(128)
  publicKey?: string;
}
