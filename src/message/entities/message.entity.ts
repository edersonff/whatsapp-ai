import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'text' })
  answer: string;

  @ManyToOne(() => User, (user) => user.messages)
  user: User;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
