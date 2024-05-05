import { config } from 'dotenv';
import { DataSourceOptions } from 'typeorm';

config();

export const dataSourceOptions: DataSourceOptions = {
  type: (process.env.DB_TYPE as 'postgres') || 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: +process.env.DB_PORT || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'root',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  database: process.env.DB_NAME || 'whatsapp-gpt',
  synchronize: process.env.DB_SYNC === 'true',
  logging: true,
  ssl: process.env.DB_SSL === 'true',
};
