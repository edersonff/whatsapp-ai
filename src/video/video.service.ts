import { Injectable } from '@nestjs/common';
import { Service } from 'class/service/entity.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './entities/video.entity';
import { Axios } from 'axios';
import { VideoDetails } from 'types/youtube/details';

@Injectable()
export class VideoService extends Service<Video> {
  constructor(
    @InjectRepository(Video)
    repository: Repository<Video>,
  ) {
    super(repository);
  }

  async youtubeVideoDetails(link: string): Promise<VideoDetails> {
    const axios = new Axios({
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const { data: html } = await axios.get(link);

    const videoDetails = html
      .split('videoDetails":')[1]
      .split(',"annotations":')[0];

    const details = JSON.parse(videoDetails);

    return details;
  }
}
