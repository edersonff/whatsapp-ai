import { Controller, Post } from '@nestjs/common';
import { SeedService } from './seed.service';
import { CategoryService } from 'src/category/category.service';

@Controller('seed')
export class SeedController {
  constructor(
    private readonly seedService: SeedService,
    private readonly categoryService: CategoryService,
  ) {}

  @Post('/category')
  create() {
    return this.categoryService.createMany([
      { label: 'Entretenimento', name: 'entertainment' },
      { label: 'Engraçado', name: 'funny' },
      { label: 'Curiosidades', name: 'curiosities' },
      { label: 'Notícias', name: 'news' },
      { label: 'Viral', name: 'viral' },
      { label: 'Tutorial', name: 'tutorial' },
    ]);
  }
}
