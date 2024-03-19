import {
  Controller,
  Get,
  Post,
  Body,
  // Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';
// import { UpdateVideoDto } from './dto/update-video.dto';
import { CategoryService } from 'src/category/category.service';

@Controller('video')
export class VideoController {
  constructor(
    private readonly videoService: VideoService,
    private readonly categoryService: CategoryService,
  ) {}

  @Post()
  async create(@Body() { link }: CreateVideoDto) {
    const {
      title,
      keywords,
      shortDescription,
      thumbnail: { thumbnails },
    } = await this.videoService.youtubeVideoDetails(link);

    const thumbnail = thumbnails[thumbnails.length - 1].url;

    const tags = keywords.join(',');

    return this.videoService.create({
      name: title,
      tags,
      description: shortDescription,
      image: thumbnail,
      link,
    });
  }

  @Get()
  findAll() {
    return this.videoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.videoService.findOne({ id: +id });
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateVideoDto: UpdateVideoDto) {
  //   return this.videoService.update(+id, updateVideoDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.videoService.remove(+id);
  }
}
