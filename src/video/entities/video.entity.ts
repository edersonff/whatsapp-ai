import { Lang, lang } from 'types/language/enum';
import { Category } from 'src/category/entities/category.entity';

import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from 'src/post/entities/post.entity';

@Entity()
export class Video {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  tags?: string;

  @Column({ type: 'varchar', length: 72 })
  link: string;

  @Column({ type: 'varchar', length: 600, nullable: true })
  output?: string;

  @Column({
    type: 'enum',
    enum: lang,
  })
  originalLanguage: Lang;

  @Column({
    type: 'enum',
    enum: lang,
  })
  targetLanguage: Lang;

  @Column({
    type: 'enum',
    enum: ['draft', 'error', 'ready', 'published'],
    default: 'draft',
  })
  status: 'draft' | 'error' | 'ready' | 'published';

  @Column({ type: 'varchar', length: 96, nullable: true })
  error?: string;

  @ManyToOne(() => User, (user) => user.videos)
  user: User;

  @ManyToOne(() => Category, (category) => category.videos)
  category: Category;

  @OneToMany(() => Post, (post) => post.video)
  posts: Post[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
