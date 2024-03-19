import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSocialDto {
  @IsEnum([
    'meta',
    'tiktok',
    'youtube',
    'pinterest',
    'instagram',
    'telegram',
    'snapchat',
    'twitter',
  ])
  type:
    | 'meta'
    | 'tiktok'
    | 'youtube'
    | 'pinterest'
    | 'instagram'
    | 'telegram'
    | 'snapchat'
    | 'twitter';

  @IsEnum(['credentials', 'token'])
  authType: 'credentials' | 'token';

  @IsString()
  @IsOptional()
  @MaxLength(80)
  username?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  password?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  token?: string;
}
