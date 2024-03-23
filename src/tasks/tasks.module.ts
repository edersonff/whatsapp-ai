import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { VideoModule } from 'src/video/video.module';
import { UsersModule } from 'src/users/users.module';
import { TaskController } from './tasks.controller';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [VideoModule, UsersModule, ProductModule],
  controllers: [TaskController],
  exports: [TasksService],
  providers: [TasksService],
})
export class TasksModule {}
