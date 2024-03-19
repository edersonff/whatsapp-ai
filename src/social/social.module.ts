import { Module } from '@nestjs/common';
import { SocialService } from './social.service';
import { SocialController } from './social.controller';
import { Social } from './entities/social.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Social])],
  exports: [TypeOrmModule, SocialService],
  providers: [SocialService],
  controllers: [SocialController],
})
export class SocialModule {}
