import { Message } from 'src/message/entities/message.entity';
import { Subscription } from 'src/subscription/entities/subscription.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30 })
  jid: string;

  @Column({ type: 'int' })
  usage: number;

  @OneToOne(() => Subscription, (subscription) => subscription.user)
  @JoinColumn({ name: 'subscriptionId' })
  subscription: Subscription;

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
