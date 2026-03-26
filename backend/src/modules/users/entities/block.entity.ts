import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, Column } from 'typeorm';
import { User } from './user.entity';

@Entity('blocks')
export class Block {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.blockedUsers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blocker_id' })
  blocker!: User;

  @Column()
  blockerId!: string;

  @ManyToOne(() => User, (user) => user.blockedByUsers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blocked_user_id' })
  blockedUser!: User;

  @Column()
  blockedUserId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
