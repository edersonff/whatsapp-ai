import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { CategoryModule } from './category/category.module';
import { VideoModule } from './video/video.module';
import { SocialModule } from './social/social.module';
import { ProductModule } from './product/product.module';
import { Video } from './video/entities/video.entity';
import { Category } from './category/entities/category.entity';
import { Social } from './social/entities/social.entity';
import { Product } from './product/entities/product.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: (process.env.DB_TYPE as 'mysql') || 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: +process.env.DB_PORT || 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || 'root',
      entities: [User, Video, Category, Social, Product],
      database: process.env.DB_NAME || 'sociable-ai',
      synchronize: false,
      logging: true,
      ssl: process.env.DB_SSL === 'true',
    }),
    AuthModule,
    UsersModule,
    CategoryModule,
    VideoModule,
    SocialModule,
    ProductModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
