import { Injectable } from '@nestjs/common';
import { Service } from 'class/service/entity.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';

@Injectable()
export class PostService extends Service<Post> {
  constructor(
    @InjectRepository(Post)
    repository: Repository<Post>,
  ) {
    super(repository);
  }
}
