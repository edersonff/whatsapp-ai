import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { Video } from './entities/video.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from 'src/category/category.module';

@Module({
  imports: [TypeOrmModule.forFeature([Video]), CategoryModule],
  exports: [TypeOrmModule, VideoService],
  controllers: [VideoController],
  providers: [VideoService],
})
export class VideoModule {}
