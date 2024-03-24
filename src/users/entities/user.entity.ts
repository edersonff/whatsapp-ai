import { Exclude } from 'class-transformer';
import { Product } from 'src/product/entities/product.entity';
import { Social } from 'src/social/entities/social.entity';
import { Video } from 'src/video/entities/video.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 96 })
  username: string;

  @Column({ type: 'varchar', length: 96 })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 144 })
  password: string;

  @OneToMany(() => Video, (video) => video.user)
  videos: Video[];

  @OneToMany(() => Social, (social) => social.user)
  socials: Social[];

  @OneToMany(() => Product, (product) => product.user)
  products: Product[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
