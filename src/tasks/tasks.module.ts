import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { VideoModule } from 'src/video/video.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [VideoModule, UsersModule],
  exports: [TasksService],
  providers: [TasksService],
})
export class TasksModule {}
