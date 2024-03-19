import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { CategoryModule } from 'src/category/category.module';

@Module({
  imports: [CategoryModule],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
