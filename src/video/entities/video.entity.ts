import { Lang, lang } from 'types/language/enum';
import { Category } from 'src/category/entities/category.entity';

import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Video {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 192, nullable: true })
  name?: string;

  @Column({ type: 'varchar', length: 192, nullable: true })
  image?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  tags?: string;

  @Column({ type: 'varchar', length: 72 })
  link: string;

  @Column({ type: 'varchar', length: 96 })
  output: string;

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

  @Column({ type: 'enum', enum: ['draft', 'error', 'ready', 'published'] })
  status: 'draft' | 'error' | 'ready' | 'published';

  @Column({ type: 'varchar', length: 72, nullable: true })
  error?: string;

  @ManyToOne(() => User, (user) => user.videos)
  user: User;

  @ManyToOne(() => Category, (category) => category.videos)
  category: Category;
}
