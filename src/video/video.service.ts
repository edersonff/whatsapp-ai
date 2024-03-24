import { Injectable } from '@nestjs/common';
import { Service } from 'class/service/entity.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './entities/video.entity';
import { Axios } from 'axios';
import { translate } from 'bing-translate-api';
import { Lang } from 'types/language/enum';

@Injectable()
export class VideoService extends Service<Video> {
  constructor(
    @InjectRepository(Video)
    repository: Repository<Video>,
  ) {
    super(repository);
  }

  async youtubeVideoDetails(link: string, from: Lang, to: Lang) {
    const axios = new Axios({
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const { data: html } = await axios.get(link);

    const videoDetails = html
      .split('videoDetails":')[1]
      .split(',"playerConfig"')[0];

    const details = JSON.parse(videoDetails);

    details.title = await this.translateText(details.title, from, to);
    details.shortDescription = await this.translateText(
      details.shortDescription,
      from,
      to,
    );
    details.keywords = await this.translateText(
      details?.keywords?.join(','),
      from,
      to,
    );

    console.log(details);

    return details;
  }

  private translateText = async (
    text: string | undefined,
    from: Lang,
    to: Lang,
  ) => {
    if (!text || text === '') {
      return '';
    }

    const hashtagsTexts = text?.match(/#[a-zA-Z0-9]+/g) || [];

    const textWithoutHashtags = text?.replace(/#[a-zA-Z0-9]+/g, '');

    const translatedText = await translate(textWithoutHashtags, from, to);

    const translation = translatedText?.translation || textWithoutHashtags;

    return translation + ' ' + hashtagsTexts?.join(' ');
  };
}
