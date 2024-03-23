import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Social {
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

  @Column({ type: 'enum', enum: ['credentials', 'token'] })
  authType: 'credentials' | 'token';

  @Column({ type: 'varchar', length: 96, nullable: true })
  username?: string;

  @Column({ type: 'varchar', length: 96, nullable: true })
  password?: string;

  @Column({ type: 'varchar', length: 364, nullable: true })
  token?: string;

  @ManyToOne(() => User, (user) => user.videos)
  user: User;
}
