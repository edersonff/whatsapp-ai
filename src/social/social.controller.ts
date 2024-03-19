import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SocialService } from './social.service';
import { CreateSocialDto } from './dto/create-social.dto';
import { UpdateSocialDto } from './dto/update-social.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Post()
  create(@Body() createSocialDto: CreateSocialDto, @Request() req) {
    this.socialService.setUserId(req.user.id);

    return this.socialService.create(createSocialDto);
  }

  @Get()
  findAll(@Request() req) {
    this.socialService.setUserId(req.user.id);
    return this.socialService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    this.socialService.setUserId(req.user.id);
    return this.socialService.findOne({ id: +id });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSocialDto: UpdateSocialDto,
    @Request() req,
  ) {
    this.socialService.setUserId(req.user.id);

    return this.socialService.update(id, updateSocialDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    this.socialService.setUserId(req.user.id);

    return this.socialService.remove({
      id: +id,
    });
  }
}
