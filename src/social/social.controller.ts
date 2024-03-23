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
import axios from 'axios';

@UseGuards(AuthGuard)
@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Post()
  create(@Body() createSocialDto: CreateSocialDto, @Request() req) {
    this.socialService.setUserId(req.user.id);

    return this.socialService.create(createSocialDto);
  }

  @Post('tiktok')
  async tiktok(@Body() body, @Request() req) {
    const findTiktok = await this.socialService.findOne({
      type: 'tiktok',
      user: {
        id: req.user.id,
      },
    });

    const {
      data: { refresh_token },
    } = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', {
      grant_type: 'authorization_code',
      client_key: process.env.TIKTOK_CLIENT_KEY,
      client_secret: process.env.TIKTOK_CLIENT_SECRET,
      code: body.code,
      redirect_uri: process.env.TIKTOK_REDIRECT_URI,
    });

    if (findTiktok) {
      return this.socialService.update(findTiktok.id, {
        type: 'tiktok',
        token: refresh_token,
      });
    }

    return this.socialService.create({
      type: 'tiktok',
      token: refresh_token,
    });
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
