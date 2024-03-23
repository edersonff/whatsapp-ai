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
  @MaxLength(96)
  username?: string;

  @IsString()
  @IsOptional()
  @MaxLength(96)
  password?: string;

  @IsString()
  @IsOptional()
  @MaxLength(364)
  token?: string;
}
