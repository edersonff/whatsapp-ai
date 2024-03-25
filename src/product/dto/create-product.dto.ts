import { IsString, IsUrl } from 'class-validator';

export class CreateProductDto {
  @IsString()
  title?: string;

  @IsUrl()
  link: string;

  @IsString()
  comment: string;

  @IsString()
  privateMessage: string;

  @IsString()
  category: string;
}
