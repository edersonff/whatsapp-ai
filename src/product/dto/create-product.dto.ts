import { IsEmail, IsString, IsUrl } from 'class-validator';

export class CreateProductDto {
  @IsEmail()
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
