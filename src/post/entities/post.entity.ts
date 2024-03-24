import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Video } from 'src/video/entities/video.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: [
      'meta',
      'tiktok',
      'youtube',
      'pinterest',
      'instagram',
      'telegram',
      'snapchat',
      'twitter',
    ],
  })
  type:
    | 'meta'
    | 'tiktok'
    | 'youtube'
    | 'pinterest'
    | 'instagram'
    | 'telegram'
    | 'snapchat'
    | 'twitter';

  @Column({ type: 'varchar', length: 96, nullable: true })
  code?: string;

  @Column({ type: 'varchar', length: 96, nullable: true })
  link?: string;

  @Column({
    type: 'enum',
    enum: ['draft', 'error', 'commented'],
    default: 'draft',
  })
  status: 'draft' | 'error' | 'commented';

  @ManyToOne(() => User, (user) => user.videos)
  user: User;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Video, (video) => video.posts)
  video: Video;
}
