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

  @Column({ type: 'varchar', length: 64, nullable: true })
  name?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 72 })
  link: string;

  @Column({ type: 'enum', enum: ['youtube', 'tiktok', 'file'] })
  type: 'youtube' | 'tiktok' | 'file';

  @Column({ type: 'enum', enum: ['draft', 'error', 'published'] })
  status: 'draft' | 'error' | 'published';

  @Column({ type: 'varchar', length: 72, nullable: true })
  error?: string;

  @ManyToOne(() => User, (user) => user.videos)
  user: User;

  @OneToMany(() => Category, (category) => category.videos)
  category: Category;
}
