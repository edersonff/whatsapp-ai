import { Category } from 'src/category/entities/category.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  title?: string;

  @Column({ type: 'varchar', length: 255 })
  link: string;

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'text' })
  privateMessage: string;

  @ManyToOne(() => User, (user) => user.videos)
  user: User;

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;
}
