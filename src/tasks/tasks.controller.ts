import { Controller, Post } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('task')
export class TaskController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('/publish')
  async publishVideosCron() {
    await this.tasksService.publishVideosCron();
  }

  @Post('/render')
  async renderVideosCron() {
    await this.tasksService.renderVideosCron();
  }
}
