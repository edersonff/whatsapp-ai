import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoryModule } from './category/category.module';
import { VideoModule } from './video/video.module';
import { SocialModule } from './social/social.module';
import { ProductModule } from './product/product.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';
import { dataSourceOptions } from './db/data-source';
import { SeedModule } from './seed/seed.module';
import { PostModule } from './post/post.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(dataSourceOptions),
    AuthModule,
    UsersModule,
    CategoryModule,
    VideoModule,
    SocialModule,
    ProductModule,
    TasksModule,
    SeedModule,
    PostModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
