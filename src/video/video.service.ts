import { Injectable } from '@nestjs/common';
import { Service } from 'class/service/entity.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './entities/video.entity';

@Injectable()
export class VideoService extends Service<Video> {
  constructor(
    @InjectRepository(Video)
    repository: Repository<Video>,
  ) {
    super(repository);
  }
}
