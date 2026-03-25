import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @Column()
  recipientId: string;

  @Column({ nullable: true })
  actorId: string;

  @Column({
    type: 'enum',
    enum: [
      'new_match',
      'message',
      'like',
      'comment',
      'follow',
      'stream_started',
      'stream_ended',
      'verification_approved',
      'verification_rejected',
      'post',
    ],
  })
  type: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  content: string;

  @Column({ nullable: true })
  relatedEntityId: string;

  @Column({ type: 'enum', enum: ['post', 'message', 'user', 'stream'], nullable: true })
  relatedEntityType: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
