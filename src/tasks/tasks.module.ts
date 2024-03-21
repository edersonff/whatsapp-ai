import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { VideoModule } from 'src/video/video.module';
import { UsersModule } from 'src/users/users.module';
import { TaskController } from './tasks.controller';

@Module({
  imports: [VideoModule, UsersModule],
  controllers: [TaskController],
  exports: [TasksService],
  providers: [TasksService],
})
export class TasksModule {}
