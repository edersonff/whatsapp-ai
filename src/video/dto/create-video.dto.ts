import { IsEnum, IsString } from 'class-validator';
import { Lang, lang } from 'types/language/enum';

export class CreateVideoDto {
  @IsString()
  link: string;

  @IsString()
  category: string;

  @IsEnum(lang)
  originalLanguage: Lang;

  @IsEnum(lang)
  targetLanguage: Lang;
}
