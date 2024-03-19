import { config } from 'dotenv';
import { Category } from 'src/category/entities/category.entity';
import { Product } from 'src/product/entities/product.entity';
import { Social } from 'src/social/entities/social.entity';
import { User } from 'src/users/entities/user.entity';
import { Video } from 'src/video/entities/video.entity';
import { DataSourceOptions } from 'typeorm';

config();

export const dataSourceOptions: DataSourceOptions = {
  type: (process.env.DB_TYPE as 'postgres') || 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: +process.env.DB_PORT || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'root',
  entities: [User, Video, Category, Social, Product],
  database: process.env.DB_NAME || 'sociable-ai',
  synchronize: process.env.DB_SYNC === 'true',
  logging: true,
  ssl: process.env.DB_SSL === 'true',
};
