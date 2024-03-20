import {
  Controller,
  Get,
  Post,
  Body,
  // Patch,
  Param,
  Delete,
  Request,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';
// import { UpdateVideoDto } from './dto/update-video.dto';
import { CategoryService } from 'src/category/category.service';
import { UpdateVideoDto } from './dto/update-video.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('video')
export class VideoController {
  constructor(
    private readonly videoService: VideoService,
    private readonly categoryService: CategoryService,
  ) {}

  @Post()
  async create(
    @Body()
    { link, category, originalLanguage, targetLanguage }: CreateVideoDto,
    @Request() req,
  ) {
    this.videoService.setUserId(req.user.id);

    const {
      title,
      keywords,
      shortDescription,
      thumbnail: { thumbnails },
    } = await this.videoService.youtubeVideoDetails(link);

    const thumbnail = thumbnails[thumbnails.length - 1].url;

    const tags = keywords.join(',');

    const foundCategory = await this.findCategory(category);

    return this.videoService.create({
      name: title,
      tags,
      description: shortDescription,
      image: thumbnail,
      link,
      originalLanguage,
      targetLanguage,
      category: foundCategory,
    });
  }

  @Get()
  findAll(@Request() req) {
    this.videoService.setUserId(req.user.id);
    return this.videoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    this.videoService.setUserId(req.user.id);

    return this.videoService.findOne({ id: +id });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    { category, link, originalLanguage, targetLanguage }: UpdateVideoDto,
    @Request() req,
  ) {
    this.videoService.setUserId(req.user.id);

    const {
      title,
      keywords,
      shortDescription,
      thumbnail: { thumbnails },
    } = await this.videoService.youtubeVideoDetails(link);

    const thumbnail = thumbnails[thumbnails.length - 1].url;

    const tags = keywords.join(',');

    const foundCategory = await this.findCategory(category);

    return this.videoService.update(+id, {
      name: title,
      tags,
      description: shortDescription,
      image: thumbnail,
      link,
      originalLanguage,
      targetLanguage,
      category: foundCategory,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    this.videoService.setUserId(req.user.id);

    return this.videoService.remove(+id);
  }

  private async findCategory(category: string) {
    const findCategory = await this.categoryService.findOne({
      name: category,
    });

    if (!findCategory) {
      throw new Error('Category not found');
    }

    return findCategory;
  }
}
