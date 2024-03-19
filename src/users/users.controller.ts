import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthService } from 'src/auth/auth.service';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Put('/')
  update(@Request() _req) {
    _req;
    // return this.authService.update(req.user.id);
  }

  @HttpCode(HttpStatus.CREATED)
  @Delete('/')
  delete(@Request() req) {
    return this.authService.remove(req.user.id);
  }
}
