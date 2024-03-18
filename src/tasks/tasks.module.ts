import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { VideoModule } from 'src/video/video.module';
import { VideoService } from 'src/video/video.service';

@Module({
  imports: [VideoModule],
  exports: [TasksService],
  providers: [TasksService, VideoService],
})
export class TasksModule {}
