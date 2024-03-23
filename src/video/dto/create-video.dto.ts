import { IsEnum, IsString, MaxLength } from 'class-validator';
import { Lang, lang } from 'types/language/enum';

export class CreateVideoDto {
  @MaxLength(72)
  @IsString()
  link: string;

  @IsString()
  category: string;

  @IsEnum(lang)
  originalLanguage: Lang;

  @IsEnum(lang)
  targetLanguage: Lang;
}
