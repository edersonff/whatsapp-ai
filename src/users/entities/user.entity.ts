import { Exclude } from 'class-transformer';
import { Product } from 'src/product/entities/product.entity';
import { Social } from 'src/social/entities/social.entity';
import { Video } from 'src/video/entities/video.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 48 })
  username: string;

  @Column({ type: 'varchar', length: 64 })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 72 })
  password: string;

  @OneToMany(() => Video, (video) => video.user)
  videos: Video[];

  @OneToMany(() => Social, (social) => social.user)
  socials: Social[];

  @OneToMany(() => Product, (product) => product.user)
  products: Product[];
}
